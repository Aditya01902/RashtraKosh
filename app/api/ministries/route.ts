import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aggregateScores } from '@/lib/scoring/final';

export const dynamic = 'force-dynamic';
// export const revalidate = 3600; // Removed to fix loading issues on cold starts

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';

    try {
        const ministries = await db.ministry.findMany({
            include: {
                budgetAllocations: {
                    where: { fiscalYear: fy },
                },
                departments: {
                    include: {
                        schemes: {
                            include: {
                                scores: {
                                    where: { fiscalYear: fy }
                                },
                                budgetAllocations: {
                                    where: { fiscalYear: fy }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        const result = ministries.map((min) => {
            let totalAllocated = 0;
            let totalUtilized = 0;

            const schemesForAggregation: Array<{ finalScore: number, allocated: number }> = [];

            min.departments.forEach((dept) => {
                dept.schemes.forEach((scheme) => {
                    const allocation = scheme.budgetAllocations[0];
                    const score = scheme.scores[0];

                    if (allocation) {
                        totalAllocated += Number(allocation.allocated);
                        totalUtilized += Number(allocation.utilized);

                        if (score) {
                            schemesForAggregation.push({
                                finalScore: Number(score.finalScore),
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

        return NextResponse.json(result);
    } catch (error) {
        console.error('[MINISTRIES_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
