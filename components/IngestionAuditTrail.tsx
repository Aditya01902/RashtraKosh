'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    BarChart3,
    FileText,
    Terminal,
    Activity,
    ChevronRight,
    Database,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IngestionLog {
    scheme_name_raw: string;
    scheme_name_mapped: string;
    BE: number;
    RE: number;
    Actuals: number;
    ki_allocated: number;
    ki_utilized: number;
    variance_pct: number;
    anomaly_flag: boolean;
    confidence_score: number;
    timestamp: string;
}

export default function IngestionAuditTrail() {
    const [logs, setLogs] = useState<IngestionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLogIndex, setActiveLogIndex] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/ingest');
                const data = await response.json();
                setLogs(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch ingestion logs:', error);
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            const interval = setInterval(() => {
                setActiveLogIndex((prev) => (prev + 1) % logs.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [logs]);

    const activeLog = logs[activeLogIndex] || logs[logs.length - 1];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 glass-panel rounded-2xl border-dashed">
                <div className="text-accent-blue animate-pulse flex flex-col items-center gap-4">
                    <Activity className="w-8 h-8" />
                    <span className="font-bold tracking-widest uppercase text-xs">Synchronizing Pipeline...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group shadow-premium transition-all duration-700">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-saffron/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-accent-blue">
                        <Zap size={16} className="fill-current animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase mono">Automated Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-text-primary tracking-tight">Audit Trail</h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-accent-green/10 border border-accent-green/20 px-5 py-2.5 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-accent-green animate-ping" />
                        <span className="text-accent-green text-sm font-bold tracking-tight">Status: Verified</span>
                    </div>

                    <a
                        href="https://www.indiabudget.gov.in/budget2024-25/doc/OutcomeBudgetE2024_2025.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-text-primary px-5 py-2.5 rounded-2xl transition-all border border-white/20 dark:border-white/5 text-sm font-bold shadow-sm group/btn"
                    >
                        <FileText className="w-4 h-4 text-accent-saffron" />
                        <span>Source PDF</span>
                        <ChevronRight className="w-4 h-4 opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Log Stream Section */}
                <div className="lg:col-span-7 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 rounded-3xl p-6 h-[400px] flex flex-col shadow-inner">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-text-muted" />
                            <span className="text-xs font-bold text-text-primary uppercase tracking-widest">Pipeline Execution</span>
                        </div>
                        <div className="text-[10px] font-bold text-text-muted mono uppercase tracking-widest">
                            {logs.length} Vectors Processed
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar font-mono text-[11px]">
                        {logs.map((log, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-500 border border-transparent flex gap-4",
                                    i === activeLogIndex
                                        ? "bg-accent-blue/10 border-accent-blue/20 translate-x-1 shadow-sm"
                                        : "opacity-40"
                                )}
                            >
                                <span className="text-text-muted shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-text-primary font-bold">MATCH_VECTOR:</span>
                                        <span className="text-text-muted truncate italic">"{log.scheme_name_raw}"</span>
                                        <ChevronRight size={10} className="text-accent-saffron" />
                                        <span className="text-accent-blue font-bold">"{log.scheme_name_mapped}"</span>
                                    </div>
                                    {log.anomaly_flag && i === activeLogIndex && (
                                        <div className="flex items-center gap-2 text-rose-500 font-bold animate-pulse mt-1">
                                            <AlertTriangle size={12} />
                                            <span>ANOMALY_DETECTED</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

                {/* Intelligence Side Panels */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Mapping Confidence */}
                    <div className="glass-panel p-6 rounded-3xl border-transparent bg-white/30 dark:bg-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-accent-saffron/10 text-accent-saffron ring-1 ring-accent-saffron/20">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="text-xs font-bold text-text-primary uppercase tracking-[0.2em]">Confidence Engine</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-text-primary tracking-tight">{activeLog?.scheme_name_mapped}</span>
                                    <span className="text-xl font-serif font-bold text-accent-saffron">{(activeLog?.confidence_score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-black/10 dark:bg-black/60 rounded-full overflow-hidden p-[1px] ring-1 ring-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-saffron via-accent-gold to-accent-saffron transition-all duration-1000 ease-out rounded-full shadow-[0_0_20px_rgba(255,153,51,0.5)]"
                                        style={{ width: `${activeLog?.confidence_score * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1">
                                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Algorithm</div>
                                    <div className="text-xs font-bold text-text-primary tabular-nums">Levenshtein Dist.</div>
                                </div>
                                <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1">
                                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Vector Alignment</div>
                                    <div className="text-xs font-bold text-accent-green tabular-nums">High-Fidelity</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variance Analysis */}
                    <div className={cn(
                        "p-6 rounded-3xl transition-all duration-700 border-2",
                        activeLog?.anomaly_flag
                            ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.05)]"
                            : "glass-panel border-transparent bg-white/30 dark:bg-white/5 opacity-80"
                    )}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={cn(
                                "p-2 rounded-xl ring-1",
                                activeLog?.anomaly_flag
                                    ? "bg-rose-500/10 text-rose-500 ring-rose-500/20"
                                    : "bg-text-muted/10 text-text-muted ring-text-muted/20"
                            )}>
                                <BarChart3 size={18} />
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-[0.2em]",
                                activeLog?.anomaly_flag ? "text-rose-500" : "text-text-muted"
                            )}>
                                Variance Analysis
                            </span>
                        </div>

                        {activeLog?.anomaly_flag ? (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-text-primary tracking-tight uppercase">Deviation Alert</h4>
                                    <p className="text-sm text-text-muted leading-tight">
                                        Fidelity breach in <span className="text-text-primary font-bold">{activeLog?.scheme_name_mapped}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Detected Variance</span>
                                    <span className="text-2xl font-serif font-bold text-rose-500 tabular-nums">{activeLog?.variance_pct}%</span>
                                </div>

                                <div className="flex items-center gap-3 px-1">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Threshold 20.00% Exceeded</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[120px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                                <ShieldCheck className="w-8 h-8 text-text-muted" />
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Nominal Variance Range</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--accent-blue-rgb), 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--accent-blue-rgb), 0.4);
                }
            `}</style>
        </div>
    );
}
