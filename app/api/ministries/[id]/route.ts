import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aggregateScores } from '@/lib/scoring/final';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';

    try {
        const ministry = await db.ministry.findUnique({
            where: { id: params.id },
            include: {
                budgetAllocations: {
                    where: { fiscalYear: fy }
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
            }
        });

        if (!ministry) {
            return new NextResponse("Not Found", { status: 404 });
        }

        let totalAllocated = 0;
        let totalUtilized = 0;
        const schemesForAggregation: Array<{ finalScore: number, allocated: number }> = [];

        const departmentsWithScores = ministry.departments.map(dept => {
            const schemesForDeptAggregation: Array<{ finalScore: number, allocated: number }> = [];

            const schemesWithScores = dept.schemes.map(scheme => {
                const allocation = scheme.budgetAllocations[0];
                const score = scheme.scores[0];

                const allocated = allocation ? Number(allocation.allocated) : 0;
                const utilized = allocation ? Number(allocation.utilized) : 0;
                const finalScore = score ? Number(score.finalScore) : null;

                if (allocation) {
                    totalAllocated += allocated;
                    totalUtilized += utilized;
                    if (score) {
                        const scoreData = { finalScore: finalScore!, allocated };
                        schemesForAggregation.push(scoreData);
                        schemesForDeptAggregation.push(scoreData);
                    }
                }

                return {
                    id: scheme.id,
                    name: scheme.name,
                    isActive: scheme.isActive,
                    priorityCategory: scheme.priorityCategory,
                    allocated,
                    utilized,
                    utilizationPct: allocated > 0 ? Math.round((utilized / allocated) * 10000) / 100 : 0,
                    finalScore,
                    scoreVersion: score?.scoreVersion
                };
            });

            return {
                id: dept.id,
                name: dept.name,
                schemes: schemesWithScores,
                avgFinalScore: aggregateScores(schemesForDeptAggregation)
            };
        });

        const avgFinalScore = aggregateScores(schemesForAggregation);
        const utilizationPct = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

        return NextResponse.json({
            id: ministry.id,
            name: ministry.name,
            shortCode: ministry.shortCode,
            color: ministry.color,
            description: ministry.description,
            sector: ministry.sector,
            totalAllocated,
            totalUtilized,
            utilizationPct: Math.round(utilizationPct * 100) / 100,
            avgFinalScore,
            departmentCount: ministry.departments.length,
            departments: departmentsWithScores
        });
    } catch (error) {
        console.error('[MINISTRY_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
