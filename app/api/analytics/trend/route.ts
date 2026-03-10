import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { handleApiError } from '@/lib/api-response';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ministryId = searchParams.get('ministryId');

    try {
        const allocWhere: Prisma.BudgetAllocationWhereInput = {
            schemeId: { not: null }
        };
        if (ministryId) {
            allocWhere.scheme = { department: { ministryId } };
        }
        const allocations = await db.budgetAllocation.findMany({ where: allocWhere });

        const scoreWhere: Prisma.SchemeScoreWhereInput = {};
        if (ministryId) {
            scoreWhere.scheme = { department: { ministryId } };
        }
        const scores = await db.schemeScore.findMany({ where: scoreWhere });

        const fyData: Record<string, { totalAllocated: number, totalUtilized: number, totalScoreCount: number, sumFinalScore: number }> = {};

        for (const alloc of allocations) {
            if (!fyData[alloc.fiscalYear]) {
                fyData[alloc.fiscalYear] = { totalAllocated: 0, totalUtilized: 0, totalScoreCount: 0, sumFinalScore: 0 };
            }
            fyData[alloc.fiscalYear].totalAllocated += Number(alloc.allocated);
            fyData[alloc.fiscalYear].totalUtilized += Number(alloc.utilized);
        }

        for (const score of scores) {
            if (!fyData[score.fiscalYear]) {
                fyData[score.fiscalYear] = { totalAllocated: 0, totalUtilized: 0, totalScoreCount: 0, sumFinalScore: 0 };
            }
            fyData[score.fiscalYear].totalScoreCount++;
            fyData[score.fiscalYear].sumFinalScore += Number(score.finalScore);
        }

        const trend = Object.entries(fyData).map(([fiscalYear, data]) => ({
            fiscalYear,
            totalAllocated: data.totalAllocated,
            totalUtilized: data.totalUtilized,
            avgFinalScore: data.totalScoreCount > 0 ? (data.sumFinalScore / data.totalScoreCount) : 0,
        })).sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));

        return NextResponse.json(trend);
    } catch (error) {
        console.error('[ANALYTICS_TREND_GET]', error);
        return handleApiError(error);
    }
}
