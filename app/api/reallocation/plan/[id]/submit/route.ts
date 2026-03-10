import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

// Only SUPER_ADMIN and MINISTRY_ADMIN can submit plans
const ALLOWED_ROLES = ['SUPER_ADMIN', 'MINISTRY_ADMIN'];

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
        }

        const plan = await prisma.reallocPlan.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Submit Plan Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
