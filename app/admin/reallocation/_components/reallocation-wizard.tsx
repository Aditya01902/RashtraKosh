"use client";

import { useState } from "react";
import { useReallocationStore } from "@/store/reallocation";
import { ChevronRight, ChevronLeft, Send, CheckCircle2, Calculator, AlertCircle, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReallocationWizard() {
    const { step, setStep, idleSchemes, recipientCandidates, selectedDonorIds, selectedRecipientIds, toggleDonor, toggleRecipient, generatedFlows, setGeneratedFlows, reset } = useReallocationStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const totalCapitalSelected = idleSchemes
        .filter(s => selectedDonorIds.includes(s.id))
        .reduce((sum, s) => sum + s.capitalIdle, 0);

    const totalRevenueSelected = idleSchemes
        .filter(s => selectedDonorIds.includes(s.id))
        .reduce((sum, s) => sum + s.revenueIdle, 0);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/reallocation/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ donorIds: selectedDonorIds, recipientIds: selectedRecipientIds }),
            });
            const data = await response.json();
            if (data.flows) {
                setGeneratedFlows(data.flows);
                setStep(3);
            }
        } catch (e) {
            console.error("Failed to generate plan");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Mock submit endpoint
            await new Promise(r => setTimeout(r, 1500));
            setSuccess(true);
        } catch (e) {
            console.error("Submit failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Plan Submitted</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                    The reallocation plan has been sent to the Ministry of Finance for final approval.
                </p>
                <div className="flex gap-4">
                    <button onClick={reset} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md font-medium transition-colors">
                        Create Another Plan
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
                        <Download className="h-4 w-4" /> Export as PDF Memo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[500px] overflow-hidden">
            {/* Wizard Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Reallocation Wizard</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {step === 1 ? "Step 1: Select Donor Schemes" : step === 2 ? "Step 2: Select Recipient Schemes" : "Step 3: Review & Submit"}
                    </p>
                </div>
                <div className="flex gap-2 font-bold text-sm">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>1</span>
                    <span className="w-4 border-b-2 border-slate-300 dark:border-slate-700 my-auto" />
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>2</span>
                    <span className="w-4 border-b-2 border-slate-300 dark:border-slate-700 my-auto" />
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>3</span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                {step === 1 && (
                    <div className="flex flex-col h-full gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Select underperforming schemes to reclaim idle funds. Default selection includes all idle schemes.
                        </p>

                        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            {idleSchemes.map(s => (
                                <label key={s.id} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedDonorIds.includes(s.id)}
                                        onChange={(e) => toggleDonor(s.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{s.name}</p>
                                        <p className="text-xs text-slate-500">{s.rootCause}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                            ₹{s.totalIdle.toLocaleString()} Cr
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono">
                                            C: ₹{s.capitalIdle} | R: ₹{s.revenueIdle}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Running Total</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    ₹{totalCapitalSelected.toLocaleString()} Cr Capital <span className="text-slate-400 font-normal mx-1">+</span> ₹{totalRevenueSelected.toLocaleString()} Cr Revenue selected
                                </p>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={selectedDonorIds.length === 0}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                Next: Select Recipients <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col h-full gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Select highly efficient schemes that have absorption capacity for additional funds. Sorted by capacity descending.
                        </p>

                        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            {recipientCandidates.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No efficient candidates found with absorption capacity.</div>
                            ) : recipientCandidates.map(c => (
                                <label key={c.id} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRecipientIds.includes(c.id)}
                                        onChange={(e) => toggleRecipient(c.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex gap-2 items-center">
                                            <p className="font-semibold text-sm">{c.name}</p>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40">F-Score: {c.currentScore}</span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                            <span>Need C: ₹{c.capitalNeed}</span>
                                            <span>Need R: ₹{c.revenueNeed}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-slate-500">Capacity</p>
                                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                            ₹{c.absorptionCapacity.toLocaleString()} Cr
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-4 py-2 font-medium text-sm transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back
                            </button>
                            <button
                                onClick={handleGeneratePlan}
                                disabled={isGenerating || selectedRecipientIds.length === 0}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Calculator className="h-4 w-4 animate-spin" /> : null}
                                {isGenerating ? "Generating..." : "Generate Plan"} <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col h-full gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Capital Reallocation</p>
                                <p className="text-2xl font-bold mt-1">
                                    ₹{generatedFlows.filter(f => f.type === "CAPITAL" || f.type === "MIXED").reduce((sum, f) => sum + f.amount, 0).toLocaleString()} Cr
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Revenue Reallocation</p>
                                <p className="text-2xl font-bold mt-1">
                                    ₹{generatedFlows.filter(f => f.type === "REVENUE" || f.type === "MIXED").reduce((sum, f) => sum + f.amount, 0).toLocaleString()} Cr
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="p-3">From</th>
                                        <th className="p-3">To</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3">Rationale</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {generatedFlows.map(flow => (
                                        <tr key={flow.id}>
                                            <td className="p-3">
                                                <span className="font-semibold text-rose-600 dark:text-rose-400 block truncate max-w-[150px]" title={flow.fromSchemeName}>{flow.fromSchemeName}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block truncate max-w-[150px]" title={flow.toSchemeName}>{flow.toSchemeName}</span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 block">₹{flow.amount}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded inline-block bg-slate-100 dark:bg-slate-700">{flow.type}</span>
                                            </td>
                                            <td className="p-3">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2" title={flow.rationale}>{flow.rationale}</p>
                                                {flow.risk === "HIGH" && <span className="inline-flex mt-1 items-center gap-1 text-[10px] text-rose-600"><AlertCircle className="h-3 w-3" /> Execution Risk</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
                            <span className="font-bold">Projected Impact:</span> E.g. Jal Jeevan Mission score estimated at 91 after capital infusion. Reallocation improves portfolio efficiency by +4.2%.
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-4 py-2 font-medium text-sm transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back
                            </button>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-5 py-2 rounded-md text-sm font-medium transition-colors">
                                    <FileText className="h-4 w-4" /> PDF Memo
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? <Send className="h-4 w-4 animate-spin -translate-x-0.5" /> : null}
                                    {isSubmitting ? "Submitting..." : "Submit for Approval"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
