import NextYearClient from "./_components/next-year-client";

export default function NextYearPlanPage() {
    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">FY 2025-26 Budget Plan</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-3xl">
                    Automated budget projections based on the algorithmic formula factoring in scheme performance scores, sector priorities, and absorption capacity. Floor protections prevent critical infrastructure from extreme funding cuts.
                </p>
            </div>

            {/* Formula Explainer */}
            <div className="bg-slate-900 text-slate-300 p-5 rounded-lg border border-slate-800 font-mono text-sm shadow-inner overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-blue-400 font-bold mb-2">{"// RashtraKosh Budget Projection Formula"}</p>
                <p>
                    <span className="text-amber-300">ProposedAllocation</span> = max(
                </p>
                <p className="pl-6">
                    <span className="text-emerald-300">CurrentAllocation</span> × (
                    <span className="text-purple-400">ScoreMultiplier</span> ×
                    <span className="text-pink-400">PriorityWeight</span> ×
                    <span className="text-cyan-400">AbsorptionFactor</span>
                    ),
                </p>
                <p className="pl-6">
                    <span className="text-emerald-300">CurrentAllocation</span> × 0.85 <span className="text-slate-500 italic">{"/* 15% Floor protection */"}</span>
                </p>
                <p>
                    )
                </p>
            </div>

            <NextYearClient />
        </div>
    );
}
