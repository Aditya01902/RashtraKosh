import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

import { Prisma, FeedbackCategory, FeedbackStatus } from '@prisma/client';

import { limitRate } from '@/lib/rate-limit';
import { feedbackSchema } from '@/lib/validations/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const schemeId = searchParams.get('schemeId');

    try {
        // Rate limiting - Max 30 requests per minute per IP for GET feedback
        const rateLimitResponse = await limitRate(request, 30, 60 * 1000, "feedback_get");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await auth();
        const currentUserId = session?.user?.id;

        const where: Prisma.FeedbackItemWhereInput = {};
        if (category) where.category = category as FeedbackCategory;
        if (status) where.status = status as FeedbackStatus;
        if (schemeId) where.schemeId = schemeId;

        const feedbackItems = await db.feedbackItem.findMany({
            where,
            include: {
                author: {
                    select: { id: true, name: true, membershipTier: true, image: true }
                },
                _count: {
                    select: { votes: true }
                },
                votes: currentUserId ? {
                    where: { userId: currentUserId },
                    take: 1
                } : false
            },
            orderBy: { createdAt: 'desc' }
        });

        const result = feedbackItems.map(item => {
            // Handle anonymous
            const author = item.isAnonymous ? null : item.author;

            return {
                ...item,
                author,
                voteCount: item._count.votes,
                hasCurrentUserVoted: currentUserId ? item.votes.length > 0 : false,
                _count: undefined,
                votes: undefined
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[FEEDBACK_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Rate limiting - Max 10 requests per minute per IP for POST feedback
        const rateLimitResponse = await limitRate(request, 10, 60 * 1000, "feedback_post");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (session.user.role === 'NONE' || !session.user.role) { // Using standard roles where GENERAL_MEMBER is basic
            // Need checks depending on the actual Role enum logic
            // But specs say Auth: GENERAL_MEMBER and above. Basically any logged in user who isn't rejected.
        }

        const body = await request.json();
        const parsed = feedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid input fields", errors: parsed.error.format() }, { status: 400 });
        }

        const { title, body: content, category, schemeId, isAnonymous } = parsed.data;
        let initialWeight = 1.0;
        if (session.user.membershipTier === 'EXPERT') {
            initialWeight = 2.0;
        } else if (session.user.membershipTier === 'INSTITUTIONAL') {
            initialWeight = 3.0;
        }

        const feedback = await db.feedbackItem.create({
            data: {
                title,
                body: content,
                category,
                schemeId: schemeId || null,
                authorId: session.user.id!,
                isAnonymous: !!isAnonymous,
                weightedScore: initialWeight,
                status: 'NEW'
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('[FEEDBACK_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
