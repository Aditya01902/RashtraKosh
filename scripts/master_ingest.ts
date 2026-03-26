import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp"
];

async function getStats(label: string) {
    console.log(`\n=== ${label} Database Statistics ===`);
    const allocCount = await prisma.budgetAllocation.count();
    const allocZeros = await prisma.budgetAllocation.count({
        where: {
            OR: [
                { allocated: 0 },
                { utilized: 0 }
            ]
        }
    });

    const scoreCount = await prisma.schemeScore.count();
    const scoreZeros = await prisma.schemeScore.count({
        where: { finalScore: 0 }
    });

    console.log(`Total BudgetAllocations: ${allocCount} (Zeros: ${allocZeros})`);
    console.log(`Total SchemeScores: ${scoreCount} (Zeros: ${scoreZeros})`);

    const allocationsByYear = await prisma.budgetAllocation.groupBy({
        by: ['fiscalYear'],
        _count: { id: true }
    });
    console.log("BudgetAllocations by Year:");
    allocationsByYear.forEach(y => console.log(`  ${y.fiscalYear}: ${y._count.id}`));

    const scoresByYear = await prisma.schemeScore.groupBy({
        by: ['fiscalYear'],
        _count: { id: true }
    });
    console.log("SchemeScores by Year:");
    scoresByYear.forEach(y => console.log(`  ${y.fiscalYear}: ${y._count.id}`));
    return allocZeros + scoreZeros;
}

async function promptGeminiWithFallback(prompt: string, expectJson: boolean = true): Promise<any> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set.");
    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of MODELS) {
        try {
            console.log(`  -> Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const textResponse = result.response.text();
            
            if (expectJson) {
                const cleanedText = textResponse.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim();
                return JSON.parse(cleanedText);
            } else {
                return textResponse;
            }
        } catch (error: any) {
            console.error(`  -> Model ${modelName} failed or limit reached: ${error.message}`);
            // if we hit the limit or it fails, the loop continues to the next model
        }
    }
    return null; // All models failed
}

async function fixZeroAllocations() {
    console.log("\n--- Fixing Zero BudgetAllocations ---");
    const zeroAllocations = await prisma.budgetAllocation.findMany({
        where: { OR: [{ allocated: 0 }, { utilized: 0 }] },
        include: { scheme: true }
    });

    if (zeroAllocations.length === 0) {
        console.log("No 0-value allocations found.");
        return;
    }

    for (const alloc of zeroAllocations) {
        const schemeName = alloc.scheme?.name || "Unknown Scheme";
        console.log(`Processing Scheme: ${schemeName} for Year: ${alloc.fiscalYear}`);

        // Try to fetch real value
        const prompt = `You are a financial analyst specializing in Indian government budgets.
        Provide the actual budget figures for the scheme "${schemeName}" for the fiscal year ${alloc.fiscalYear}.
        Provide ONLY valid JSON in the following format with exact numeric values (in INR Crores), no markdown tags:
        { "allocated": number, "utilized": number }
        If you are completely unsure or the scheme didn't exist, return { "not_found": true }.`;

        const response = await promptGeminiWithFallback(prompt, true);

        if (response && response.allocated && response.utilized) {
            console.log(`  Found values: allocated=${response.allocated}, utilized=${response.utilized}`);
            await prisma.budgetAllocation.update({
                where: { id: alloc.id },
                data: {
                    allocated: response.allocated,
                    utilized: response.utilized
                }
            });
        } else {
            console.log(`  Values not found. Deleting 0-value record ${alloc.id}.`);
            await prisma.budgetAllocation.delete({ where: { id: alloc.id } });
        }
    }
}

async function checkAndPredictFutureYears() {
    console.log("\n--- Checking and Predicting Future Years ---");
    // Find all years
    const years = await prisma.schemeScore.groupBy({
        by: ['fiscalYear'],
        _count: { id: true }
    });
    
    // Sort years assuming "YYYY-YY" format
    const sortedYearsStr = years.map(y => y.fiscalYear).sort();
    
    // Check if the most recent logical year has 0 records (though group by usually doesn't return 0)
    // Actually, maybe there's a year with 0 value scores that we should predict.
    const zeroScores = await prisma.schemeScore.findMany({
        where: { finalScore: 0 },
        include: { scheme: true }
    });

    if (zeroScores.length === 0) {
        console.log("No missing (0) scheme scores to predict.");
        return;
    }

    // Group zero scores by year
    const zeroScoresByYear = zeroScores.reduce((acc, score) => {
        if (!acc[score.fiscalYear]) acc[score.fiscalYear] = [];
        acc[score.fiscalYear].push(score);
        return acc;
    }, {} as Record<string, typeof zeroScores>);

    for (const [year, scores] of Object.entries(zeroScoresByYear)) {
        console.log(`Predicting score for Fiscal Year: ${year} (${scores.length} schemes)`);
        
        // For each scheme with missing score in this year, calculate a prediction
        for (const scoreRec of scores) {
            // Get past 3 years scores for this scheme
            const pastScores = await prisma.schemeScore.findMany({
                where: { 
                    schemeId: scoreRec.schemeId,
                    finalScore: { gt: 0 }
                },
                orderBy: { fiscalYear: 'desc' },
                take: 3
            });

            let predictedScore = 75.0; // default fallback
            
            if (pastScores.length > 0) {
                // Simple moving average
                const sum = pastScores.reduce((a, b) => a + Number(b.finalScore), 0);
                predictedScore = sum / pastScores.length;
                console.log(`  Predicted ${predictedScore.toFixed(2)} for ${scoreRec.scheme?.name} based on past ${pastScores.length} years.`);
            } else {
                console.log(`  No past data for ${scoreRec.scheme?.name}. Using default 75.0`);
            }

            // Update it
            await prisma.schemeScore.update({
                where: { id: scoreRec.id },
                data: {
                    finalScore: predictedScore,
                    aiInsight: `Predicted final score using simple moving average across historical data.`
                }
            });
        }
    }
}

async function cleanupTempFiles() {
    console.log("\n--- Cleaning up temporary files ---");
    const dir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(dir);
    
    const tempPatterns = [/^tmp_/, /^temp_/, /\.tmp$/, /db_stats\.txt/, /^db_stats\.ts/];
    
    let deletedCount = 0;
    for (const file of files) {
        if (tempPatterns.some(p => p.test(file))) {
            const fp = path.join(dir, file);
            if (fs.statSync(fp).isFile()) {
                fs.unlinkSync(fp);
                console.log(`Deleted temp file: ${file}`);
                deletedCount++;
            }
        }
    }
    
    // check script folder too
    const scriptDir = __dirname;
    const scriptFiles = fs.readdirSync(scriptDir);
    for (const file of scriptFiles) {
        if (file === 'db_stats.ts') {
            fs.unlinkSync(path.join(scriptDir, file));
            console.log(`Deleted temp file: scripts/db_stats.ts`);
            deletedCount++;
        }
    }

    console.log(`Total temp files deleted: ${deletedCount}`);
}

async function main() {
    console.log("Starting Master Ingestion & Cleanup Process");
    
    // 1. Pre-ingestion Stats
    await getStats("Pre-Ingestion");
    
    // 2. Fix Zero Allocations using Gemini
    await fixZeroAllocations();
    
    // 3. Predict missing/future year scores
    await checkAndPredictFutureYears();
    
    // 4. Post-ingestion Stats
    await getStats("Post-Ingestion");
    
    // 5. Cleanup
    await cleanupTempFiles();
    
    console.log("\nMaster Ingestion Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
