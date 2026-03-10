import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-response';


export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const scores = await db.schemeScore.findMany({
            where: { schemeId: params.id },
            orderBy: { fiscalYear: 'asc' }
        });

        return NextResponse.json(scores);
    } catch (error) {
        console.error('[SCHEME_SCORES_GET]', error);
        return handleApiError(error);
    }
}
