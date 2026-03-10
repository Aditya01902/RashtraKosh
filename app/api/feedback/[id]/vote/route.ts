import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = session.user.id!;
        const feedbackId = params.id;

        // Check if vote exists
        const existingVote = await db.feedbackVote.findUnique({
            where: {
                feedbackItemId_userId: {
                    feedbackItemId: feedbackId,
                    userId: userId
                }
            }
        });

        if (existingVote) {
            // Toggle off (delete)
            await db.feedbackVote.delete({
                where: { id: existingVote.id }
            });
        } else {
            // Toggle on (create)
            await db.feedbackVote.create({
                data: {
                    feedbackItemId: feedbackId,
                    userId: userId
                }
            });
        }

        // Return the updated count
        const voteCount = await db.feedbackVote.count({
            where: { feedbackItemId: feedbackId }
        });

        return NextResponse.json({ voteCount });
    } catch (error) {
        console.error('[FEEDBACK_VOTE_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
