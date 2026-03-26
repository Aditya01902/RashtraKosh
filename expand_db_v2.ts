import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const LATEST_PDFS = ["outcome_26_27.pdf", "outcome_25_26.pdf", "outcome_24_25.pdf"];

async function ingestData(data: any[]) {
    let newCount = 0;
    for (const item of data) {
        try {
            // Ministry upsert
            const ministry = await prisma.ministry.upsert({
                where: { name: item.ministry_name },
                update: {},
                create: {
                    name: item.ministry_name,
                    shortCode: (item.ministry_short_code || item.ministry_name || "M").substring(0, 5).toUpperCase(),
                    color: "#6b7280",
                    sector: Sector.OTHER
                }
            });

            // Department upsert
            const department = await prisma.department.upsert({
                where: { name_ministryId: { name: item.department_name, ministryId: ministry.id } },
                update: {},
                create: { name: item.department_name, ministryId: ministry.id }
            });

            // Scheme find or create
            let scheme = await prisma.scheme.findFirst({
                where: { name: { equals: item.scheme_name, mode: 'insensitive' }, departmentId: department.id }
            });

            if (!scheme) {
                scheme = await prisma.scheme.create({
                    data: {
                        name: item.scheme_name,
                        departmentId: department.id,
                        priorityCategory: PriorityCategory.INFRASTRUCTURE
                    }
                });
                newCount++;
            }

            // Allocation upsert (Multiple years might be present)
            const fy = item.fiscal_year; // e.g. "2024-25"
            const allocated = Number(item.BE) || 0;
            const utilized = Number(item.Actuals || item.Actual || item.RE || 0);

            await prisma.budgetAllocation.upsert({
                where: { schemeId_fiscalYear: { schemeId: scheme.id, fiscalYear: fy } },
                update: {
                    allocated: allocated,
                    utilized: utilized,
                    revisedEstimate: Number(item.RE) || null
                },
                create: {
                    schemeId: scheme.id,
                    fiscalYear: fy,
                    allocated: allocated,
                    utilized: utilized,
                    revisedEstimate: Number(item.RE) || null,
                    allocatedCapital: 0, allocatedRevenue: 0,
                    utilizedCapital: 0, utilizedRevenue: 0,
                    expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0,
                    surrendered: 0
                }
            });

        } catch (e) {
            // console.error(e);
        }
    }
    return newCount;
}

async function main() {
    let totalNew = 0;
    // Iterate through first few pages or major sections
    for (const pdfFile of LATEST_PDFS) {
        console.log(`LOG: Processing ${pdfFile}...`);
        if (!fs.existsSync(pdfFile)) continue;
        
        const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
        const prompt = `
        This is a massive government Outcome Budget PDF.
        Find and extract at least 40 MAJOR schemes' data (ministry_name, department_name, scheme_name, fiscal_year, BE, RE, Actuals).
        Extract multiple years for each where available (e.g. BE 2026-27, RE/Actuals 2025-26, etc.).
        Return as a large JSON array.
        Target: At least 40 schemes per response.
        JSON format: [ { ministry_name, department_name, scheme_name, fiscal_year, BE, RE, Actuals } ]
        Output JSON only.
        `;

        try {
            const result = await model.generateContent([
                { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
                { text: prompt }
            ]);

            const text = result.response.text();
            const jsonPart = text.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0];
            if (jsonPart) {
                const data = JSON.parse(jsonPart);
                const count = await ingestData(data);
                totalNew += count;
                console.log(`LOG: Extracted ${data.length} records (${count} new schemes) from ${pdfFile}`);
            }
        } catch (e) {
            console.error(`Error processing ${pdfFile}:`, e);
        }
    }

    console.log(`\n🎉 Total NEW schemes successfully acquired: ${totalNew}`);

    // Cleanup phase: "Delete ones whose expenditure was not available"
    // We check for the last 3 years. If they don't have expenditure (utilized > 0) in at least one of them, delete.
    console.log("LOG: Cleaning up schemes with no expenditure data...");
    const schemes = await prisma.scheme.findMany({
        include: { budgetAllocations: true }
    });

    let removed = 0;
    for (const scheme of schemes) {
        const hasExpenditure = scheme.budgetAllocations.some(b => Number(b.utilized) > 0);
        if (!hasExpenditure) {
            console.log(`Removing ${scheme.name} - No expenditure data found.`);
            await prisma.scheme.delete({ where: { id: scheme.id } });
            removed++;
        }
    }
    console.log(`LOG: Removed ${removed} schemes with zero expenditure.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
