import { Prisma } from '@prisma/client';
import { db } from '../db';
import { calculateUtilizationScore, AllocationData } from './utilization';
import { calculateOutputScore, OutputDataInput } from './output';
import { calculateOutcomeScore, OutcomeDataInput } from './outcome';
import { calculateFinalScore } from './final';

export { calculateUtilizationScore } from './utilization';
export type { UtilizationBreakdown, AllocationData } from './utilization';

export { calculateOutputScore } from './output';
export type { OutputBreakdown, OutputDataInput } from './output';

export { calculateOutcomeScore } from './outcome';
export type { OutcomeBreakdown, OutcomeDataInput } from './outcome';

export {
    calculateFinalScore,
    classifyScore,
    aggregateScores,
    getScoreDistribution
} from './final';
export type { ScoreRating } from './final';

/**
 * Orchestrator function to calculate all scores for a scheme in a given fiscal year
 * and persist them to the SchemeScore table.
 */
export async function calculateAndStoreScores(schemeId: string, fiscalYear: string) {
    // 1. Fetch all required data points
    const [allocation, outputData, outcomeData] = await Promise.all([
        db.budgetAllocation.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } }
        }),
        db.outputData.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } }
        }),
        db.outcomeData.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } }
        })
    ]);

    if (!allocation) {
        throw new Error(`No budget allocation found for scheme ${schemeId} in ${fiscalYear}`);
    }

    // 2. Calculate individual scores
    const utilizationResult = calculateUtilizationScore(allocation as unknown as AllocationData);
    const outputResult = calculateOutputScore(outputData as unknown as OutputDataInput);
    const outcomeResult = calculateOutcomeScore(outcomeData as unknown as OutcomeDataInput);

    // 3. Calculate final weighted score
    const finalScore = calculateFinalScore(
        utilizationResult.score,
        outputResult.score,
        outcomeResult.score
    );

    // 4. Persistence
    return await db.schemeScore.upsert({
        where: {
            schemeId_fiscalYear: { schemeId, fiscalYear }
        },
        update: {
            utilizationScore: utilizationResult.score,
            utilizationBreakdown: utilizationResult.breakdown as unknown as Prisma.InputJsonValue,
            outputScore: outputResult.score,
            outputBreakdown: outputResult.breakdown as unknown as Prisma.InputJsonValue,
            outcomeScore: outcomeResult.score,
            outcomeBreakdown: outcomeResult.breakdown as unknown as Prisma.InputJsonValue,
            finalScore: finalScore,
            calculatedAt: new Date()
        },
        create: {
            schemeId,
            fiscalYear,
            utilizationScore: utilizationResult.score,
            utilizationBreakdown: utilizationResult.breakdown as unknown as Prisma.InputJsonValue,
            outputScore: outputResult.score,
            outputBreakdown: outputResult.breakdown as unknown as Prisma.InputJsonValue,
            outcomeScore: outcomeResult.score,
            outcomeBreakdown: outcomeResult.breakdown as unknown as Prisma.InputJsonValue,
            finalScore: finalScore,
            scoreVersion: "v1.0"
        }
    });
}