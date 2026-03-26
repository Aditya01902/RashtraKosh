import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PDF_JOBS = [
    { year: "2020-21", path: "outcome_20_21.pdf" },
    { year: "2021-22", path: "outcome_21_22.pdf" },
    { year: "2022-23", path: "outcome_22_23.pdf" },
    { year: "2023-24", path: "outcome_23_24.pdf" },
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

            const foundScheme = await prisma.scheme.findFirst({
                where: { name: item.scheme_name, departmentId: department.id }
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
            count++;
        } catch (ingErr) {}
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

    const prompt = `Extract all budget data (ministry, department, scheme, fiscal_year, BE, RE, Actual expenditure) from this Outcome Budget PDF.
Return a large JSON array covering all schemes. 
Extract data for multiple fiscal years found (usually the current BE and past Actuals/RE).
Scheme Names must match exactly as written in the document.
JSON schema: [ { ministry_name, sector, department_name, scheme_name, fiscal_year, BE, RE, Actuals } ]`;

    const result = await model.generateContent([
        { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
        prompt
    ]);

    const jsonData = JSON.parse(result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    console.log(`LOG: Extracted ${jsonData.length} records.`);
    
    return await ingestData(jsonData);
}

async function main() {
    for (const job of PDF_JOBS) {
        try {
            const count = await processPdf(job);
            console.log(`LOG: Ingested ${count} records from ${job.year}`);
            // Wait to respect RPM limits
            console.log("LOG: Waiting 20s for next job...");
            await new Promise(r => setTimeout(r, 20000));
        } catch (e: any) {
            console.error(`LOG Error in ${job.year}:`, e.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
