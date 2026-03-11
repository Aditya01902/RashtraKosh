import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { extractOOMFData } from '@/lib/ai-extractor';
import fs from 'fs';
import path from 'path';
import os from 'os';

const prisma = new PrismaClient();

const EXTRACTION_JOBS = [
    {
        year: "2024-25",
        url: "https://www.indiabudget.gov.in/budget2024-25/doc/OutcomeBudgetE2024_2025.pdf",
        model: "gemini-3-flash-preview"
    },
    {
        year: "2023-24",
        url: "https://www.indiabudget.gov.in/budget2023-24/doc/OutcomeBudgetE2023_2024.pdf",
        model: "gemini-3.1-flash-lite-preview"
    },
    {
        year: "2022-23",
        url: "https://www.indiabudget.gov.in/budget2022-23/doc/OutcomeBudgetE2022_2023.pdf",
        model: "gemini-2.5-flash"
    }
];

export async function POST() {
    try {
        console.log(`[IngestPipeline] Initiating Multi-Year pipeline for ${EXTRACTION_JOBS.length} jobs.`);

        // Track the overall run states
        let totalSchemesUpdated = 0;
        let allAnomalies: string[] = [];
        let auditReportChunks: string[] = [];

        for (const job of EXTRACTION_JOBS) {
            console.log(`\n===========================================`);
            console.log(`[IngestPipeline] Processing FY ${job.year} with ${job.model} from ${job.url}`);

            // 1. Fetching the Official PDF (or using local fallback if fetch fails)
            let pdfBuffer: Buffer;
            try {
                // Fetching exactly as browser would to bypass 404 HEAD blocking
                const response = await fetch(job.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                pdfBuffer = Buffer.from(arrayBuffer);
                console.log(`[IngestPipeline] ${job.year} PDF downloaded. Size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
            } catch (fetchErr) {
                console.warn(`[IngestPipeline] Failed fetching remote URL for ${job.year}. Passing empty buffer to trigger sim fallback.`);
                pdfBuffer = Buffer.from("");
            }

            // 2. Document Parsing
            let pdfText = "";
            try {
                if (pdfBuffer.length > 0) {
                    console.log(`[IngestPipeline] Running pdf-parse on ${job.year} document...`);
                    const { PDFParse } = eval('require')('pdf-parse');
                    const parser = new PDFParse({ data: pdfBuffer });
                    const parsed = await parser.getText();
                    await parser.destroy();
                    pdfText = parsed.text;
                    console.log(`[IngestPipeline] Extraction complete. Parsed ${pdfText.length} characters.`);
                } else {
                    pdfText = "MOCK TEXT GENERATED FOR SIMULATION.";
                }
            } catch (parseErr) {
                console.error(`[IngestPipeline] PDF Parsing Failed for ${job.year}:`, parseErr);
                continue; // Skip this year and move to the next
            }

            // 3. AI Extraction & Mapping (with specific model injection)
            console.log(`[IngestPipeline] Dispatching text to ${job.model} for OOMF matrix extraction...`);
            let data, rawResponse;
            try {
                const extraction = await extractOOMFData(pdfText, job.model);
                data = extraction.data;
                rawResponse = extraction.rawResponse;
                console.log(`[IngestPipeline] AI Extracted ${data.length} priority schemes for ${job.year}.`);
            } catch (e: any) {
                console.error(`[IngestPipeline] Error extracting data for ${job.year}:`, e.message);
                continue;
            }

            // 4. Database Upsertion Context for Specific Fiscal Year
            let processedCount = 0;
            const jobAnomalies: string[] = [];

            for (const alloc of data) {
                const scheme = await prisma.scheme.findFirst({
                    where: { name: alloc.scheme_name_mapped }
                });

                if (scheme) {
                    await prisma.budgetAllocation.upsert({
                        where: {
                            schemeId_fiscalYear: {
                                schemeId: scheme.id,
                                fiscalYear: job.year
                            }
                        },
                        update: {
                            allocated: alloc.BE || 0,
                            revisedEstimate: alloc.RE || 0,
                            utilized: alloc.Actuals || 0,
                            allocatedCapital: alloc.Capital || 0,
                            allocatedRevenue: alloc.Revenue || 0,
                            anomalyFlag: alloc.anomaly_flag || false
                        },
                        create: {
                            schemeId: scheme.id,
                            fiscalYear: job.year,
                            allocated: alloc.BE || 0,
                            revisedEstimate: alloc.RE || 0,
                            utilized: alloc.Actuals || 0,
                            allocatedCapital: alloc.Capital || 0,
                            allocatedRevenue: alloc.Revenue || 0,
                            utilizedCapital: 0,
                            utilizedRevenue: 0,
                            expenditureQ1: 0,
                            expenditureQ2: 0,
                            expenditureQ3: 0,
                            expenditureQ4: 0,
                            surrendered: 0,
                            anomalyFlag: alloc.anomaly_flag || false
                        }
                    });

                    processedCount++;
                    totalSchemesUpdated++;
                    if (alloc.anomaly_flag) {
                        jobAnomalies.push(alloc.scheme_name_mapped);
                        allAnomalies.push(`${job.year}: ${alloc.scheme_name_mapped}`);
                    }
                }
            }

            // Collect audit chunks per year
            auditReportChunks.push(`
### FY ${job.year} (Generated by ${job.model})
- Target URL: ${job.url}
- Extracted Characters: ${pdfText.length}
- Matched Schemes: ${processedCount}
- Anomalies Discovered: ${jobAnomalies.length > 0 ? jobAnomalies.join(", ") : "None"}

**Raw Structured Output**:
\`\`\`json
${rawResponse}
\`\`\`
            `);
        }

        // 5. Final Audit Generation
        const auditLogTitle = `Multi-Year AI Ingestion Run - ${new Date().toISOString()}`;
        const finalAuditContent = `# Automated Multi-Year Ingestion Report\n\n${auditReportChunks.join("\n---\n")}`;

        const auditLog = await prisma.auditLog.create({
            data: {
                title: auditLogTitle,
                content: finalAuditContent,
            }
        });

        // Clear necessary caches
        await fetch('http://localhost:3001/api/ministries', { method: 'GET' }).catch(() => { });

        return NextResponse.json({
            success: true,
            status: 'Multi-Year Pipeline Finished',
            schemesUpdated: totalSchemesUpdated,
            anomalies: allAnomalies,
            auditLogId: auditLog.id
        });

    } catch (error: any) {
        console.error("[IngestPipeline] Fatal Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
