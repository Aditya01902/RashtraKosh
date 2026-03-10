import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { FileUp, Replace, CalendarClock, MessageSquare, Target, Activity, Clock, Inbox } from "lucide-react";
import RecalculateButton from "@/components/admin/recalculate-button";

export default async function AdminDashboard() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    // Fetch stats concurrently
    const [
        totalSchemes,
        scoresCalculated,
        lastUpload,
        pendingFeedback
    ] = await Promise.all([
        db.scheme.count(),
        db.schemeScore.count(),
        db.uploadLog.findFirst({ orderBy: { createdAt: 'desc' } }),
        db.feedbackItem.count({ where: { status: 'NEW' } })
    ]);

    const cards = [
        { name: "Data Upload", href: "/admin/upload", icon: FileUp, desc: "Upload and map scheme data", color: "bg-blue-500" },
        { name: "Reallocation Engine", href: "/admin/reallocation", icon: Replace, desc: "Analyze and shift idle funds", color: "bg-emerald-500" },
        { name: "FY 2025-26 Plan", href: "/admin/next-year", icon: CalendarClock, desc: "Budget projections & constraints", color: "bg-indigo-500" },
        { name: "Feedback Inbox", href: "/admin/feedback-inbox", icon: MessageSquare, desc: "Review scheme feedback", color: "bg-orange-500" },
    ];

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Welcome to the policymaker console. Manage schemes, recalculate scores, and reallocate budgets.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Schemes</p>
                        <p className="text-2xl font-bold">{totalSchemes}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Scores Calculated</p>
                        <p className="text-2xl font-bold">{scoresCalculated}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Upload</p>
                        <p className="text-xl font-bold">{lastUpload ? lastUpload.createdAt.toLocaleDateString() : 'Never'}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg">
                        <Inbox className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Feedback</p>
                        <p className="text-2xl font-bold">{pendingFeedback}</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link key={card.name} href={card.href} className="group flex flex-col bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                <div className={`${card.color} text-white p-3 rounded-lg w-fit mb-4`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {card.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {card.desc}
                                </p>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {role === "SUPER_ADMIN" && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
                    <h2 className="text-lg font-semibold mb-2">System Controls</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-2xl">
                        Triggering a recalculation will re-evaluate all scheme scores for the selected fiscal year. This process may take a few moments depending on the data volume.
                    </p>
                    <RecalculateButton />
                </div>
            )}
        </div>
    );
}
