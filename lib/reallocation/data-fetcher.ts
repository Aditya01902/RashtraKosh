import { db as prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { SchemeWithScore, UtilizationBreakdown, OutputBreakdown, OutcomeBreakdown } from '../types';

export async function fetchSchemesWithScores(fiscalYear: string): Promise<SchemeWithScore[]> {
    const schemes = await prisma.scheme.findMany({
        where: { isActive: true },
        include: {
            department: {
                include: { ministry: true },
            },
            budgetAllocations: {
                where: { fiscalYear },
            },
            scores: {
                where: { fiscalYear },
            },
        },
    });

    type SchemeWithInclusions = Prisma.SchemeGetPayload<{
        include: {
            department: { include: { ministry: true } },
            budgetAllocations: true,
            scores: true,
        },
    }>;

    return (schemes as SchemeWithInclusions[])
        .filter((s: SchemeWithInclusions) => s.budgetAllocations.length > 0 && s.scores.length > 0)
        .map((s: SchemeWithInclusions) => {
            const allocation = s.budgetAllocations[0];
            const scores = s.scores[0];

            // Safe cast and numbers for decimal fields
            const allocated = Number(allocation.allocated);
            const utilizedPct = allocated > 0 ? (Number(allocation.utilized) / allocated) * 100 : 0;

            const absorptionCapacity = Math.min(1.10, Math.max(0.80, utilizedPct / 100));

            return {
                id: s.id,
                name: s.name,
                description: s.description,
                departmentId: s.departmentId,
                ministryName: s.department.ministry.name,
                ministryShortCode: s.department.ministry.shortCode,
                priorityCategory: s.priorityCategory,
                allocation: {
                    allocated: Number(allocation.allocated),
                    allocatedCapital: Number(allocation.allocatedCapital),
                    allocatedRevenue: Number(allocation.allocatedRevenue),
                    utilized: Number(allocation.utilized),
                    utilizedCapital: Number(allocation.utilizedCapital),
                    utilizedRevenue: Number(allocation.utilizedRevenue),
                    unspentCapital: Number(allocation.allocatedCapital) - Number(allocation.utilizedCapital),
                    unspentRevenue: Number(allocation.allocatedRevenue) - Number(allocation.utilizedRevenue),
                    utilizationPct: utilizedPct,
                    surrendered: Number(allocation.surrendered),
                    expenditureQ1: Number(allocation.expenditureQ1),
                    expenditureQ2: Number(allocation.expenditureQ2),
                    expenditureQ3: Number(allocation.expenditureQ3),
                    expenditureQ4: Number(allocation.expenditureQ4),
                    fiscalYear: allocation.fiscalYear,
                },
                scores: {
                    id: scores.id,
                    schemeId: scores.schemeId,
                    fiscalYear: scores.fiscalYear,
                    utilizationScore: Number(scores.utilizationScore),
                    utilizationBreakdown: scores.utilizationBreakdown as unknown as UtilizationBreakdown,
                    outputScore: Number(scores.outputScore),
                    outputBreakdown: scores.outputBreakdown as unknown as OutputBreakdown,
                    outcomeScore: Number(scores.outcomeScore),
                    outcomeBreakdown: scores.outcomeBreakdown as unknown as OutcomeBreakdown,
                    finalScore: Number(scores.finalScore),
                    scoreVersion: scores.scoreVersion,
                    calculatedAt: scores.calculatedAt.toISOString(),
                },
                absorptionCapacity,
            };
        });
}
