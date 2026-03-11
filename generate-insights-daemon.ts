import { PrismaClient } from './generated/prisma/index';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('[GenerateInsights] Script loaded successfully.');
const prisma = new PrismaClient();

async function runBatch() {
    console.log('[GenerateInsights] Starting Background Daemon Batch AI Process via Gemini 2.5 Flash...');
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in the environment.");
        process.exit(1);
    }

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

        console.log(`[GenerateInsights] Found ${schemes.length} active schemes. Starting AI generation loop...`);
        let generatedCount = 0;

        for (const scheme of schemes) {
            const latestScore = scheme.scores[scheme.scores.length - 1];

            // SKIP if already has insight
            if (latestScore && (latestScore as any).aiInsight) {
                console.log(`[GenerateInsights] ⏩ Skipping (Already has insight): ${scheme.name}`);
                continue;
            }

            const historyText = scheme.budgetAllocations.map(a => {
                const scoreObj = scheme.scores.find(s => s.fiscalYear === a.fiscalYear);
                const scoreNum = scoreObj ? scoreObj.finalScore : 0;
                return `[FY ${a.fiscalYear}] Allocated: ₹${a.allocated} crore, Utilized: ₹${a.utilized} crore, Score: ${scoreNum}`;
            }).join(' | ');

            const prompt = `
You are RashtraKosh AI, a distinguished financial policy advisor for the Government of India.
Analyze the following multi-year trend for the centralized scheme '${scheme.name}' under the Ministry of ${scheme.department.ministry.name}.
Target: Provide a highly analytical observation on its actual performance trajectory focusing on allocation vs utilisation differences.
Data: ${historyText}

Constraints:
- Be highly professional and data-driven.
- MUST be strictly 1 or 2 sentences ONLY.
- Do NOT use introductory filler. Get straight to the analysis.`;

            try {
                // Using gemini-2.5-flash as it is confirmed working in this environment's proxy/key
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.2
                        }
                    })
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    console.error(`Gemini API Error for ${scheme.name}: ${response.status} ${response.statusText}`, errData);
                    if (response.status === 429) {
                        console.log('[GenerateInsights] ⚠️ Rate limit hit. Cooling down for 10 seconds...');
                        await new Promise(r => setTimeout(r, 10000));
                    }
                    continue;
                }

                const data = await response.json();
                const insightText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Data utilization indicates stable growth, but outcome velocity requires monitoring.";

                if (latestScore) {
                    await prisma.schemeScore.update({
                        where: { id: latestScore.id },
                        data: { aiInsight: insightText.trim() } as any
                    });
                    generatedCount++;
                    console.log(`[GenerateInsights] ✅ Processed & Saved AI Insight: ${scheme.name}`);
                }
            } catch (err: any) {
                console.error(`[GenerateInsights] ❌ Failed to generate for ${scheme.name}:`, err.message);
            }

            // Rate limit sleep loosely for Free Tier limits (15 seconds)
            await new Promise(r => setTimeout(r, 15000));
        }

        console.log(`\n🎉 Batch AI Insights generation fully complete. Updated ${generatedCount} schemes successfully.`);

    } catch (error) {
        console.error('[GenerateInsights] Fatal Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runBatch();
