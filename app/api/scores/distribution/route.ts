import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { classifyScore, ScoreRating } from '@/lib/scoring/final';
import { handleApiError } from '@/lib/api-response';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';

    try {
        const scores = await db.schemeScore.findMany({
            where: { fiscalYear: fy },
            select: { finalScore: true },
        });

        const distribution: Record<ScoreRating, number> & { total: number } = {
            EXCELLENT: 0,
            GOOD: 0,
            AVERAGE: 0,
            POOR: 0,
            CRITICAL: 0,
            total: scores.length,
        };

        for (const score of scores) {
            const rating = classifyScore(Number(score.finalScore));
            distribution[rating]++;
        }

        return NextResponse.json(distribution);
    } catch (error) {
        console.error('[SCORES_DISTRIBUTION_GET]', error);
        return handleApiError(error);
    }
}
