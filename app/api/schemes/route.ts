import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';
    const sort = searchParams.get('sort') || 'finalScore'; // finalScore | utilized | name
    const ministryId = searchParams.get('ministry');
    const rating = searchParams.get('rating'); // EXCELLENT, GOOD, AVERAGE, POOR, CRITICAL

    try {
        const whereClause: Prisma.SchemeWhereInput = {
            scores: {
                some: { fiscalYear: fy }
            }
        };

        if (ministryId) {
            whereClause.department = {
                ministryId: ministryId
            };
        }

        // Rating filtering must be done in memory after due to classification logic
        // but we can pre-filter schemas safely
        const schemes = await db.scheme.findMany({
            where: whereClause,
            include: {
                department: {
                    include: { ministry: { select: { name: true, shortCode: true } } }
                },
                scores: {
                    where: { fiscalYear: fy }
                },
                budgetAllocations: {
                    where: { fiscalYear: fy }
                }
            }
        });

        let results = schemes.map(scheme => {
            const score = scheme.scores[0];
            const alloc = scheme.budgetAllocations[0];
            const finalScore = score ? Number(score.finalScore) : 0;

            // Compute rating manually since classifyScore is in another module
            let currentRating = 'CRITICAL';
            if (finalScore >= 85) currentRating = 'EXCELLENT';
            else if (finalScore >= 70) currentRating = 'GOOD';
            else if (finalScore >= 55) currentRating = 'AVERAGE';
            else if (finalScore >= 40) currentRating = 'POOR';

            return {
                id: scheme.id,
                name: scheme.name,
                description: scheme.description,
                ministryName: scheme.department.ministry.name,
                ministryShortCode: scheme.department.ministry.shortCode,
                allocated: alloc ? Number(alloc.allocated) : 0,
                utilized: alloc ? Number(alloc.utilized) : 0,
                finalScore,
                rating: currentRating,
            };
        });

        if (rating) {
            results = results.filter(r => r.rating === rating);
        }

        if (sort === 'finalScore') {
            results.sort((a, b) => b.finalScore - a.finalScore);
        } else if (sort === 'utilized') {
            results.sort((a, b) => b.utilized - a.utilized);
        } else if (sort === 'name') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('[SCHEMES_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
