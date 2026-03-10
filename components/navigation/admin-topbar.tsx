"use client";

import { useTransition } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminTopbarProps {
    user: {
        role: string;
    };
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRecalculate = () => {
        startTransition(async () => {
            try {
                const response = await fetch("/api/scores/calculate/all", {
                    method: "POST",
                });
                if (response.ok) {
                    router.refresh();
                } else {
                    console.error("Failed to recalculate scores");
                }
            } catch (error) {
                console.error("Error recalculating scores:", error);
            }
        });
    };

    return (
        <header className="h-16 shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10 w-full relative">
            <div className="flex items-center md:hidden">
                {/* Mobile menu toggle would go here if needed, for now just brand logo for mobile context */}
                <span className="font-bold text-lg tracking-tight text-blue-900 dark:text-blue-100 italic">Rashtra</span>
                <span className="font-semibold text-lg tracking-tight text-orange-500 dark:text-orange-400">Kosh</span>
            </div>

            <div className="hidden md:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Admin Console
            </div>

            <div className="flex flex-1 md:flex-none items-center justify-end gap-4">
                <div className="flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md px-3 py-1.5 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400">FY</span>
                    <select className="bg-transparent border-none outline-none font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                        <option value="2024-25">2024-25</option>
                        <option value="2023-24">2023-24</option>
                    </select>
                </div>

                {user.role === "SUPER_ADMIN" && (
                    <button
                        onClick={handleRecalculate}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                        {isPending ? "Calculating..." : "Recalculate All Scores"}
                    </button>
                )}
            </div>
        </header>
    );
}
