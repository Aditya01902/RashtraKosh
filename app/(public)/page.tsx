"use client"
import React, { useMemo } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';
import { useMinistries } from '@/hooks/use-ministries';
import { Stat } from '@/components/ui/stat';
import { cn, formatLakhCrore, formatBudget } from '@/lib/utils';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreRing } from '@/components/ui/score-ring';
import { ScoreBar } from '@/components/ui/score-bar';
import { StateEmblem } from '@/components/ui/state-emblem';
import { motion } from 'framer-motion';
import {
    Building2,
    Target,
    Users,
    TrendingUp,
    ArrowRight,
    Activity,
    Sparkles,
    ChevronRight
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
};

export default function OverviewPage() {
    const { theme } = useTheme();
    const { data: ministries = [], isLoading: loadingMinistries } = useMinistries();

    const { kpis } = useMemo(() => {
        const totalAlloc = ministries.reduce((acc: number, m: { totalAllocated?: number }) => acc + (m.totalAllocated || 0), 0);
        const totalUtil = ministries.reduce((acc: number, m: { totalUtilized?: number }) => acc + (m.totalUtilized || 0), 0);
        const avgScoreValue = ministries.length > 0
            ? ministries.reduce((acc: number, m: { avgFinalScore?: number }) => acc + (m.avgFinalScore || 0), 0) / ministries.length
            : 0;

        const schemesTracked = ministries.reduce((acc: number, m: { departmentCount?: number }) => acc + (m.departmentCount || 0), 0) * 8;
        const utilizationRate = totalAlloc > 0 ? (totalUtil / totalAlloc) * 100 : 0;

        return {
            kpis: [
                { label: "Total Allocation", value: `₹${formatLakhCrore(totalAlloc / 1000)}`, sub: "National Outlay", icon: <TrendingUp size={20} />, delta: "+4.2%", deltaDirection: 'up' as const },
                { label: "Total Utilized", value: `₹${formatLakhCrore(totalUtil / 1000)}`, sub: `${utilizationRate.toFixed(1)}% Efficiency`, icon: <Activity size={20} />, delta: "92%", deltaDirection: 'up' as const },
                { label: 'Active Ministries', value: ministries.length, sub: 'Live Tracking', icon: <Building2 size={20} /> },
                { label: 'Schemes Tracked', value: schemesTracked.toString(), sub: 'Deep Intelligence', icon: <Target size={20} /> },
                { label: 'Avg Final Score', value: avgScoreValue.toFixed(1), sub: 'Impact Score', icon: <Users size={20} />, delta: "Premium", deltaDirection: 'up' as const },
            ],
        };
    }, [ministries]);

    const sortedMinistries = useMemo(() => {
        const priorityOrder = ['Ministry of Finance', 'Ministry of Agriculture', 'Ministry of Education', 'Ministry of Health & Family Welfare'];
        return [...ministries].sort((a: { name: string }, b: { name: string }) => {
            const aIdx = priorityOrder.indexOf(a.name);
            const bIdx = priorityOrder.indexOf(b.name);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return 0;
        });
    }, [ministries]);

    return (
        <main className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative text-primary">
            {/* Ambient Background Elements */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--accent-saffron)_0%,_transparent_70%)] blur-[120px]" />

            {/* Hero Section - Optimized for First Fold & Navbar Clearance */}
            <section className="relative overflow-hidden rounded-[3rem] px-8 flex items-center min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full h-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 flex flex-col items-start text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent-saffron/10 border border-accent-saffron/20 text-accent-saffron text-sm font-bold tracking-widest uppercase mono animate-pulse">
                            <Sparkles size={16} />
                            Next-Gen Public Finance Intelligence
                        </div>

                        <h1 className="text-7xl md:text-9xl font-serif font-bold leading-[1.1] tracking-tighter">
                            <span className={cn(
                                "text-3xl md:text-5xl block mb-6 drop-shadow-lg opacity-90",
                                theme === 'light' ? "text-[#020617] font-bold" : "text-[#64748B] font-bold"
                            )}>||&nbsp;&nbsp;कोशमूलाः&nbsp;&nbsp;&nbsp;सर्वारम्भाः&nbsp;&nbsp;||</span>
                            <span className="text-accent-saffron block lg:inline">
                                Rashtra
                            </span>
                            <span className={cn(
                                "block lg:inline",
                                theme === 'light' ? "text-[#020617] font-normal" : "text-white font-normal"
                            )}>Kosh</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl">
                            Experience India&apos;s financial landscape through AI-powered lens.
                            Tracking <span className="text-text-primary font-medium">real-time utilization</span>,
                            efficiency, and impact across the national budget.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-6">
                            <Link href="/explorer">
                                <Button className="glass-button bg-accent-saffron text-white hover:bg-accent-saffron/90 px-10 h-14 text-lg font-bold group">
                                    Explore Budget <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/intelligence">
                                <Button variant="outline" className="glass-button px-10 h-14 text-lg font-bold border-white/20 hover:bg-white/5 transition-all">
                                    Ask Chanakya
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="hidden lg:flex items-center justify-end h-full"
                    >
                        <div className="w-[500px] h-[650px] relative">
                            <StateEmblem className="w-full h-full" />
                        </div>
                    </motion.div>
                </div>

                {/* Small Screen Background Emblem */}
                <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-10">
                    <div className="w-[300px] h-[450px]">
                        <StateEmblem className="w-full h-full" />
                    </div>
                </div>
            </section>

            {/* KPI Grid */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-20"
            >
                {loadingMinistries ? (
                    Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl bg-white/5" />)
                ) : (
                    kpis?.map((kpi, i) => (
                        <Stat key={i} {...kpi} className="glass-card border-gold-accent h-full gold-shimmer" iconClassName="icon-gold" />
                    ))
                )}
            </motion.section>

            <div className="vintage-divider" />

            {/* Ministry Grid */}
            <section className="space-y-10 mt-32">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-end justify-between border-b border-white/5 pb-6"
                >
                    <div className="space-y-2">
                        <h3 className="text-4xl font-serif font-bold text-text-primary">Ministry Scorecards</h3>
                        <p className="text-text-muted2">Performance evaluation across core sectors and schemes.</p>
                    </div>
                    <Link href="/explorer" className="text-accent-saffron flex items-center gap-2 text-sm font-bold hover:underline group">
                        Live Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"
                >
                    {loadingMinistries ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-3xl bg-white/5" />)
                    ) : sortedMinistries?.length > 0 ? (
                        sortedMinistries.slice(0, 9).map((min: { id: string; name: string; sector: string; avgFinalScore?: number; utilizationPct?: number; totalAllocated: number }) => (
                            <motion.div key={min.id} variants={itemVariants} className="h-full">
                                <Link href={`/explorer?ministry=${min.id}`} className="block h-full">
                                    <Card variant="default" className="p-8 h-full space-y-8 cursor-pointer group glass-card hover:bg-white/[0.02] border-white/5 flex flex-col">
                                        <div className="flex-1 space-y-8">
                                            <div className="min-h-[110px]">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="font-bold text-xl text-text-primary group-hover:text-accent-saffron transition-colors leading-tight">
                                                            {min.name}
                                                        </h4>
                                                        <Badge color="blue" className="text-[10px] mono tracking-widest px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue border-none">
                                                            {min.sector}
                                                        </Badge>
                                                    </div>
                                                    <ScoreRing score={min.avgFinalScore || 0} size={56} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <ScoreBar
                                                    label="Utilization Ratio"
                                                    value={min.utilizationPct || 0}
                                                    color="var(--accent-saffron)"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 flex justify-between items-center text-xs text-text-muted2">
                                            <div className="mono font-bold text-xs opacity-80 flex flex-col items-start gap-1">
                                                <span>ALLOCATED:</span>
                                                <span className="text-accent-saffron text-base font-bold">₹{formatBudget(min.totalAllocated)}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent-saffron group-hover:text-white transition-all duration-300">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl border-dashed border-white/10">
                            <div className="flex justify-center text-accent-saffron">
                                <Activity size={48} className="opacity-50" />
                            </div>
                            <h4 className="text-xl font-bold">Data temporarily unavailable</h4>
                            <p className="text-text-muted2 max-w-md mx-auto">
                                We&apos;re having trouble reaching the treasury data sync. This usually resolves in a few seconds as the system wakes up.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 border-white/10 hover:bg-white/5"
                                onClick={() => window.location.reload()}
                            >
                                Reconnect to Dashboard
                            </Button>
                        </div>
                    )}
                </motion.div>
            </section>
        </main>
    )
}
