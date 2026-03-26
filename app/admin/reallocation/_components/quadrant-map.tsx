"use client";


import { IdleScheme } from "@/store/reallocation";

interface QuadrantMapProps {
    schemes: IdleScheme[];
}

export default function QuadrantMap({ schemes }: QuadrantMapProps) {


    const getPosition = (xVal: number, yVal: number) => {
        // Return % for left and top
        // xVal: 0 -> left: 0%, 100 -> left: 100%
        // yVal: 0 -> bottom! So top is 100 - yVal
        return {
            left: `${Math.max(0, Math.min(100, xVal))}%`,
            top: `${Math.max(0, Math.min(100, 100 - yVal))}%`
        };
    };

    const getDotSize = (budget: number) => {
        // arbitrary scaling
        const base = 8;
        const scaled = Math.sqrt(budget) / 10;
        return Math.max(8, Math.min(30, base + scaled));
    };

    const getQuadrantColor = (quadrant: string) => {
        switch (quadrant) {
            case "EFFICIENT": return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
            case "OVERFUNDED": return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
            case "STARVED": return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
            case "FAILING": return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
            default: return "bg-slate-500";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Efficiency-Utilization Matrix</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Identify funding outliers and reallocation candidates.</p>
            </div>

            <div className="flex-1 relative border-l-2 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 mt-4 rounded-tr-lg rounded-bl-lg">
                {/* Quadrant Lines */}
                <div className="absolute left-[70%] top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-700 border-r border-dashed border-slate-400 dark:border-slate-600" />
                <div className="absolute top-[30%] left-0 right-0 h-px bg-slate-300 dark:bg-slate-700 border-b border-dashed border-slate-400 dark:border-slate-600" />

                {/* Quadrant Labels */}
                <div className="absolute top-4 right-4 text-right opacity-50">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">EFFICIENT</p>
                    <p className="text-[10px] text-slate-500 max-w-[120px]">High impact, good utilization. Keep funding.</p>
                </div>
                <div className="absolute bottom-4 right-4 text-right opacity-50">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">OVERFUNDED</p>
                    <p className="text-[10px] text-slate-500 max-w-[120px]">Low utilization despite high budget. Reclaim funds.</p>
                </div>
                <div className="absolute top-4 left-4 opacity-50">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">STARVED</p>
                    <p className="text-[10px] text-slate-500 max-w-[120px]">High impact, low utilization. Needs more targeted funds.</p>
                </div>
                <div className="absolute bottom-4 left-4 opacity-50">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">FAILING</p>
                    <p className="text-[10px] text-slate-500 max-w-[120px]">Low impact, low utilization. Restructure or scrap.</p>
                </div>

                {/* Axis Labels */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500">
                    Utilization Score →
                </div>
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-semibold text-slate-500 whitespace-nowrap">
                    Final Score →
                </div>

                {/* Data Points */}
                {schemes.map((s) => {
                    const { left, top } = getPosition(s.utilizationScore, s.finalScore);
                    const size = getDotSize(s.allocatedCapital + s.allocatedRevenue);
                    return (
                        <div
                            key={s.id}
                            className={`absolute rounded-full border border-white dark:border-slate-800 group cursor-pointer transition-transform hover:scale-125 z-10 ${getQuadrantColor(s.quadrant)}`}
                            style={{
                                left,
                                top,
                                width: size,
                                height: size,
                                transform: `translate(-50%, -50%)`
                            }}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md p-2 w-48 shadow-lg z-50 pointer-events-none">
                                <p className="font-bold mb-1 truncate">{s.name}</p>
                                <div className="flex justify-between mt-1">
                                    <span className="text-slate-400">U-Score:</span>
                                    <span>{s.utilizationScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">F-Score:</span>
                                    <span>{s.finalScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Budget:</span>
                                    <span>₹{(s.allocatedCapital + s.allocatedRevenue).toLocaleString()} Cr</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
