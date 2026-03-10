import { Prisma } from '@prisma/client';

export interface UtilizationBreakdown {
    expenditureRate: number;      // 40%
    temporalDistribution: number; // 25%
    surrenderRate: number;        // 20%
    supplementaryDemand: number;  // 15%
}

export function giniCoefficient(values: number[]): number {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0; // Handle division by zero for new schemes

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const weightedSum = sorted.reduce((acc, val, i) => acc + (i + 1) * val, 0);

    return (2 * weightedSum) / (n * sum) - (n + 1) / n;
}

// We define a partial interface for what we need from budget allocation
// to avoid strictly typing it to the Prisma generated type in case of partial selects,
// but it aligns with the Prisma model fields.
export interface AllocationData {
    allocated: Prisma.Decimal | number;
    utilized: Prisma.Decimal | number;
    expenditureQ1: Prisma.Decimal | number;
    expenditureQ2: Prisma.Decimal | number;
    expenditureQ3: Prisma.Decimal | number;
    expenditureQ4: Prisma.Decimal | number;
    surrendered: Prisma.Decimal | number;
    supplementaryDemands: number;
}

export function calculateUtilizationScore(
    allocation: AllocationData
): { score: number; breakdown: UtilizationBreakdown } {
    // 1. Safe conversions
    const allocated = Number(allocation.allocated);
    const utilized = Number(allocation.utilized);
    const q1 = Number(allocation.expenditureQ1);
    const q2 = Number(allocation.expenditureQ2);
    const q3 = Number(allocation.expenditureQ3);
    const q4 = Number(allocation.expenditureQ4);
    const surrendered = Number(allocation.surrendered);
    const supplementaryDemands = allocation.supplementaryDemands;

    // 2. Calculate E (Expenditure Rate, 40%)
    const maxE = allocated === 0 ? 0 : Math.round(Math.min(utilized / allocated, 1.0) * 10000) / 100;

    // 3. Calculate T (Temporal Distribution Index, 25%)
    const T = Math.round((1 - giniCoefficient([q1, q2, q3, q4])) * 10000) / 100;

    // 4. Calculate S (Surrender Rate Score, 20%)
    let S = allocated === 0 ? 0 : (1 - surrendered / allocated) * 100;
    if (allocated > 0 && surrendered > 0.05 * allocated) {
        S *= 0.9; // Apply penalty multiplier
    }
    S = Math.round(Math.max(0, Math.min(S, 100)) * 100) / 100; // Round to 2 decimals

    // 5. Calculate D (Supplementary Demand Discipline, 15%)
    const D = Math.round(Math.max(0, 100 - supplementaryDemands * 15) * 100) / 100;

    // 6. Final Utilization Score (U)
    // Use the rounded values for the weighted sum calculation to ensure consistency with the breakdown
    const score = 0.40 * maxE + 0.25 * T + 0.20 * S + 0.15 * D;

    return {
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        breakdown: {
            expenditureRate: maxE,
            temporalDistribution: T,
            surrenderRate: S,
            supplementaryDemand: D,
        },
    };
}
