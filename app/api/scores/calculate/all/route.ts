import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
    calculateUtilizationScore,
    calculateOutputScore,
    calculateOutcomeScore,
    calculateFinalScore,
} from '@/lib/scoring';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Auth: SUPER_ADMIN only
        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { fiscalYear } = body;

        if (!fiscalYear) {
            return NextResponse.json(
                { error: 'Missing fiscalYear' },
                { status: 400 }
            );
        }

        // 1. Fetch all schemes
        const schemes = await db.scheme.findMany({
            where: { isActive: true },
            select: { id: true },
        });

        let calculated = 0;
        let failed = 0;
        const errors: Array<{ schemeId: string; error: string }> = [];

        // 2. Iterate and calculate for each scheme
        for (const scheme of schemes) {
            try {
                const schemeId = scheme.id;

                const allocation = await db.budgetAllocation.findUnique({
                    where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
                });

                if (!allocation) {
                    failed++;
                    errors.push({ schemeId, error: 'Missing BudgetAllocation' });
                    continue; // Skip this scheme
                }

                const outputData = await db.outputData.findUnique({
                    where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
                });

                const outcomeData = await db.outcomeData.findUnique({
                    where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
                });

                const utilization = calculateUtilizationScore(allocation);
                const output = calculateOutputScore(outputData);
                const outcome = calculateOutcomeScore(outcomeData);

                const finalScore = calculateFinalScore(
                    utilization.score,
                    output.score,
                    outcome.score
                );

                await db.schemeScore.upsert({
                    where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
                    create: {
                        schemeId,
                        fiscalYear,
                        utilizationScore: utilization.score,
                        utilizationBreakdown: utilization.breakdown as unknown as Prisma.InputJsonValue,
                        outputScore: output.score,
                        outputBreakdown: output.breakdown as unknown as Prisma.InputJsonValue,
                        outcomeScore: outcome.score,
                        outcomeBreakdown: outcome.breakdown as unknown as Prisma.InputJsonValue,
                        finalScore,
                        scoreVersion: 'v1.0',
                    },
                    update: {
                        utilizationScore: utilization.score,
                        utilizationBreakdown: utilization.breakdown as unknown as Prisma.InputJsonValue,
                        outputScore: output.score,
                        outputBreakdown: output.breakdown as unknown as Prisma.InputJsonValue,
                        outcomeScore: outcome.score,
                        outcomeBreakdown: outcome.breakdown as unknown as Prisma.InputJsonValue,
                        finalScore,
                        scoreVersion: 'v1.0',
                        calculatedAt: new Date(),
                    },
                });

                calculated++;
            } catch (err: unknown) {
                failed++;
                errors.push({
                    schemeId: scheme.id,
                    error: err instanceof Error ? err.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({ calculated, failed, errors });
    } catch (error) {
        console.error('Error calculating all scores:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
