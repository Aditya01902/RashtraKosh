'use client';

import React from 'react';
import IngestionAuditTrail from '@/components/IngestionAuditTrail';
import { Database, ShieldCheck, Activity } from 'lucide-react';

export default function IngestionPage() {
    return (
        <div className="flex flex-col gap-8 w-full pb-12">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Data Hub</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Monitor the real-time ingestion, mapping, and validation of official government budget data. 
                    Our AI-driven pipeline ensures data fidelity and flags anomalies automatically.
                </p>
                
                <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <ShieldCheck size={12} className="text-green-500" />
                        Verified Sources Only
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <Activity size={12} className="text-orange-500" />
                        Live Ingestion Stream
                    </div>
                </div>
            </div>

            {/* Ingestion Audit Trail Component */}
            <div className="relative">
                <IngestionAuditTrail />
            </div>

            {/* Pipeline Description Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">01. Acquisition</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Crawlers monitor official portals like indiabudget.gov.in for new PDF releases,
                        extracting structural tables using layout-aware neural networks.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">02. Fuzzy Mapping</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Raw strings from PDFs are mapped to internal knowledge items using weighted
                        Levenshtein algorithms, ensuring 100% vector alignment with historical data.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">03. Anomaly Guard</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Every record is cross-referenced with internal estimates. Any deviation
                        exceeding 20% triggers an automated lock, requiring manual analyst certification.
                    </p>
                </div>
            </div>
        </div>
    );
}
