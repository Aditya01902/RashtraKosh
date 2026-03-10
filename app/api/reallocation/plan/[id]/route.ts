import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MINISTRY_ADMIN', 'ANALYST'];

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
        }

        const plan = await prisma.reallocPlan.findUnique({
            where: { id },
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Fetch Plan Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
