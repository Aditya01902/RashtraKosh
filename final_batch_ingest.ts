import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PDF_JOBS = [
    { year: "2019-20", path: "outcome_20_21.pdf" }, // Usually has prior 2 years Actuals
    { year: "2021-22", path: "outcome_21_22.pdf" },
    { year: "2022-23", path: "outcome_22_23.pdf" },
    { year: "2023-24", path: "outcome_23_24.pdf" }
];

function normalizeYear(y: string): string {
    if (typeof y !== 'string') return "2024-25";
    // If it's "2024-2025" -> "2024-25"
    if (y.length === 9 && y.includes("-")) {
        const parts = y.split("-");
        return `${parts[0]}-${parts[1].substring(2)}`;
    }
    return y;
}

async function ingestItem(item: any) {
    try {
        const fy = normalizeYear(item.fiscal_year);
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

        const dept = await prisma.department.upsert({
            where: { name_ministryId: { name: item.department_name, ministryId: ministry.id } },
            update: {},
            create: { name: item.department_name, ministryId: ministry.id }
        });

        const existingScheme = await prisma.scheme.findFirst({
            where: { name: item.scheme_name, departmentId: dept.id }
        });

        let sId;
        if (existingScheme) {
            sId = existingScheme.id;
        } else {
            const ns = await prisma.scheme.create({
                data: {
                    name: item.scheme_name,
                    departmentId: dept.id,
                    priorityCategory: (Object.values(PriorityCategory).includes(item.priority_category as PriorityCategory) ? item.priority_category : PriorityCategory.INFRASTRUCTURE) as PriorityCategory
                }
            });
            sId = ns.id;
        }

        await prisma.budgetAllocation.upsert({
            where: { schemeId_fiscalYear: { schemeId: sId, fiscalYear: fy } },
            update: {
                allocated: Number(item.BE) || 0,
                revisedEstimate: Number(item.RE) || 0,
                utilized: Number(item.Actuals || item.Actual) || 0,
            },
            create: {
                schemeId: sId, fiscalYear: fy,
                allocated: Number(item.BE) || 0, revisedEstimate: Number(item.RE) || 0,
                utilized: Number(item.Actuals || item.Actual) || 0, 
                utilizedCapital: 0, utilizedRevenue: 0, allocatedCapital: 0, allocatedRevenue: 0, 
                expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
            }
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log("LOG: Initiating Sequential Extraction...");
    for (const job of PDF_JOBS) {
        if (!fs.existsSync(job.path)) continue;
        console.log(`\nLOG: Processing ${job.path}...`);
        
        try {
            const pdfBase64 = fs.readFileSync(job.path).toString('base64');
            const result = await model.generateContent([
                { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
                "Extract all Outcomes/Actuals/BE tables into JSON [ { ministry_name, sector, department_name, scheme_name, fiscal_year (YYYY-YY), BE, RE, Actuals } ]."
            ]);

            const jsonData = JSON.parse(result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
            console.log(`LOG: Items extracted: ${jsonData.length}`);
            
            let ok = 0;
            for (const item of jsonData) {
                if (await ingestItem(item)) ok++;
            }
            console.log(`LOG: Successfully ingested ${ok} records for ${job.path}`);
            await new Promise(r => setTimeout(r, 15000));
        } catch (jobErr: any) {
            console.error(`LOG FAIL: ${job.path}: ${jobErr.message}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
