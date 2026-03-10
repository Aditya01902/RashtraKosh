import { SchemeWithScore, IdleMoneyRecord } from '../types';

export function detectIdleMoney(schemes: SchemeWithScore[]): IdleMoneyRecord[] {
    // Filter schemes where utilizationPct < 75 OR where utilizationScore < 70
    const idleSchemes = schemes.filter(
        (scheme) =>
            scheme.allocation.utilizationPct < 75 || scheme.scores.utilizationScore < 70
    );

    return idleSchemes.map((scheme) => {
        // Calculate reclaimable amounts
        const reclaimableCapital =
            scheme.allocation.allocatedCapital - scheme.allocation.utilizedCapital;
        const reclaimableRevenue =
            scheme.allocation.allocatedRevenue - scheme.allocation.utilizedRevenue;
        const reclaimableTotal = reclaimableCapital + reclaimableRevenue;

        // Determine rootCause
        const { allocated, utilizationPct, surrendered, expenditureQ3 } = scheme.allocation;
        const { outputScore, utilizationScore } = scheme.scores;
        const priority = scheme.priorityCategory;

        let rootCause: IdleMoneyRecord['rootCause'] = 'CAPACITY_GAP'; // Default

        // Must be in this exact sequence - first match wins
        if (surrendered > 0.05 * allocated && utilizationPct > 60) {
            rootCause = 'ADMINISTRATIVE';
        } else if (priority === 'INFRASTRUCTURE' && expenditureQ3 < 0.20 * allocated) {
            rootCause = 'PROCUREMENT';
        } else if (priority === 'ENVIRONMENT' && utilizationPct < 80) {
            rootCause = 'REGULATORY';
        } else if (outputScore < 60 && utilizationScore > 70) {
            rootCause = 'DESIGN_FLAW'; // spending but not delivering
        }

        // Determine riskLevel
        let riskLevel: IdleMoneyRecord['riskLevel'] = 'LOW';
        if (reclaimableTotal > 200000 || rootCause === 'PROCUREMENT') {
            riskLevel = 'HIGH';
        } else if (reclaimableTotal > 50000) {
            riskLevel = 'MODERATE';
        }

        return {
            schemeId: scheme.id,
            schemeName: scheme.name,
            ministryShortCode: scheme.ministryShortCode || 'UNKNOWN',
            reclaimableTotal,
            reclaimableCapital,
            reclaimableRevenue,
            rootCause,
            riskLevel,
            utilizationPct,
        };
    });
}
