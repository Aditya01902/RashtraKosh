import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchSchemesWithScores } from '@/lib/reallocation/data-fetcher';
import { detectIdleMoney } from '@/lib/reallocation/idle-detector';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MINISTRY_ADMIN', 'ANALYST'];

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const fy = searchParams.get('fy') || '2024-25';

        const schemes = await fetchSchemesWithScores(fy);
        const idleSchemes = detectIdleMoney(schemes);

        // Summary calculations
        let totalIdleCapital = 0;
        let totalIdleRevenue = 0;
        const rootCauseSummary: Record<string, number> = {};

        for (const scheme of idleSchemes) {
            totalIdleCapital += scheme.reclaimableCapital;
            totalIdleRevenue += scheme.reclaimableRevenue;
            rootCauseSummary[scheme.rootCause] = (rootCauseSummary[scheme.rootCause] || 0) + 1;
        }

        return NextResponse.json({
            idleSchemes,
            totalIdleCapital,
            totalIdleRevenue,
            rootCauseSummary
        });
    } catch (error) {
        console.error('Idle money API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
