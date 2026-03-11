"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("./generated/prisma/index.js");
const genai_1 = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();
const prisma = new index_js_1.PrismaClient();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function runBatch() {
    console.log('[GenerateInsights] Starting Background Daemon AI Process via Gemini...');
    try {
        const schemes = await prisma.scheme.findMany({
            where: { isActive: true },
            include: {
                department: {
                    include: { ministry: true }
                },
                budgetAllocations: {
                    orderBy: { fiscalYear: 'asc' }
                },
                scores: {
                    orderBy: { fiscalYear: 'asc' }
                }
            }
        });
        console.log(`[GenerateInsights] Found ${schemes.length} schemes.`);
        let generatedCount = 0;
        for (const scheme of schemes) {
            const historyText = scheme.budgetAllocations.map(a => {
                const scoreObj = scheme.scores.find(s => s.fiscalYear === a.fiscalYear);
                const scoreNum = scoreObj ? scoreObj.finalScore : 0;
                return `[FY ${a.fiscalYear}] Allocated: ₹${a.allocated} crore, Utilized: ₹${a.utilized} crore, Score: ${scoreNum}`;
            }).join(' | ');
            const prompt = `
You are RashtraKosh AI, a distinguished financial policy advisor for the Government of India.
Analyze the following multi-year trend for the centralized scheme '${scheme.name}' under the Ministry of ${scheme.department.ministry.name}.
Target: Provide a 1-2 sentence hyper-specific recommendation or highly analytical observation on its actual performance trajectory. Do not give general advice. Be exceptionally specific referencing its allocation and utilisation values.
Data: ${historyText}

Constraints:
- Be highly professional and data-driven.
- MUST be strictly 1 or 2 sentences ONLY.
- Do NOT use introductory filler. Get straight to the analysis.`;
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                const insightText = response.text || "Data utilization indicates stable growth, but outcome velocity requires monitoring.";
                const latestScore = scheme.scores[scheme.scores.length - 1];
                if (latestScore) {
                    await prisma.schemeScore.update({
                        where: { id: latestScore.id },
                        data: { aiInsight: insightText.trim() }
                    });
                    generatedCount++;
                    console.log(`[GenerateInsights] ✅ Processed: ${scheme.name}`);
                }
            }
            catch (err) {
                console.error(`[GenerateInsights] ❌ Failed to generate for ${scheme.name}:`, err.message);
            }
            // Rate limit sleep loosely for Free Tier
            await new Promise(r => setTimeout(r, 2000));
        }
        console.log(`\n🎉 Batch generation complete. Updated ${generatedCount} schemes.`);
    }
    catch (error) {
        console.error('[GenerateInsights] Fatal Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
runBatch();
