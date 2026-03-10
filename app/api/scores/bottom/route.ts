import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-response';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';
    const n = parseInt(searchParams.get('n') || '5', 10);

    try {
        const bottomSchemes = await db.schemeScore.findMany({
            where: { fiscalYear: fy },
            include: {
                scheme: {
                    select: {
                        name: true,
                        department: { select: { ministry: { select: { name: true, shortCode: true } } } }
                    }
                }
            },
            orderBy: { finalScore: 'asc' },
            take: n,
        });

        return NextResponse.json(bottomSchemes);
    } catch (error) {
        console.error('[SCORES_BOTTOM_GET]', error);
        return handleApiError(error);
    }
}
