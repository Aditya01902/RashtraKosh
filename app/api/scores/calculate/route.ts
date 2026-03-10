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
        // Auth: Admin roles only
        if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'MINISTRY_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { schemeId, fiscalYear } = body;

        if (!schemeId || !fiscalYear) {
            return NextResponse.json(
                { error: 'Missing schemeId or fiscalYear' },
                { status: 400 }
            );
        }

        // 1. Fetch required data
        const allocation = await db.budgetAllocation.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
        });

        if (!allocation) {
            return NextResponse.json(
                { error: 'Missing BudgetAllocation data for this scheme and fiscal year' },
                { status: 422 }
            );
        }

        const outputData = await db.outputData.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
        });

        const outcomeData = await db.outcomeData.findUnique({
            where: { schemeId_fiscalYear: { schemeId, fiscalYear } },
        });

        // 2. Calculate scores
        const utilization = calculateUtilizationScore(allocation);
        // Note: If outputData or outcomeData are null, the functions will use fallbacks (50)
        const output = calculateOutputScore(outputData);
        const outcome = calculateOutcomeScore(outcomeData);

        const finalScore = calculateFinalScore(
            utilization.score,
            output.score,
            outcome.score
        );

        // 3. Upsert SchemeScore
        const scoreRecord = await db.schemeScore.upsert({
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

        return NextResponse.json(scoreRecord);
    } catch (error) {
        console.error('Error calculating score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
