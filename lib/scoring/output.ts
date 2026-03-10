import { Prisma } from '@prisma/client';

export interface OutputBreakdown {
    physicalTargetAchievement: number; // 30%
    beneficiaryCoverageRatio: number;  // 25%
    deliveryTimeliness: number;        // 20%
    qualityComplianceScore: number;    // 15%
    geographicDistributionIndex: number; // 10%
}

export interface OutputDataInput {
    physicalTargetValue: Prisma.Decimal | number;
    physicalAchievedValue: Prisma.Decimal | number;
    beneficiaryTarget: number;
    beneficiaryAchieved: number;
    timelinessScore: Prisma.Decimal | number;
    qualityComplianceScore: Prisma.Decimal | number;
    geoDistributionIndex: Prisma.Decimal | number;
}

export function calculateOutputScore(
    outputData: OutputDataInput | null
): { score: number; breakdown: OutputBreakdown } {
    // If undefined/null (no data in DB), fallback to base 50 values to not block calculation
    if (!outputData) {
        return {
            score: 50.0,
            breakdown: {
                physicalTargetAchievement: 50.0,
                beneficiaryCoverageRatio: 50.0,
                deliveryTimeliness: 50.0,
                qualityComplianceScore: 50.0,
                geographicDistributionIndex: 50.0,
            },
        };
    }

    // 1. Safe conversions
    const physicalTarget = Number(outputData.physicalTargetValue);
    const physicalAchieved = Number(outputData.physicalAchievedValue);
    const beneficiaryTarget = outputData.beneficiaryTarget;
    const beneficiaryAchieved = outputData.beneficiaryAchieved;
    const timelinessScore = Number(outputData.timelinessScore);
    const qualityComplianceScore = Number(outputData.qualityComplianceScore);
    const geoDistributionIndex = Number(outputData.geoDistributionIndex);

    // 2. Calculate PT (Physical Target Achievement, 30%)
    const PT = physicalTarget === 0 ? 0 : Math.round(Math.min(physicalAchieved / physicalTarget, 1.0) * 10000) / 100;

    // 3. Calculate BC (Beneficiary Coverage Ratio, 25%)
    const BC = beneficiaryTarget === 0 ? 0 : Math.round(Math.min(beneficiaryAchieved / beneficiaryTarget, 1.0) * 10000) / 100;

    // 4. DT (Delivery Timeliness, 20%) - direct value
    const DT = Math.round(Math.max(0, Math.min(timelinessScore, 100)) * 100) / 100;

    // 5. QC (Quality Compliance Score, 15%) - direct value
    const QC = Math.round(Math.max(0, Math.min(qualityComplianceScore, 100)) * 100) / 100;

    // 6. GD (Geographic Distribution Index, 10%) - direct value
    const GD = Math.round(Math.max(0, Math.min(geoDistributionIndex, 100)) * 100) / 100;

    // 7. Final Output Score (OP)
    const score = 0.30 * PT + 0.25 * BC + 0.20 * DT + 0.15 * QC + 0.10 * GD;

    return {
        score: Math.round(score * 100) / 100,
        breakdown: {
            physicalTargetAchievement: PT,
            beneficiaryCoverageRatio: BC,
            deliveryTimeliness: DT,
            qualityComplianceScore: QC,
            geographicDistributionIndex: GD,
        },
    };
}
