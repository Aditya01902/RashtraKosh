export type ScoreRating = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'CRITICAL';

export function calculateFinalScore(
    utilizationScore: number,
    outputScore: number,
    outcomeScore: number
): number {
    const finalScore = 0.30 * utilizationScore + 0.35 * outcomeScore + 0.35 * outputScore;
    return Math.round(finalScore * 100) / 100;
}

export function classifyScore(score: number): ScoreRating {
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 55) return 'AVERAGE';
    if (score >= 40) return 'POOR';
    return 'CRITICAL';
}

export function aggregateScores(
    schemes: Array<{ finalScore: number; allocated: number | { toNumber(): number } | string }>
): number {
    let totalAllocated = 0;
    let weightedScoreSum = 0;

    for (const scheme of schemes) {
        const allocatedNum = typeof scheme.allocated === 'number'
            ? scheme.allocated
            : typeof scheme.allocated === 'string'
                ? parseFloat(scheme.allocated)
                : Number(scheme.allocated);

        if (!isNaN(allocatedNum) && allocatedNum > 0) {
            totalAllocated += allocatedNum;
            weightedScoreSum += scheme.finalScore * allocatedNum;
        }
    }

    if (totalAllocated === 0) return 0;
    return Math.round((weightedScoreSum / totalAllocated) * 100) / 100;
}

export function getScoreDistribution(scores: number[]): Record<ScoreRating, number> {
    const distribution: Record<ScoreRating, number> = {
        EXCELLENT: 0,
        GOOD: 0,
        AVERAGE: 0,
        POOR: 0,
        CRITICAL: 0,
    };

    for (const score of scores) {
        distribution[classifyScore(score)]++;
    }

    return distribution;
}
