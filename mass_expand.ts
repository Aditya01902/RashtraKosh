import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function ingestData(data: any[]) {
    let newCount = 0;
    for (const item of data) {
        try {
            const mName = item.ministry || "Other";
            const sName = item.scheme_name || item.scheme;
            if (!sName) continue;

            const ministry = await prisma.ministry.upsert({
                where: { name: mName },
                update: {},
                create: { 
                    name: mName, 
                    shortCode: (mName.substring(0,3) + Math.random().toString(36).substring(2,5)).toUpperCase(), 
                    color: "#3b82f6", 
                    sector: Sector.OTHER 
                }
            });

            // Department logic (in ExpProfile, it might be same as ministry or specific)
            const department = await prisma.department.upsert({
                where: { name_ministryId: { name: mName, ministryId: ministry.id } },
                update: {},
                create: { name: mName, ministryId: ministry.id }
            });

            let scheme = await prisma.scheme.findFirst({
                where: { name: { equals: sName, mode: 'insensitive' }, departmentId: department.id }
            });

            if (!scheme) {
                scheme = await prisma.scheme.create({
                    data: { name: sName, departmentId: department.id, priorityCategory: PriorityCategory.INFRASTRUCTURE }
                });
                newCount++;
            }

            // Ingest 3 years of data (Actuals 24-25, RE 25-26, BE 26-27)
            const yearsMap = [
                { fy: "2024-25", BE: 0, utilized: Number(item.actuals_24_25) || 0, RE: 0 },
                { fy: "2025-26", BE: 0, utilized: 0, RE: Number(item.re_25_26) || 0 },
                { fy: "2026-27", BE: Number(item.be_26_27) || 0, utilized: 0, RE: 0 }
            ];

            for (const y of yearsMap) {
                if (y.BE === 0 && y.utilized === 0 && y.RE === 0) continue;
                await prisma.budgetAllocation.upsert({
                    where: { schemeId_fiscalYear: { schemeId: scheme.id, fiscalYear: y.fy } },
                    update: {
                        allocated: y.BE || undefined,
                        revisedEstimate: y.RE || undefined,
                        utilized: y.utilized || undefined
                    },
                    create: {
                        schemeId: scheme.id, fiscalYear: y.fy,
                        allocated: y.BE, revisedEstimate: y.RE, utilized: y.utilized,
                        allocatedCapital: 0, allocatedRevenue: 0, utilizedCapital: 0, utilizedRevenue: 0,
                        expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                    }
                });
            }

        } catch (e) {}
    }
    return newCount;
}

async function main() {
    const pdfPath = "exp_profile_26_27.pdf";
    if (!fs.existsSync(pdfPath)) {
        console.error("PDF not found!");
        return;
    }

    const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
    
    // We target the summary of central sector and centrally sponsored schemes
    const prompt = `Find all centrally sponsored and central sector schemes in this Expenditure Profile PDF (usually in Statement 4A and 4B).
    Extract for EACH scheme: scheme_name, ministry, actuals_24_25 (Actual expenditure), re_25_26 (Revised Estimate), and be_26_27 (Budget Estimate).
    Return a VERY LARGE JSON array of at least 120 schemes.
    Include ALL schemes you can find across ALL ministries.
    JSON schema: [ { scheme_name, ministry, actuals_24_25, re_25_26, be_26_27 } ]
    Output JSON only.
    `;

    try {
        console.log("LOG: Extracting mass scheme data from Expenditure Profile...");
        const result = await model.generateContent([
            { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
            { text: prompt }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log(`LOG: Found ${data.length} schemes in PDF.`);
            const newCount = await ingestData(data);
            console.log(`LOG: Successfully added ${newCount} new schemes.`);
        } else {
            console.error("LOG: Failed to extract JSON array.");
        }
    } catch (e: any) {
        console.error("LOG: Error in extraction:", e.message);
    }

    // FINAL CLEANUP: "Delete the ones whose expenditure was not available"
    console.log("LOG: Final Cleanup phase...");
    const allSchemes = await prisma.scheme.findMany({ include: { budgetAllocations: true } });
    let removedCount = 0;
    for (const s of allSchemes) {
        // If it has NO expenditure in ANY of the 3 years (not just zero, but actually missing/zero Actuals column)
        const hasExpenditure = s.budgetAllocations.some(b => Number(b.utilized) > 0);
        if (!hasExpenditure) {
             console.log(`LOG: Removing ${s.name} (ID: ${s.id}) - No expenditure recorded.`);
             await prisma.scheme.delete({ where: { id: s.id } });
             removedCount++;
        }
    }
    console.log(`LOG: Removed ${removedCount} low-quality entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
