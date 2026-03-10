"use client";

import { useUploadStore } from "@/store/upload";
import Step1Upload from "./_components/step1-upload";
import Step2Validate from "./_components/step2-validate";
import Step3Review from "./_components/step3-review";
import { Check } from "lucide-react";

export default function UploadPage() {
    const { step } = useUploadStore();

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Data Upload Wizard</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Upload performance metrics, budget updates, or KPI changes directly from a spreadsheet.
                </p>
            </div>

            {/* Progress Wizard */}
            <div className="flex items-center justify-center max-w-2xl mx-auto w-full mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${(step - 1) * 50}%` }}
                />

                <div className="flex justify-between w-full">
                    {[1, 2, 3].map((s) => {
                        const isActive = step === s;
                        const isPast = step > s;
                        return (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${isPast
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : isActive
                                            ? 'bg-blue-600 border-blue-100 dark:border-slate-800 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)]'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                                    }`}>
                                    {isPast ? <Check className="h-5 w-5" /> : s}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                                    {s === 1 ? 'Upload' : s === 2 ? 'Validate' : 'Review'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 w-full flex">
                {step === 1 && <Step1Upload />}
                {step === 2 && <Step2Validate />}
                {step === 3 && <Step3Review />}
            </div>
        </div>
    );
}
