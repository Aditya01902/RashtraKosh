"use client";

import { useEffect, useState } from "react";
import { useUploadStore } from "@/store/upload";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Loader2, BarChart3, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Step3Review() {
    const { file, parsedData, scorePreview, commitSummary, setScorePreview, setStep, reset } = useUploadStore();
    const [isCommitting, setIsCommitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Mock the score preview generation
        if (!scorePreview) {
            setTimeout(() => {
                setScorePreview(
                    [
                        { name: "Pradhan Mantri Jan Arogya Yojana", oldScore: 82, newScore: 88 },
                        { name: "Jal Jeevan Mission", oldScore: 75, newScore: 74 },
                        { name: "PM KISAN", oldScore: 91, newScore: 92 },
                        { name: "Swachh Bharat Mission", oldScore: 88, newScore: 89 },
                        { name: "National Rural Livelihood Mission", oldScore: 78, newScore: 81 }
                    ],
                    { ministriesAffected: 4, schemesUpdated: parsedData.length, scoresToRecalculate: parsedData.length * 2 }
                );
            }, 1000);
        }
    }, [scorePreview, parsedData.length, setScorePreview]);

    const handleCommit = async () => {
        setIsCommitting(true);
        try {
            // Mock API call to /api/upload/commit
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCommitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto w-full text-center">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
                    <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload Successful</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    Successfully committed {parsedData.length} rows to the database. All relevant schemes have been flagged for score recalculation.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            reset();
                        }}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md font-medium transition-colors"
                    >
                        Upload Another File
                    </button>
                    <button
                        onClick={() => {
                            router.push("/admin/dashboard");
                        }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Score Preview */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Score Impact Preview</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">First 5 schemes</p>
                        </div>
                    </div>

                    {!scorePreview ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                            <p className="text-sm text-slate-500">Generating preview...</p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-3">
                            {scorePreview.map((scheme, idx) => {
                                const diff = scheme.newScore - scheme.oldScore;
                                const isPositive = diff > 0;
                                const isNegative = diff < 0;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <span className="text-sm font-medium truncate flex-1 pr-4">{scheme.name}</span>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-sm text-slate-500">{scheme.oldScore}</span>
                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                            <span className="text-sm font-bold">{scheme.newScore}</span>
                                            {diff !== 0 && (
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'}`}>
                                                    {isPositive ? '+' : ''}{diff}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Commit Summary */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Commit Summary</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ready to update database</p>
                        </div>
                    </div>

                    {!commitSummary ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">File</span>
                                <span className="text-sm font-semibold truncate max-w-[200px]">{file?.name}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Rows</span>
                                <span className="text-lg font-bold">{parsedData.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Ministries Affected</span>
                                <span className="text-lg font-bold">{commitSummary.ministriesAffected}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                        <button
                            disabled={isCommitting}
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-4 py-2 rounded-md font-medium text-sm transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back
                        </button>
                        <button
                            onClick={handleCommit}
                            disabled={isCommitting || !commitSummary}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCommitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isCommitting ? "Committing..." : "Commit to Database"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
