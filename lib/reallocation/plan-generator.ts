import { SchemeWithScore, IdleMoneyRecord, ReallocFlow } from '../types';

export function generateReallocPlan(
    donors: IdleMoneyRecord[],
    recipients: SchemeWithScore[],
    options: { fiscalYear: string }
): ReallocFlow[] {
    const flows: ReallocFlow[] = [];

    // Sort donors descending by reclaimableTotal
    const sortedDonors = [...donors].sort((a, b) => b.reclaimableTotal - a.reclaimableTotal);

    // Sort recipients describing by absorptionCapacity, then finalScore
    const sortedRecipients = [...recipients].sort((a, b) => {
        if (b.absorptionCapacity !== a.absorptionCapacity) {
            return b.absorptionCapacity - a.absorptionCapacity;
        }
        return b.scores.finalScore - a.scores.finalScore;
    });

    // Track remaining needs for recipients
    // Let's assume a recipient can absorb up to 20% of their current allocation as additional funds
    const recipientNeeds = sortedRecipients.map(r => ({
        scheme: r,
        capitalNeed: r.allocation.allocatedCapital * 0.20,
        revenueNeed: r.allocation.allocatedRevenue * 0.20
    }));

    for (const donor of sortedDonors) {
        let donorCapitalRemaining = donor.reclaimableCapital;
        let donorRevenueRemaining = donor.reclaimableRevenue;

        for (const need of recipientNeeds) {
            // Break if donor is exhausted
            if (donorCapitalRemaining <= 0 && donorRevenueRemaining <= 0) break;

            const recipient = need.scheme;

            // Ensure Capital/Revenue strict separation
            const transferCapital = Math.min(donorCapitalRemaining, need.capitalNeed);
            const transferRevenue = Math.min(donorRevenueRemaining, need.revenueNeed);

            // Only create flow if there is a positive transfer
            if (transferCapital > 0 || transferRevenue > 0) {
                donorCapitalRemaining -= transferCapital;
                donorRevenueRemaining -= transferRevenue;
                need.capitalNeed -= transferCapital;
                need.revenueNeed -= transferRevenue;

                const totalAmount = transferCapital + transferRevenue;

                // Risk calculation
                let riskLevel: ReallocFlow['riskLevel'] = 'MODERATE';
                if (donor.rootCause === 'REGULATORY') {
                    riskLevel = 'HIGH';
                } else if (recipient.absorptionCapacity > 0.90) {
                    riskLevel = 'LOW';
                }

                const expType = transferCapital > 0 && transferRevenue > 0 ? 'MIXED' : (transferCapital > 0 ? 'CAPITAL' : 'REVENUE');

                const rationale = `Plan for ${options.fiscalYear}: ${recipient.name} demonstrates ${(recipient.absorptionCapacity * 100).toFixed(0)}% absorption with ${recipient.scores.finalScore} score; ${donor.schemeName} has reclaimable funds due to ${donor.rootCause}.`;

                flows.push({
                    fromSchemeId: donor.schemeId,
                    fromSchemeName: donor.schemeName,
                    toSchemeId: recipient.id,
                    toSchemeName: recipient.name,
                    amountCapital: transferCapital,
                    amountRevenue: transferRevenue,
                    totalAmount,
                    expenditureType: expType as 'CAPITAL' | 'REVENUE' | 'MIXED',
                    rationale,
                    riskLevel,
                });
            }
        }
    }

    return flows;
}
