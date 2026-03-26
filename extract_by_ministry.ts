import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const PDF_JOBS = [
    { year: "2026-27", path: "outcome_26_27.pdf" },
    { year: "2025-26", path: "outcome_25_26.pdf" },
    { year: "2024-25", path: "outcome_24_25.pdf" }
];

const MINISTRIES = [
    "Agriculture", "Health", "Rural Development", "Education", "Home Affairs", 
    "Railways", "Road Transport", "Power", "Defence", "External Affairs",
    "Commerce", "Finance", "Social Justice", "Labor", "Urban Development"
];

async function ingestData(data: any[]) {
    let newSchemes = 0;
    for (const item of data) {
        try {
            const mName = item.ministry_name || "Unknown";
            const dName = item.department_name || mName;
            const sName = item.scheme_name;

            if (!sName) continue;

            const ministry = await prisma.ministry.upsert({
                where: { name: mName },
                update: {},
                create: { name: mName, shortCode: mName.substring(0, 5).toUpperCase(), color: "#3b82f6", sector: Sector.OTHER }
            });

            const department = await prisma.department.upsert({
                where: { name_ministryId: { name: dName, ministryId: ministry.id } },
                update: {},
                create: { name: dName, ministryId: ministry.id }
            });

            let scheme = await prisma.scheme.findFirst({
                where: { name: { equals: sName, mode: 'insensitive' }, departmentId: department.id }
            });

            if (!scheme) {
                scheme = await prisma.scheme.create({
                    data: { name: sName, departmentId: department.id, priorityCategory: PriorityCategory.INFRASTRUCTURE }
                });
                newSchemes++;
            }

            // Upsert Allocation
            const fy = item.fiscal_year; // format YYYY-YY
            if (fy) {
                await prisma.budgetAllocation.upsert({
                    where: { schemeId_fiscalYear: { schemeId: scheme.id, fiscalYear: fy } },
                    update: {
                        allocated: Number(item.BE) || 0,
                        utilized: Number(item.Actuals || item.Actual || item.RE || 0),
                        revisedEstimate: Number(item.RE) || null
                    },
                    create: {
                        schemeId: scheme.id, fiscalYear: fy,
                        allocated: Number(item.BE) || 0,
                        utilized: Number(item.Actuals || item.Actual || item.RE || 0),
                        revisedEstimate: Number(item.RE) || null,
                        allocatedCapital: 0, allocatedRevenue: 0,
                        utilizedCapital: 0, utilizedRevenue: 0,
                        expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                    }
                });
            }
        } catch (err) {}
    }
    return newSchemes;
}

async function main() {
    console.log("LOG: Starting In-depth Ministry-wise Extraction...");
    let overallNew = 0;

    for (const ministrySearch of MINISTRIES) {
        console.log(`LOG: Targeting ${ministrySearch}...`);
        
        // Use newest PDF for BE/RE
        const pdfFile = "outcome_26_27.pdf";
        if (!fs.existsSync(pdfFile)) continue;

        const pdfBuffer = fs.readFileSync(pdfFile);
        const pdfBase64 = pdfBuffer.toString('base64');

        const prompt = `Find all schemes for the Ministry of ${ministrySearch} in this Outcome Budget PDF.
        Extract data for 2024-25, 2025-26, and 2026-27.
        For each year/scheme, provide: ministry_name, department_name, scheme_name, fiscal_year, BE (Budget Estimate), RE (Revised Estimate), Actuals (Actual Expenditure).
        Only return a single JSON array of objects.
        Target: Extract as many as you can find for this ministry.
        Format: [ { ministry_name, department_name, scheme_name, fiscal_year, BE, RE, Actuals } ]`;

        try {
            const result = await model.generateContent([
                { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
                { text: prompt }
            ]);

            const text = result.response.text();
            const jsonPart = text.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0];
            if (jsonPart) {
                const data = JSON.parse(jsonPart);
                const added = await ingestData(data);
                overallNew += added;
                console.log(`LOG: Extracted ${data.length} records for ${ministrySearch} (${added} new schemes).`);
            } else {
                console.warn(`LOG: No JSON found for ${ministrySearch}`);
            }
        } catch (e: any) {
            console.error(`Error for ${ministrySearch}:`, e.message);
            if (e.message.includes("429")) {
                console.log("LOG: Rate limit. Waiting 20s...");
                await new Promise(r => setTimeout(r, 20000));
            }
        }

        // Wait to avoid RPM
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log(`\n🎉 Total New Schemes Added: ${overallNew}`);

    // Cleanup phase: remove those with absolutely NO utilization in ANY year
    console.log("LOG: Performing Cleanup for zero-expenditure schemes...");
    const allSchemes = await prisma.scheme.findMany({ include: { budgetAllocations: true } });
    let removedCount = 0;
    for (const s of allSchemes) {
        if (s.budgetAllocations.length === 0 || s.budgetAllocations.every(b => b.utilized.isZero())) {
            // Delete
            await prisma.scheme.delete({ where: { id: s.id } });
            removedCount++;
        }
    }
    console.log(`LOG: Removed ${removedCount} low-quality records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
