import { auth } from "@/lib/auth";
import QuadrantMap from "./_components/quadrant-map";
import IdleScanner from "./_components/idle-scanner";
import ReallocationWizard from "./_components/reallocation-wizard";
import ReallocationInit from "./_components/reallocation-init";

export default async function ReallocationEnginePage() {
    const session = await auth();

    // Make fetch request using full URL for the server component
    // Assuming the user is running dev server on localhost:3000
    // Next.js approach is typically directly resolving data in SC rather than fetch API routes,
    // but to adhere strictly to the rules, I can either reproduce the logic here
    // or use full URL. Since Next.js `fetch` requires absolute URL on server:

    // I will directly invoke the mock logic here to avoid absolute URL fetch issues in Next.js app router
    const idleSchemes = [
        {
            id: "scheme_1",
            name: "National Highway Expansion Phase II",
            ministryName: "MoRTH",
            utilizationScore: 45,
            finalScore: 50,
            allocatedCapital: 12000,
            allocatedRevenue: 500,
            capitalIdle: 4000,
            revenueIdle: 100,
            totalIdle: 4100,
            rootCause: "Land Acquisition Delay",
            risk: "MEDIUM",
            quadrant: "FAILING",
        },
        {
            id: "scheme_2",
            name: "Rural Digital Literacy",
            ministryName: "MeitY",
            utilizationScore: 30,
            finalScore: 65,
            allocatedCapital: 500,
            allocatedRevenue: 1500,
            capitalIdle: 300,
            revenueIdle: 800,
            totalIdle: 1100,
            rootCause: "Procurement Bottleneck",
            risk: "HIGH",
            quadrant: "OVERFUNDED",
        },
        {
            id: "scheme_3",
            name: "Smart Cities Mission",
            ministryName: "MoHUA",
            utilizationScore: 55,
            finalScore: 58,
            allocatedCapital: 8000,
            allocatedRevenue: 2000,
            capitalIdle: 2000,
            revenueIdle: 500,
            totalIdle: 2500,
            rootCause: "Vendor onboarding",
            risk: "LOW",
            quadrant: "FAILING",
        }
    ];

    const efficientSchemes = [
        {
            id: "scheme_4",
            name: "Pradhan Mantri Awas Yojana (Urban)",
            ministryName: "MoHUA",
            utilizationScore: 95,
            finalScore: 88,
            allocatedCapital: 15000,
            allocatedRevenue: 1000,
            capitalIdle: 0,
            revenueIdle: 0,
            totalIdle: 0,
            rootCause: "None",
            risk: "LOW",
            quadrant: "EFFICIENT",
            absorptionCapacity: 5000, // Important
            capitalNeed: 4000,
            revenueNeed: 1000,
        },
        {
            id: "scheme_5",
            name: "Jal Jeevan Mission",
            ministryName: "Jal Shakti",
            utilizationScore: 92,
            finalScore: 82,
            allocatedCapital: 20000,
            allocatedRevenue: 2000,
            capitalIdle: 0,
            revenueIdle: 0,
            totalIdle: 0,
            rootCause: "None",
            risk: "LOW",
            quadrant: "STARVED",
            absorptionCapacity: 8000, // Important
            capitalNeed: 6000,
            revenueNeed: 2000,
        }
    ];

    const allSchemes = [...idleSchemes, ...efficientSchemes];

    const summary = {
        idleCount: idleSchemes.length,
        inefficientCount: idleSchemes.filter(s => s.utilizationScore < 60).length,
        reclaimableCapital: idleSchemes.reduce((sum, s) => sum + s.capitalIdle, 0),
        reclaimableRevenue: idleSchemes.reduce((sum, s) => sum + s.revenueIdle, 0),
    };

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full pb-10">
            <ReallocationInit idleSchemes={idleSchemes as any} recipientCandidates={efficientSchemes as any} />

            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Reallocation Engine</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Identify idle funds and reallocate them to high-performing schemes to maximize budget efficiency.
                </p>
            </div>

            {/* Section A: Summary Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Idle Schemes</p>
                    <p className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{summary.idleCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inefficient Spend</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{summary.inefficientCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reclaimable Capital</p>
                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">₹{summary.reclaimableCapital.toLocaleString()} Cr</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reclaimable Revenue</p>
                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">₹{summary.reclaimableRevenue.toLocaleString()} Cr</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <QuadrantMap schemes={allSchemes as any} />
                <ReallocationWizard />
            </div>

            <div className="w-full">
                <IdleScanner schemes={idleSchemes as any} />
            </div>

        </div>
    );
}
