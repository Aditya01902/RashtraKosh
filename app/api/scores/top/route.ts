import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-response';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || '2024-25';
    const n = parseInt(searchParams.get('n') || '10', 10);

    try {
        const topSchemes = await db.schemeScore.findMany({
            where: { fiscalYear: fy },
            include: {
                scheme: {
                    select: {
                        name: true,
                        department: { select: { ministry: { select: { name: true, shortCode: true } } } }
                    }
                }
            },
            orderBy: { finalScore: 'desc' },
            take: n,
        });

        return NextResponse.json(topSchemes);
    } catch (error) {
        console.error('[SCORES_TOP_GET]', error);
        return handleApiError(error);
    }
}
