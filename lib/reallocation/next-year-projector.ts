import { SchemeWithScore, NextYearProjection } from '../types';

function getScoreMultiplier(score: number): number {
    if (score >= 85) return 1.15;
    if (score >= 70) return 1.05;
    if (score >= 55) return 1.00;
    if (score >= 40) return 0.90;
    return 0.80;
}

function getPriorityWeight(category: string): number {
    switch (category) {
        case 'INFRASTRUCTURE': return 1.20;
        case 'SOCIAL_PROTECTION': return 1.15;
        case 'HUMAN_CAPITAL': return 1.10;
        case 'ENVIRONMENT': return 1.05;
        case 'ADMINISTRATIVE': return 0.95;
        default: return 1.00;
    }
}

const FLOORS: Record<string, number> = {
    SOCIAL_PROTECTION: 0.90,
    INFRASTRUCTURE: 0.85,
    DEFAULT: 0.70,
};

export function projectNextYear(
    schemes: SchemeWithScore[],
    budgetCeiling: number,
    options: { fiscalYear: string }
): NextYearProjection[] {
    const projections = schemes.map((scheme) => {
        const scoreMultiplier = getScoreMultiplier(scheme.scores.finalScore);
        const priorityWeight = getPriorityWeight(scheme.priorityCategory);

        // Derive absorptionCapacity if missing or just safety check
        let absorptionFactor = scheme.absorptionCapacity;
        if (absorptionFactor === undefined || absorptionFactor === null) {
            absorptionFactor = Math.min(1.10, Math.max(0.80, scheme.allocation.utilizationPct / 100));
        }

        const currentAllocated = scheme.allocation.allocated;
        const rawProposed = currentAllocated * scoreMultiplier * priorityWeight * absorptionFactor;

        return {
            scheme,
            currentAllocated,
            proposedAllocated: rawProposed,
            scoreMultiplier,
            priorityWeight,
            absorptionFactor,
            isFloorApplied: false,
        };
    });

    // Step 2: Sum all raws
    const totalRaw = projections.reduce((sum, p) => sum + p.proposedAllocated, 0);

    // Step 3: If sum > ceiling, scale proportionally
    if (totalRaw > budgetCeiling) {
        const scaleFactor = budgetCeiling / totalRaw;
        projections.forEach(p => {
            p.proposedAllocated *= scaleFactor;
        });
    }

    // Step 4: Re-apply floors AFTER scaling
    let totalAfterFloors = 0;
    projections.forEach(p => {
        const floorMultiplier = FLOORS[p.scheme.priorityCategory] ?? FLOORS.DEFAULT;
        const minimumAllowed = p.currentAllocated * floorMultiplier;

        if (p.proposedAllocated < minimumAllowed) {
            p.proposedAllocated = minimumAllowed;
            p.isFloorApplied = true;
        } else {
            p.isFloorApplied = false;
        }
        totalAfterFloors += p.proposedAllocated;
    });

    // Step 5: Re-normalize again if floors pushed total over ceiling
    if (totalAfterFloors > budgetCeiling) {
        // Only scale down those that did NOT hit the floor
        const overage = totalAfterFloors - budgetCeiling;
        const scalableTotal = projections
            .filter(p => !p.isFloorApplied)
            .reduce((sum, p) => sum + p.proposedAllocated, 0);

        if (scalableTotal > 0) {
            const scaleDownFactor = (scalableTotal - overage) / scalableTotal;
            projections.forEach(p => {
                if (!p.isFloorApplied) {
                    p.proposedAllocated *= scaleDownFactor;
                    // Theoretically, scaling down might hit the floor AGAIN, but we assume a single pass is acceptable here
                    // as per "renormalize if needed"
                    const floorMultiplier = FLOORS[p.scheme.priorityCategory] ?? FLOORS.DEFAULT;
                    const minimumAllowed = p.currentAllocated * floorMultiplier;
                    if (p.proposedAllocated < minimumAllowed) {
                        p.proposedAllocated = minimumAllowed;
                        p.isFloorApplied = true;
                    }
                }
            });
        }
    }

    return projections.map(p => {
        // Capital/Revenue split: Preserve the existing ratio
        const currentCapital = p.scheme.allocation.allocatedCapital;
        const currentRevenue = p.scheme.allocation.allocatedRevenue;
        const totalCurrent = currentCapital + currentRevenue;

        const capitalRatio = totalCurrent > 0 ? (currentCapital / totalCurrent) : 0;
        const revenueRatio = totalCurrent > 0 ? (currentRevenue / totalCurrent) : 0;

        const proposedCapital = p.proposedAllocated * capitalRatio;
        const proposedRevenue = p.proposedAllocated * revenueRatio;

        const deltaAmount = p.proposedAllocated - p.currentAllocated;
        const deltaPct = p.currentAllocated > 0 ? (deltaAmount / p.currentAllocated) * 100 : 0;

        let direction: NextYearProjection['direction'] = 'FLAT';
        if (deltaAmount > 0.01) direction = 'INCREASE';
        else if (deltaAmount < -0.01) direction = 'DECREASE';

        const act = direction === 'INCREASE' ? 'increased' : direction === 'DECREASE' ? 'decreased' : 'maintained';
        const rationale = `Proposed budget for ${options.fiscalYear} ${act} due to final score ${p.scheme.scores.finalScore} and absorption capacity ${(p.absorptionFactor * 100).toFixed(0)}%.`;

        return {
            schemeId: p.scheme.id,
            schemeName: p.scheme.name,
            ministryName: p.scheme.ministryName || 'UNKNOWN',
            currentAllocated: p.currentAllocated,
            currentCapital,
            currentRevenue,
            proposedAllocated: p.proposedAllocated,
            proposedCapital,
            proposedRevenue,
            deltaAmount,
            deltaPct,
            direction,
            scoreMultiplier: p.scoreMultiplier,
            priorityWeight: p.priorityWeight,
            absorptionFactor: p.absorptionFactor,
            rationale,
            isFloorApplied: p.isFloorApplied
        };
    });
}
