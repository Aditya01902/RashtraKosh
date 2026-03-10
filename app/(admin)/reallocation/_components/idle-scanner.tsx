"use client";

import { IdleScheme } from "@/store/reallocation";
import { AlertCircle, AlertTriangle, ArrowDownRight } from "lucide-react";

interface IdleScannerProps {
    schemes: IdleScheme[];
}

export default function IdleScanner({ schemes }: IdleScannerProps) {
    const sortedSchemes = [...schemes].sort((a, b) => b.totalIdle - a.totalIdle);

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case "HIGH": return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"><AlertCircle className="h-3 w-3" /> HIGH</span>;
            case "MEDIUM": return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><AlertTriangle className="h-3 w-3" /> MED</span>;
            default: return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">LOW</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Idle Money Scanner</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Prioritized list of unutilized funds available for reallocation.</p>
            </div>

            <div className="flex-1 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase">
                        <tr>
                            <th className="px-4 py-3 font-medium">Scheme & Ministry</th>
                            <th className="px-4 py-3 font-medium">Root Cause</th>
                            <th className="px-4 py-3 font-medium text-right">Capital Idle</th>
                            <th className="px-4 py-3 font-medium text-right">Revenue Idle</th>
                            <th className="px-4 py-3 font-medium text-right">Total Idle</th>
                            <th className="px-4 py-3 font-medium text-center">Risk</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {sortedSchemes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No idle schemes detected.</td>
                            </tr>
                        ) : sortedSchemes.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{s.ministryName}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {s.rootCause}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-mono ${s.capitalIdle > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}`}>
                                        ₹{s.capitalIdle.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-mono ${s.revenueIdle > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
                                        ₹{s.revenueIdle.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <ArrowDownRight className="h-3 w-3 text-slate-400" />
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">₹{s.totalIdle.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getRiskBadge(s.risk)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
