import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SCHEMES = [
    "Pradhan Mantri Kisan Samman Nidhi (PM – KISAN)", "Modified Interest Subvention Scheme (MISS)", "Crop Insurance Scheme", 
    "Rashtriya Krishi Vikas Yojana", "Krishionnati Yojana", "Agriculture Infrastructure Fund", 
    "Pradhan Mantri Annadata Aay Sanrakshan Yojana (PM-AASHA) Scheme", "Namo Drone Didi", "National Ayush Mission", 
    "Urea Subsidy", "Nutrient Based Subsidy", "Regional Connectivity Scheme-Modified UDAN", "Bharatnet Project", 
    "Pradhan Mantri Garib Kalyan Ann Yojana (PMGKAY)", "Pradhan Mantri Poshan Shakti Nirman (PM POSHAN)", "Samagra Shiksha"
];

async function main() {
    console.log("LOG: Extracting historical details for batch 1...");
    const pdfFile = "outcome_26_27.pdf";
    if (!fs.existsSync(pdfFile)) return;

    const pdfBase64 = fs.readFileSync(pdfFile).toString('base64');
    
    // Batch schemes to avoid prompt length issues but send names
    const prompt = `For these specific schemes: ${SCHEMES.join(", ")}.
    Extract the financial data for 3 years: 
    1. Budget Estimate (BE) for 2026-27
    2. Revised Estimate (RE) for 2025-26
    3. Actual Expenditure (Actuals) for 2024-25
    Return as a JSON array: [ { scheme_name, fy, BE, RE, Actuals } ] 
    Note: fiscal_year should be 2024-25, 2025-26 OR 2026-27.
    Try to find all 3 years for each scheme.
    `;

    try {
        const result = await model.generateContent([
            { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
            { text: prompt }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log(`LOG: Extracted ${data.length} records.`);
            
            for (const item of data) {
                const s = await prisma.scheme.findFirst({ where: { name: { equals: item.scheme_name, mode: 'insensitive' } } });
                if (s) {
                    // Update or create allocation
                    const fy = item.fy || item.fiscal_year;
                    if (fy) {
                        await prisma.budgetAllocation.upsert({
                            where: { schemeId_fiscalYear: { schemeId: s.id, fiscalYear: fy } },
                            update: {
                                allocated: Number(item.BE) || 0,
                                utilized: Number(item.Actuals || item.Actual || item.RE || 0),
                                revisedEstimate: Number(item.RE) || null
                            },
                            create: {
                                schemeId: s.id, fiscalYear: fy,
                                allocated: Number(item.BE) || 0,
                                utilized: Number(item.Actuals || item.Actual || item.RE || 0),
                                revisedEstimate: Number(item.RE) || null,
                                allocatedCapital: 0, allocatedRevenue: 0, utilizedCapital: 0, utilizedRevenue: 0,
                                expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                            }
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
