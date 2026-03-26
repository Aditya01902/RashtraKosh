import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: "d:/Codes/India Innovates/RashtraKosh/.env.local" });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function ingestFinances(data: any[]) {
    let ok = 0;
    for (const item of data) {
        try {
            // Find existing scheme by name
            const scheme = await prisma.scheme.findFirst({
                where: { name: { contains: item.scheme_name, mode: 'insensitive' } }
            });

            if (!scheme) continue;

            const yearsData = [
                { fy: "2022-23", val: item.actual_22_23 },
                { fy: "2023-24", val: item.re_23_24, be: item.be_23_24 },
                { fy: "2024-25", val: 0, be: item.be_24_25 }
            ];

            for (const y of yearsData) {
                await prisma.budgetAllocation.upsert({
                    where: { schemeId_fiscalYear: { schemeId: scheme.id, fiscalYear: y.fy } },
                    update: {
                        allocated: Number(y.be || (y.fy === "2022-23" ? y.val : 0)) || 0,
                        utilized: Number(y.val) || 0,
                        revisedEstimate: Number(y.val) || 0,
                        // We set capital/revenue only for the BE year mostly, or overall
                        allocatedCapital: Number(item.capital_24_25) || 0,
                        allocatedRevenue: Number(item.revenue_24_25) || 0,
                    },
                    create: {
                        schemeId: scheme.id, fiscalYear: y.fy,
                        allocated: Number(y.be) || 0, utilized: Number(y.val) || 0,
                        revisedEstimate: Number(y.val) || 0,
                        allocatedCapital: Number(item.capital_24_25) || 0,
                        allocatedRevenue: Number(item.revenue_24_25) || 0,
                        utilizedCapital: 0, utilizedRevenue: 0, expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                    }
                });
            }
            ok++;
        } catch (e) {}
    }
    return ok;
}

async function main() {
    console.log("Fixing zero numbers using Expenditure Profile...");
    const { PDFParse } = require('pdf-parse');
    const buffer = fs.readFileSync('profile_24_25.pdf');
    const parser = new PDFParse({ data: buffer });
    const textData = await parser.getText();
    const text = textData.text.substring(0, 300000); // Statements are early

    const prompt = `Extract financial totals for Centrally Sponsored and Central Sector schemes from this Expenditure Profile text. 
Focus on Statement 4A and 4B. 
Required for each scheme:
- scheme_name
- actual_22_23
- be_23_24
- re_23_24
- be_24_25
- capital_24_25 (BE)
- revenue_24_25 (BE)

Return JSON array only.`;

    const result = await model.generateContent(prompt + "\n\nText:\n" + text);
    const cleaned = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    console.log(`Extracted ${data.length} financial records.`);

    const count = await ingestFinances(data);
    console.log(`Successfully updated ${count} schemes with real financial data.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
