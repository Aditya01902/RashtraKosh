import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();
const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp"
];

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function promptGeminiWithFallback(prompt: string): Promise<string | null> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set.");
    const genAI = new GoogleGenerativeAI(key);

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const textResponse = result.response.text();
                return textResponse.trim().replace(/^"/, '').replace(/"$/, ''); // remove wrapping quotes if any
            } catch (error: any) {
                console.error(`  -> Model ${modelName} failed or limit reached: ${error.message}`);
                if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("retry")) {
                    console.log(`  -> Rate limit hit. Waiting for 35 seconds before retry...`);
                    await delay(35000); // 35 seconds wait on 429
                    break; // Break the inner loop to retry the outer loop
                }
            }
        }
        retryCount++;
    }
    return null; // All models failed after retries
}


async function main() {
    console.log("Starting generation of sophisticated Chanakya AI Reports...");
    
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

    console.log(`Found ${schemes.length} schemes to process.`);
    let generatedCount = 0;

    for (const scheme of schemes) {
        for (const score of scheme.scores) {
            console.log(`Processing ${scheme.name} (FY ${score.fiscalYear})...`);

            const allocForYear = scheme.budgetAllocations.find(a => a.fiscalYear === score.fiscalYear);
            if (!allocForYear) {
                console.log(`  -> No budget allocation for ${score.fiscalYear}, skipping.`);
                continue;
            }

            // Build history context
            const historyText = scheme.budgetAllocations.map(a => {
                const s = scheme.scores.find(x => x.fiscalYear === a.fiscalYear);
                return `[FY ${a.fiscalYear}] Allocated: ₹${a.allocated}Cr, Utilized: ₹${a.utilized}Cr, Score: ${s ? s.finalScore : 0}`;
            }).join(' | ');

            const prompt = `You are Chanakya AI, an elite strategic intelligence engine for the Government of India.
Analyze the financial and performance trajectory for the scheme '${scheme.name}' under the Ministry of ${scheme.department.ministry.name}, with focus on FY ${score.fiscalYear}.
Target: Provide a highly sophisticated, strategic 1-2 sentence insight. DO NOT just recite the numbers or say "utilization is X against allocation Y". Instead, synthesize what this means—identify systemic bottlenecks, shifting priorities, execution efficiency, or long-term implications. For example, mention if persistent underutilization indicates structural capacity issues, or if sharp score drops signal urgent intervention needs.
Data: ${historyText}

Constraints:
- Provide a truly intelligent synthesis, not a descriptive summary.
- MUST be exactly 1 to 2 sentences.
- DO NOT quote the exact numerical allocation/utilization values in your response.
- Do NOT use introductory filler (e.g., "This scheme shows..."). Get straight to the point.`;

            try {
                const aiInsight = await promptGeminiWithFallback(prompt);
                
                if (aiInsight) {
                    await prisma.schemeScore.update({
                        where: { id: score.id },
                        data: { aiInsight }
                    });
                    generatedCount++;
                    console.log(`  ✅ Generated: ${aiInsight.substring(0, 80)}...`);
                } else {
                    console.log(`  ❌ Failed to generate AI insight for this record (API error persist after retries). Not saving fallback.`);
                }
                
                // Be gentle with rate limits per iteration
                await delay(2500);
            } catch (err: any) {
                console.error(`  ❌ Error: ${err.message}`);
            }
        }
    }

    console.log(`\nCompleted! Generated/Updated sophisticated AI reports for ${generatedCount} scheme scores.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
