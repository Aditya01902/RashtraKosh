'use client';

import React from 'react';
import IngestionAuditTrail from '@/components/IngestionAuditTrail';
import { Database, ShieldCheck, Activity } from 'lucide-react';

export default function IngestionPage() {
    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
            {/* Hero Section */}
            <div className="mb-12 space-y-4 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/20 animate-pulse">
                        <Database size={48} />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary tracking-tight">
                    Data Pipeline Transparency
                </h1>
                <p className="text-text-muted max-w-2xl mx-auto text-lg">
                    Monitor the real-time ingestion, mapping, and validation of official government
                    budget data. Our AI-driven pipeline ensures data fidelity and flags anomalies
                    automatically for human review.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-text-muted">
                        <ShieldCheck size={14} className="text-accent-green" />
                        Verified Sources Only
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-text-muted">
                        <Activity size={14} className="text-accent-saffron" />
                        Live Ingestion Stream
                    </div>
                </div>
            </div>

            {/* Ingestion Audit Trail Component */}
            <div className="relative">
                <div className="absolute inset-x-0 -top-40 -z-10 flex justify-center overflow-hidden blur-3xl" aria-hidden="true">
                    <div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-accent-blue/20 to-accent-saffron/20 opacity-20" />
                </div>
                <IngestionAuditTrail />
            </div>

            {/* Pipeline Description Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel p-8 space-y-4">
                    <h3 className="text-xl font-bold text-text-primary">01. Acquisition</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Crawlers monitor official portals like indiabudget.gov.in for new PDF releases,
                        extracting structural tables using layout-aware neural networks.
                    </p>
                </div>
                <div className="glass-panel p-8 space-y-4">
                    <h3 className="text-xl font-bold text-text-primary">02. Fuzzy Mapping</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Raw strings from PDFs are mapped to internal knowledge items using weighted
                        Levenshtein algorithms, ensuring 100% vector alignment with historical data.
                    </p>
                </div>
                <div className="glass-panel p-8 space-y-4">
                    <h3 className="text-xl font-bold text-text-primary">03. Anomaly Guard</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Every record is cross-referenced with internal estimates. Any deviation
                        exceeding 20% triggers an automated lock, requiring manual analyst certification.
                    </p>
                </div>
            </div>
        </main>
    );
}
