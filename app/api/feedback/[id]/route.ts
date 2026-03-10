import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Prisma, FeedbackStatus } from '@prisma/client';
import { handleApiError } from '@/lib/api-response';


export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const feedback = await db.feedbackItem.findUnique({
            where: { id: params.id },
            include: {
                scheme: {
                    include: { department: true }
                }
            }
        });

        if (!feedback) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
        const isMinistryAdmin = session.user.role === 'MINISTRY_ADMIN';
        const ministryId = session.user.ministryId;

        // Auth check: SUPER_ADMIN or MINISTRY_ADMIN of the same ministry
        let allowed = isSuperAdmin;
        if (!allowed && isMinistryAdmin) {
            if (feedback.scheme?.department?.ministryId === ministryId) {
                allowed = true;
            }
        }

        if (!allowed) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await request.json();
        const { status, adminNote } = body;

        const dataToUpdate: Prisma.FeedbackItemUpdateInput = {};
        if (status !== undefined) dataToUpdate.status = status as FeedbackStatus;
        if (adminNote !== undefined) dataToUpdate.adminNote = adminNote;

        const updatedFeedback = await db.feedbackItem.update({
            where: { id: params.id },
            data: dataToUpdate
        });

        return NextResponse.json(updatedFeedback);
    } catch (error) {
        console.error('[FEEDBACK_ID_PATCH]', error);
        return handleApiError(error);
    }
}
