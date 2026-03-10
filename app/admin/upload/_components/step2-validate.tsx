"use client";

import { useEffect, useState } from "react";
import { useUploadStore } from "@/store/upload";
import { mapColumns, KNOWN_DB_FIELDS } from "@/lib/upload/column-mapper";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

export default function Step2Validate() {
    const { file, parsedData, columns, mappings, setMappings, updateMapping, setValidationResults, setStep, validationResults } = useUploadStore();
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        if (columns.length > 0 && mappings.length === 0) {
            const initialMappings = mapColumns(columns);
            setMappings(initialMappings);
        }
    }, [columns, mappings.length, setMappings]);

    const handleValidate = async () => {
        setIsValidating(true);

        try {
            // Simulate API call to /api/upload/validate
            // We will do a mock validation here
            await new Promise(resolve => setTimeout(resolve, 1500));

            const errors = [];
            let valid = 0;
            let rejected = 0;

            // Ensure some critical fields are mapped
            const hasSchemeId = mappings.some(m => m.dbField === 'schemeId');
            if (!hasSchemeId) {
                errors.push({ row: 0, field: "Global", issue: "Critical error: Missing schemeId mapping" });
            }

            // Check first 100 rows
            parsedData.slice(0, 100).forEach((row, i) => {
                const errorRow = { row: i + 1, field: "", issue: "" };
                let hasError = false;

                // Mock check
                if (!row[mappings.find(m => m.dbField === 'schemeId')?.fileColumn || ""]) {
                    errorRow.field = "schemeId";
                    errorRow.issue = "Empty ID";
                    hasError = true;
                }

                if (hasError) {
                    errors.push(errorRow);
                    rejected++;
                } else {
                    valid++;
                }
            });

            if (!hasSchemeId) {
                valid = 0;
                rejected = parsedData.length;
            } else {
                valid = parsedData.length - rejected;
            }

            setValidationResults({
                validCount: valid,
                rejectedCount: rejected,
                errors: errors.slice(0, 20) // Only show top 20 errors
            });

        } catch (e) {
            console.error(e);
        } finally {
            setIsValidating(false);
        }
    };

    const getConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case "high":
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded"><CheckCircle2 className="h-3 w-3" /> High Match</span>;
            case "medium":
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded"><AlertTriangle className="h-3 w-3" /> Possible Match</span>;
            case "low":
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded"><XCircle className="h-3 w-3" /> Low Confidence</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">Unmapped</span>;
        }
    };

    const criticalErrorsCount = validationResults?.errors.filter(e => e.issue.includes('Critical')).length || 0;
    const canProceed = validationResults && criticalErrorsCount === 0;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Column Mapping Table */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Column Mapping</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and correct matched database fields.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-3">
                            {mappings.map((m, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                    <div className="flex-1">
                                        <span className="text-sm font-bold block mb-1">{m.fileColumn}</span>
                                        {getConfidenceBadge(m.confidence)}
                                    </div>

                                    <div className="shrink-0 text-slate-400 hidden sm:block">→</div>

                                    <div className="flex-1">
                                        <select
                                            value={m.dbField || ""}
                                            onChange={(e) => updateMapping(m.fileColumn, e.target.value || null)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Ignore Column --</option>
                                            {KNOWN_DB_FIELDS.map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isValidating ? "Validating..." : "Run Validation"}
                        </button>
                    </div>
                </div>

                {/* Validation Results */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Validation Status</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check for data errors before committing.</p>
                    </div>

                    {!validationResults ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <AlertTriangle className="h-10 w-10 opacity-50" />
                            <p className="text-sm">Run validation to see results</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Valid Rows</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{validationResults.validCount}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50">
                                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Rejected Rows</p>
                                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">{validationResults.rejectedCount}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                                <h3 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-300">Issues log (Top 20)</h3>
                                {validationResults.errors.length === 0 ? (
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> No errors detected!
                                    </p>
                                ) : (
                                    <ul className="space-y-2 text-sm">
                                        {validationResults.errors.map((e, i) => (
                                            <li key={i} className="flex gap-2 text-rose-700 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/20 p-2 rounded">
                                                <span className="font-bold shrink-0">Row {e.row}:</span>
                                                <span>[{e.field}] {e.issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-4 py-2 rounded-md font-medium text-sm transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back
                        </button>
                        <button
                            disabled={!canProceed}
                            onClick={() => setStep(3)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Mapping <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
