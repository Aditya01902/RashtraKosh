import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { schemeId, insightText } = body;

        if (!schemeId || !insightText) {
            return new NextResponse("Missing data", { status: 400 });
        }

        // Find the latest score for this scheme to append the insight
        const scheme = await db.scheme.findUnique({
            where: { id: schemeId },
            include: { scores: { orderBy: { fiscalYear: 'asc' } } }
        });

        if (!scheme || scheme.scores.length === 0) {
            return new NextResponse("Scheme or Scores not found", { status: 404 });
        }

        const latestScore = scheme.scores[scheme.scores.length - 1];

        await db.schemeScore.update({
            where: { id: latestScore.id },
            data: { aiInsight: insightText.trim() } as any
        });

        return NextResponse.json({ success: true, updatedScoreId: latestScore.id });

    } catch (error: any) {
        console.error('[SaveInsight] Fatal Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
