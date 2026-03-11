import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aggregateScores } from '@/lib/scoring/final';
import { scoreCache } from '@/lib/cache';
import { handleApiError } from '@/lib/api-response';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';

    const cacheKey = `ministries_aggregate_${fy}`;
    const cachedData = scoreCache.get(cacheKey);
    if (cachedData) {
        return NextResponse.json(cachedData);
    }

    try {
        const ministries = await db.ministry.findMany({
            include: {
                budgetAllocations: {
                    where: { fiscalYear: fy },
                },
                departments: {
                    select: {
                        id: true,
                        schemes: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        const allSchemeIds = ministries.flatMap(m => m.departments.flatMap(d => d.schemes.map(s => s.id)));

        const scoresMap = new Map();
        const allocationsMap = new Map();

        if (allSchemeIds.length > 0) {
            const [allScores, allAllocations] = await Promise.all([
                db.schemeScore.findMany({
                    where: { schemeId: { in: allSchemeIds }, fiscalYear: fy },
                    select: { schemeId: true, finalScore: true }
                }),
                db.budgetAllocation.findMany({
                    where: { schemeId: { in: allSchemeIds }, fiscalYear: fy },
                    select: { schemeId: true, allocated: true, utilized: true }
                })
            ]);

            allScores.forEach(s => scoresMap.set(s.schemeId, s.finalScore));
            allAllocations.forEach(a => allocationsMap.set(a.schemeId, { allocated: a.allocated, utilized: a.utilized }));
        }

        const result = ministries.map((min) => {
            let totalAllocated = 0;
            let totalUtilized = 0;
            const schemesForAggregation: Array<{ finalScore: number, allocated: number }> = [];

            min.departments.forEach((dept) => {
                dept.schemes.forEach((scheme) => {
                    const allocation = allocationsMap.get(scheme.id);
                    const finalScore = scoresMap.get(scheme.id);

                    if (allocation) {
                        totalAllocated += Number(allocation.allocated);
                        totalUtilized += Number(allocation.utilized);

                        if (finalScore !== undefined) {
                            schemesForAggregation.push({
                                finalScore: Number(finalScore),
                                allocated: Number(allocation.allocated)
                            });
                        }
                    }
                });
            });

            const avgFinalScore = aggregateScores(schemesForAggregation);
            const utilizationPct = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

            return {
                id: min.id,
                name: min.name,
                shortCode: min.shortCode,
                color: min.color,
                description: min.description,
                sector: min.sector,
                totalAllocated,
                totalUtilized,
                utilizationPct: Math.round(utilizationPct * 100) / 100,
                avgFinalScore,
                departmentCount: min.departments.length,
            };
        });

        scoreCache.clear();
        scoreCache.set(cacheKey, result);

        return NextResponse.json(result);
    } catch (error) {
        console.error('[MINISTRIES_GET]', error);
        return handleApiError(error);
    }
}
