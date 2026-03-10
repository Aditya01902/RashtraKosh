import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import FeedbackClient from "./_components/feedback-client";

export default async function FeedbackInboxPage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    // Fetch all feedback items
    const feedbackItems = await db.feedbackItem.findMany({
        include: {
            author: {
                select: {
                    name: true,
                    membershipTier: true,
                    credentialVerified: true
                }
            },
            scheme: {
                select: {
                    name: true
                }
            }
        },
        orderBy: [
            { weightedScore: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    // Calculate Stats
    const newCount = feedbackItems.filter(i => i.status === "NEW").length;
    const reviewCount = feedbackItems.filter(i => i.status === "UNDER_REVIEW").length;
    const incorporatedCount = feedbackItems.filter(i => i.status === "INCORPORATED").length;
    const expertCount = feedbackItems.filter(i =>
        (i.author.membershipTier === "EXPERT" || i.author.membershipTier === "INSTITUTIONAL") &&
        Number(i.weightedScore) >= 1.5
    ).length;

    const stats = {
        newCount,
        reviewCount,
        incorporatedCount,
        expertCount
    };

    // Convert Decimal to number for client component
    const formattedItems = feedbackItems.map(item => ({
        ...item,
        weightedScore: Number(item.weightedScore)
    }));

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full pb-10 flex-1 h-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Feedback Inbox</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Review, categorize, and compile public and expert feedback for policy formulation.
                </p>
            </div>

            <FeedbackClient initialData={formattedItems} stats={stats} />
        </div>
    );
}
