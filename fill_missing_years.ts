import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const PDF_JOBS = [
    { year: "2024-25", path: "outcome_24_25.pdf" },
    { year: "2025-26", path: "outcome_25_26.pdf" },
    { year: "2026-27", path: "outcome_26_27.pdf" }
];

async function ingestData(data: any[]) {
    let count = 0;
    for (const item of data) {
        try {
            const ministry = await prisma.ministry.upsert({
                where: { name: item.ministry_name },
                update: {},
                create: {
                    name: item.ministry_name,
                    shortCode: (item.ministry_short_code || item.ministry_name || "M").substring(0, 5).toUpperCase(),
                    color: "#3b82f6",
                    sector: (Object.values(Sector).includes(item.sector as Sector) ? item.sector : Sector.OTHER) as Sector
                }
            });

            const department = await prisma.department.upsert({
                where: { name_ministryId: { name: item.department_name, ministryId: ministry.id } },
                update: {},
                create: { name: item.department_name, ministryId: ministry.id }
            });

            // Fuzzy check name
            let foundScheme = await prisma.scheme.findFirst({
                where: { 
                    name: { equals: item.scheme_name, mode: 'insensitive' },
                    departmentId: department.id 
                }
            });

            let schemeId;
            if (foundScheme) {
                schemeId = foundScheme.id;
            } else {
                const newScheme = await prisma.scheme.create({
                    data: {
                        name: item.scheme_name,
                        departmentId: department.id,
                        priorityCategory: (Object.values(PriorityCategory).includes(item.priority_category as PriorityCategory) ? item.priority_category : PriorityCategory.INFRASTRUCTURE) as PriorityCategory
                    }
                });
                schemeId = newScheme.id;
            }

            await prisma.budgetAllocation.upsert({
                where: {
                    schemeId_fiscalYear: {
                        schemeId,
                        fiscalYear: item.fiscal_year
                    }
                },
                update: {
                    allocated: Number(item.BE) || 0,
                    revisedEstimate: Number(item.RE) || 0,
                    utilized: Number(item.Actuals || item.Actual) || 0,
                },
                create: {
                    schemeId, fiscalYear: item.fiscal_year,
                    allocated: Number(item.BE) || 0, revisedEstimate: Number(item.RE) || 0,
                    utilized: Number(item.Actuals || item.Actual) || 0, 
                    utilizedCapital: 0, utilizedRevenue: 0, allocatedCapital: 0, allocatedRevenue: 0, 
                    expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                }
            });

            // Handle OutputData and OutcomeData if possible
            if (item.output_target && item.output_achieved) {
                await prisma.outputData.upsert({
                    where: { schemeId_fiscalYear: { schemeId, fiscalYear: item.fiscal_year } },
                    update: {
                        physicalTargetValue: Number(item.output_target),
                        physicalAchievedValue: Number(item.output_achieved),
                        physicalUnit: item.output_unit || "Unit"
                    },
                    create: {
                        schemeId, fiscalYear: item.fiscal_year,
                        physicalTargetValue: Number(item.output_target),
                        physicalAchievedValue: Number(item.output_achieved),
                        physicalUnit: item.output_unit || "Unit",
                        beneficiaryTarget: 0, beneficiaryAchieved: 0,
                        timelinessScore: 0, qualityComplianceScore: 0, geoDistributionIndex: 0
                    }
                });
            }

            count++;
        } catch (ingErr) {
            console.error(`  [!] Error ingesting item for ${item.scheme_name}:`, (ingErr as Error).message);
        }
    }
    return count;
}

async function processPdf(job: { year: string, path: string }) {
    console.log(`\nLOG: Starting Ingestion for ${job.year} (File: ${job.path})`);
    if (!fs.existsSync(job.path)) {
        console.warn(`LOG: File not found: ${job.path}`);
        return 0;
    }

    const pdfBuffer = fs.readFileSync(job.path);
    const pdfBase64 = pdfBuffer.toString('base64');

    const prompt = `Extract all budget data from this Indian Government Outcome Budget PDF.
    Extract: ministry_name, sector, department_name, scheme_name, fiscal_year, BE (Allocated Budget), RE (Revised Estimate), Actuals (Expenditure), output_target, output_achieved, output_unit (if available).
    Return a JSON array covering major schemes found. Multiple fiscal years may be present.
    JSON schema: [ { ministry_name, sector, department_name, scheme_name, fiscal_year, BE, RE, Actuals, output_target, output_achieved, output_unit } ]`;

    const result = await model.generateContent([
        { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
        { text: prompt }
    ]);

    let text = result.response.text();
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
         console.error("LOG: Failed to extract valid JSON from Gemini response");
         return 0;
    }
    const jsonData = JSON.parse(jsonMatch[0]);
    console.log(`LOG: Extracted ${jsonData.length} records.`);
    
    return await ingestData(jsonData);
}

async function main() {
    for (const job of PDF_JOBS) {
        try {
            const count = await processPdf(job);
            console.log(`LOG: Ingested ${count} records from ${job.year}`);
            console.log("LOG: Waiting for next job...");
            await new Promise(r => setTimeout(r, 5000));
        } catch (e: any) {
            console.error(`LOG Error in ${job.year}:`, e.message);
        }
    }
    console.log("\n✅ Filling years complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
