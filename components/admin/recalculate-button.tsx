"use client";

import { useTransition, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecalculateButton() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
    const router = useRouter();

    const handleRecalculate = () => {
        setStatus({ type: "idle" });
        startTransition(async () => {
            try {
                const response = await fetch("/api/scores/calculate/all", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fiscalYear: "2024-25" }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus({
                        type: "success",
                        message: `Success: ${data.calculated} calculated, ${data.failed} failed.`,
                    });
                    router.refresh();
                } else {
                    setStatus({
                        type: "error",
                        message: data.error || "Failed to recalculate",
                    });
                }
            } catch (error) {
                setStatus({
                    type: "error",
                    message: "An unexpected error occurred",
                });
            }
        });
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                onClick={handleRecalculate}
                disabled={isPending}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                {isPending ? "Calculating..." : "Recalculate All Scores"}
            </button>

            {status.message && (
                <span className={`text-sm font-medium ${status.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {status.message}
                </span>
            )}
        </div>
    );
}
