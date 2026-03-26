"use client";

import { useState, useEffect } from "react";
import { Download, ShieldCheck, Loader2 } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";

interface Summary {
    totalCurrent: number;
    totalProposed: number;
    netChange: number;
    netChangePercent: number;
    envelopeRemaining: number;
}

interface Plan {
    id: string;
    name: string;
    ministry: string;
    score: number;
    currentAllocation: number;
    currentCapital: number;
    currentRevenue: number;
    proposedAllocation: number;
    proposedCapital: number;
    proposedRevenue: number;
    deltaAmount: number;
    deltaPercent: number;
    scoreMultiplier: number;
    priorityWeight: number;
    absorptionFactor: number;
    rationale: string;
    isFloorApplied?: boolean;
}

interface ReallocationData {
    summary: Summary;
    plans: Plan[];
}

export default function NextYearClient() {
    const [data, setData] = useState<ReallocationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ministryFilter, setMinistryFilter] = useState("ALL");
    const ceiling = 50000;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/reallocation/next-year?fy=2025-26&ceiling=${ceiling}`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500">Calculating projections...</p>
            </div>
        );
    }

    if (!data) return <div className="p-10 text-center text-slate-500">Failed to load projections</div>;

    const { summary, plans } = data;

    const filteredPlans = ministryFilter === "ALL"
        ? plans
        : plans.filter((p: Plan) => p.ministry === ministryFilter);

    const ministries = Array.from(new Set(plans.map((p: Plan) => p.ministry)));

    return (
        <div className="flex flex-col gap-6">
            {/* Controls & Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Filter Ministry</label>
                        <select
                            value={ministryFilter}
                            onChange={(e) => setMinistryFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Ministries</option>
                            {ministries.map((m) => (
                                <option key={m as string} value={m as string}>{m as string}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                    <Download className="h-4 w-4" /> Export to Excel
                </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Current</p>
                    <p className="text-xl font-bold mt-1">₹{summary.totalCurrent.toLocaleString()} Cr</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Proposed</p>
                    <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">₹{summary.totalProposed.toLocaleString()} Cr</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Net Change</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className={`text-xl font-bold ${summary.netChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {summary.netChange >= 0 ? '+' : ''}₹{summary.netChange.toLocaleString()} Cr
                        </p>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${summary.netChangePercent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {summary.netChangePercent >= 0 ? '+' : ''}{summary.netChangePercent.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Envelope Remaining</p>
                    <p className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">₹{summary.envelopeRemaining.toLocaleString()} Cr</p>
                </div>
            </div>

            {/* Projection Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Scheme & Ministry</th>
                                <th className="px-4 py-3 font-semibold text-center">Score</th>
                                <th className="px-4 py-3 font-semibold text-right">Current (C / R)</th>
                                <th className="px-4 py-3 font-semibold text-right">Proposed (C / R)</th>
                                <th className="px-4 py-3 font-semibold">Δ Change</th>
                                <th className="px-4 py-3 font-semibold text-center">Factors (S / P / A)</th>
                                <th className="px-4 py-3 font-semibold min-w-[200px]">Rationale</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredPlans.map((plan: Plan) => {
                                const isPositive = plan.deltaAmount >= 0;
                                // max bar width calculation
                                const maxDelta = Math.max(...plans.map((p: Plan) => Math.abs(p.deltaAmount)));
                                const barWidth = `${(Math.abs(plan.deltaAmount) / maxDelta) * 100}%`;

                                return (
                                    <tr key={plan.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${plan.isFloorApplied ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {plan.isFloorApplied && (
                                                    <div className="shrink-0 group relative">
                                                        <ShieldCheck className="h-4 w-4 text-amber-500" />
                                                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-white text-xs p-1.5 rounded w-32 whitespace-normal z-10 transition-opacity">
                                                            Floor protection applied to prevent critical defunding.
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px]" title={plan.name}>{plan.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{plan.ministry}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center w-24">
                                            <ScoreRing score={Number(plan.score) || 0} size={40} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <p className="font-bold text-slate-700 dark:text-slate-300">₹{plan.currentAllocation}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">C: {plan.currentCapital} | R: {plan.currentRevenue}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <p className="font-bold text-slate-900 dark:text-slate-100">₹{plan.proposedAllocation}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">C: {plan.proposedCapital} | R: {plan.proposedRevenue}</p>
                                        </td>
                                        <td className="px-4 py-3 w-40">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-bold text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                        {isPositive ? '+' : ''}₹{plan.deltaAmount}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                        {isPositive ? '+' : ''}{plan.deltaPercent}%
                                                    </span>
                                                </div>
                                                {/* Visual Change Bar */}
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                                    {/* If negative, right aligned bar in left half conceptually, but lets just draw it simple relative to full width */}
                                                    <div
                                                        className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: barWidth }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                <span>{plan.scoreMultiplier.toFixed(2)}</span>
                                                <span className="text-slate-300">|</span>
                                                <span>{plan.priorityWeight.toFixed(2)}</span>
                                                <span className="text-slate-300">|</span>
                                                <span>{plan.absorptionFactor.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate w-full" title={plan.rationale}>{plan.rationale}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
