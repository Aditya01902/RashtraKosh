import { PrismaClient, Sector, PriorityCategory, KpiDirection } from "@prisma/client";
const prisma = new PrismaClient();

// Helper: compute utilization score
function computeUtilizationScore(allocated: number, utilized: number): { score: number, breakdown: Record<string, number> } {
    const score = allocated > 0 ? Math.round((utilized / allocated) * 10000) / 100 : 0;
    return {
        score: Math.min(score, 100),
        breakdown: { expenditureRate: score }
    };
}

// Helper: compute output score
function computeOutputScore(physTarget: number, physAchieved: number): { score: number, breakdown: Record<string, number> } {
    const score = physTarget > 0 ? Math.round(Math.min(physAchieved / physTarget, 1.0) * 10000) / 100 : 0;
    return {
        score: score,
        breakdown: { physicalAchievement: score }
    };
}

// Helper: compute final score
function computeFinalScore(util: number, output: number): number {
    // If output exists, weight it 50/50. If only util exists, weight it 100
    if (output > 0) return Math.round((0.5 * util + 0.5 * output) * 100) / 100;
    return util;
}

async function main() {
    console.log("LOG: Calculating missing scores...");
    const allocations = await prisma.budgetAllocation.findMany({
        include: { 
            scheme: { 
                include: { 
                    outputData: true,
                    outcomeData: true
                }
            } 
        }
    });

    for (const b of allocations) {
        if (!b.schemeId) continue;
        
        const output = b.scheme.outputData.find(o => o.fiscalYear === b.fiscalYear);
        const physTarget = output ? Number(output.physicalTargetValue) : 0;
        const physAchieved = output ? Number(output.physicalAchievedValue) : 0;

        const utilResult = computeUtilizationScore(Number(b.allocated), Number(b.utilized));
        const outputResult = computeOutputScore(physTarget, physAchieved);
        const finalScore = computeFinalScore(utilResult.score, outputResult.score);

        await prisma.schemeScore.upsert({
            where: { schemeId_fiscalYear: { schemeId: b.schemeId, fiscalYear: b.fiscalYear } },
            update: {
                utilizationScore: utilResult.score,
                utilizationBreakdown: utilResult.breakdown,
                outputScore: outputResult.score,
                outputBreakdown: outputResult.breakdown,
                finalScore: finalScore,
                scoreVersion: "v1.1",
                calculatedAt: new Date()
            },
            create: {
                schemeId: b.schemeId,
                fiscalYear: b.fiscalYear,
                utilizationScore: utilResult.score,
                utilizationBreakdown: utilResult.breakdown,
                outputScore: outputResult.score,
                outputBreakdown: outputResult.breakdown,
                finalScore: finalScore,
                outcomeScore: 0,
                outcomeBreakdown: {},
                scoreVersion: "v1.1",
                calculatedAt: new Date()
            }
        });
    }

    console.log("LOG: Cleaning up zero/undefined schemes...");
    // A scheme is undefined if it has no score OR only has 0 scores
    const schemes = await prisma.scheme.findMany({
        include: { scores: true }
    });

    let removedSchemes = 0;
    for (const scheme of schemes) {
        const hasDefinedScore = scheme.scores.length > 0;
        const allZero = scheme.scores.every(s => Number(s.finalScore) === 0);

        if (!hasDefinedScore || allZero) {
            console.log(`LOG: Removing scheme ${scheme.name} (ID: ${scheme.id}) - Score ${hasDefinedScore ? "Zero" : "Not Defined"}`);
            // FeedbackItems and BudgetAllocations will Cascade because of schema onDelete
            await prisma.scheme.delete({ where: { id: scheme.id } });
            removedSchemes++;
        }
    }

    console.log("LOG: Cleaning up empty ministries...");
    // A ministry is empty if it has no departments WITH active schemes
    const ministries = await prisma.ministry.findMany({
        include: { 
            departments: { 
                include: { schemes: true }
            } 
        }
    });

    let removedMinistries = 0;
    for (const ministry of ministries) {
        const hasSchemes = ministry.departments.some(d => d.schemes.length > 0);
        if (!hasSchemes) {
            console.log(`LOG: Removing ministry ${ministry.name} (ID: ${ministry.id}) - No active schemes`);
            await prisma.ministry.delete({ where: { id: ministry.id } });
            removedMinistries++;
        }
    }

    console.log(`\n🎉 DONE! Removed ${removedSchemes} schemes and ${removedMinistries} ministries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
