import { SchemeWithScore, QuadrantScheme, QuadrantClass } from '../types';

export function classifyQuadrant(scheme: SchemeWithScore): QuadrantScheme {
    const { utilizationScore, finalScore } = scheme.scores;
    let quadrant: QuadrantClass = 'FAILING';

    if (utilizationScore >= 70 && finalScore >= 70) {
        quadrant = 'EFFICIENT';
    } else if (utilizationScore >= 70 && finalScore < 70) {
        quadrant = 'OVERFUNDED';
    } else if (utilizationScore < 70 && finalScore >= 70) {
        quadrant = 'STARVED';
    } else {
        quadrant = 'FAILING';
    }

    const reclaimableCapital =
        scheme.allocation.allocatedCapital - scheme.allocation.utilizedCapital;
    const reclaimableRevenue =
        scheme.allocation.allocatedRevenue - scheme.allocation.utilizedRevenue;

    return {
        schemeId: scheme.id,
        schemeName: scheme.name,
        ministryName: scheme.ministryName || 'UNKNOWN',
        utilizationScore,
        finalScore,
        budgetAllocated: scheme.allocation.allocated,
        quadrant,
        reclaimableCapital: Math.max(0, reclaimableCapital),
        reclaimableRevenue: Math.max(0, reclaimableRevenue),
    };
}
