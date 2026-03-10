import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchSchemesWithScores } from '@/lib/reallocation/data-fetcher';
import { projectNextYear } from '@/lib/reallocation/next-year-projector';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MINISTRY_ADMIN', 'ANALYST'];

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const fy = searchParams.get('fy') || '2025-26';
        const ceilingParam = searchParams.get('ceiling');
        const budgetCeiling = ceilingParam ? parseFloat(ceilingParam) : 550000000;

        // Use current year data to project next year
        const currentFy = '2024-25'; // Default or dynamically fetched
        const schemes = await fetchSchemesWithScores(currentFy);

        const projections = projectNextYear(schemes, budgetCeiling, { fiscalYear: fy });

        return NextResponse.json(projections);
    } catch (error) {
        console.error('Next Year Projection API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
