import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchSchemesWithScores } from '@/lib/reallocation/data-fetcher';
import { detectIdleMoney } from '@/lib/reallocation/idle-detector';
import { generateReallocPlan } from '@/lib/reallocation/plan-generator';
import { db as prisma } from '@/lib/db';

import { Prisma } from '@prisma/client';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MINISTRY_ADMIN', 'ANALYST'];

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { donorSchemeIds, recipientSchemeIds, fiscalYear } = body;

        if (!donorSchemeIds || !recipientSchemeIds || !fiscalYear || !Array.isArray(donorSchemeIds) || !Array.isArray(recipientSchemeIds)) {
            return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
        }

        const allSchemes = await fetchSchemesWithScores(fiscalYear);
        const allIdle = detectIdleMoney(allSchemes);

        const donors = allIdle.filter(d => donorSchemeIds.includes(d.schemeId));
        const recipients = allSchemes.filter(s => recipientSchemeIds.includes(s.id));

        const flows = generateReallocPlan(donors, recipients, { fiscalYear });

        let totalCapital = 0;
        let totalRevenue = 0;
        flows.forEach(flow => {
            totalCapital += flow.amountCapital;
            totalRevenue += flow.amountRevenue;
        });

        const plan = await prisma.reallocPlan.create({
            data: {
                fiscalYear,
                createdBy: session.user.id,
                status: 'DRAFT',
                totalCapitalReallocated: totalCapital,
                totalRevenueReallocated: totalRevenue,
                planData: flows as unknown as Prisma.InputJsonValue,
            }
        });

        return NextResponse.json({ planId: plan.id, flows });
    } catch (error) {
        console.error('Plan Generation API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
