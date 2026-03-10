import { Prisma, KpiDirection } from '@prisma/client';

export interface OutcomeBreakdown {
    sectorKpiImprovement: number;   // 30%
    baselineVsCurrentIndex: number; // 25%
    beneficiaryImpact: number;      // 20%
    attributionScore: number;       // 15%
    sustainabilityIndex: number;    // 10%
}

export interface OutcomeDataInput {
    sectorKpiBaseline: Prisma.Decimal | number;
    sectorKpiCurrent: Prisma.Decimal | number;
    sectorKpiDirection: KpiDirection;
    baselineVsCurrentIndex: Prisma.Decimal | number;
    beneficiaryReportedScore: Prisma.Decimal | number;
    attributionScore: Prisma.Decimal | number;
    sustainabilityIndex: Prisma.Decimal | number;
}

export function calculateOutcomeScore(
    outcomeData: OutcomeDataInput | null
): { score: number; breakdown: OutcomeBreakdown } {
    // If undefined/null (no data in DB), fallback to base 50 values to not block calculation
    if (!outcomeData) {
        return {
            score: 50.0,
            breakdown: {
                sectorKpiImprovement: 50.0,
                baselineVsCurrentIndex: 50.0,
                beneficiaryImpact: 50.0,
                attributionScore: 50.0,
                sustainabilityIndex: 50.0,
            },
        };
    }

    // 1. Safe conversions
    const baseline = Number(outcomeData.sectorKpiBaseline);
    const current = Number(outcomeData.sectorKpiCurrent);
    const baselineVsCurrentIndex = Number(outcomeData.baselineVsCurrentIndex);
    const beneficiaryReportedScore = Number(outcomeData.beneficiaryReportedScore);
    const attributionScore = Number(outcomeData.attributionScore);
    const sustainabilityIndex = Number(outcomeData.sustainabilityIndex);

    // 2. Calculate KPI (Sector KPI Improvement, 30%)
    let KPI = 0;
    if (baseline !== 0) {
        if (outcomeData.sectorKpiDirection === 'HIGHER_IS_BETTER') {
            KPI = ((current - baseline) / baseline) * 100;
        } else {
            // LOWER_IS_BETTER
            KPI = ((baseline - current) / baseline) * 100;
        }
    }
    KPI = Math.round(Math.min(Math.max(0, KPI), 100) * 100) / 100;

    // 3. Direct values
    const BCI = Math.round(Math.max(0, Math.min(baselineVsCurrentIndex, 100)) * 100) / 100; // 25%
    const BI = Math.round(Math.max(0, Math.min(beneficiaryReportedScore, 100)) * 100) / 100; // 20%
    const AS = Math.round(Math.max(0, Math.min(attributionScore, 100)) * 100) / 100; // 15%
    const SI = Math.round(Math.max(0, Math.min(sustainabilityIndex, 100)) * 100) / 100; // 10%

    // 4. Final Outcome Score (OC)
    const score = 0.30 * KPI + 0.25 * BCI + 0.20 * BI + 0.15 * AS + 0.10 * SI;

    return {
        score: Math.round(score * 100) / 100,
        breakdown: {
            sectorKpiImprovement: KPI,
            baselineVsCurrentIndex: BCI,
            beneficiaryImpact: BI,
            attributionScore: AS,
            sustainabilityIndex: SI,
        },
    };
}
