"use client"
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Treemap,
    ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import {
    Card
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PieChart as PieIcon, BarChart3, ScatterChart as ScatterIcon,
    TrendingUp, AlertCircle
} from 'lucide-react';
import { MinistryWithStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DistItem {
    name: string;
    value: number;
    color: string;
    opacity?: number;
}

interface ScatterItem {
    name: string;
    allocated: number;
    utilized: number;
    score: number;
    size: number;
}

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'distribution' | 'sectors' | 'utilization'>('distribution');

    // Data Fetching
    const { data: ministries, isLoading: loadingMinistries } = useQuery({
        queryKey: ['ministries'],
        queryFn: () => fetch('/api/ministries').then(res => res.json())
    });

    const { data: distribution, isLoading: loadingDist } = useQuery({
        queryKey: ['scores', 'distribution'],
        queryFn: () => fetch('/api/scores/distribution').then(res => res.json())
    });

    // Data Formatting for Charts
    const distData = React.useMemo(() => {
        if (!distribution) return [];
        return [
            { name: 'Critical', value: distribution.CRITICAL, color: 'var(--accent-red)' },
            { name: 'Poor', value: distribution.POOR, color: 'var(--accent-red)', opacity: 0.6 },
            { name: 'Average', value: distribution.AVERAGE, color: 'var(--accent-gold)' },
            { name: 'Good', value: distribution.GOOD, color: 'var(--accent-green)', opacity: 0.6 },
            { name: 'Excellent', value: distribution.EXCELLENT, color: 'var(--accent-green)' },
        ];
    }, [distribution]);

    const sectorData = React.useMemo(() => {
        if (!ministries) return [];
        const sectors: Record<string, { name: string, value: number }> = {};
        ministries.forEach((m: MinistryWithStats) => {
            if (!sectors[m.sector]) sectors[m.sector] = { name: m.sector, value: 0 };
            sectors[m.sector].value += m.totalAllocated;
        });
        return Object.values(sectors).sort((a, b) => b.value - a.value);
    }, [ministries]);

    const scatterData = React.useMemo((): ScatterItem[] => {
        if (!ministries) return [];
        return ministries.map((m: MinistryWithStats) => ({
            name: m.name,
            allocated: m.totalAllocated / 100000,
            utilized: m.totalUtilized / 100000,
            score: m.avgFinalScore,
            size: m.totalAllocated / 1000
        }));
    }, [ministries]);

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 space-y-12">

            {/* Header */}
            <section className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-primary">
                    Deep <span className="text-accent-blue">Resource</span> Analytics
                </h1>
                <p className="text-lg text-text-muted max-w-2xl">
                    Multi-dimensional visualization of India&apos;s budget performance, sector-wise allocations, and outcome distributions.
                </p>
            </section>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border-default pb-4">
                <button
                    onClick={() => setActiveTab('distribution')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'distribution' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" : "text-text-muted hover:text-text-primary"
                    )}
                >
                    <BarChart3 size={16} /> Performance Distribution
                </button>
                <button
                    onClick={() => setActiveTab('sectors')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'sectors' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" : "text-text-muted hover:text-text-primary"
                    )}
                >
                    <PieIcon size={16} /> Sector Composition
                </button>
                <button
                    onClick={() => setActiveTab('utilization')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'utilization' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" : "text-text-muted hover:text-text-primary"
                    )}
                >
                    <ScatterIcon size={16} /> Utilization Matrix
                </button>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-3">
                    <Card className="p-8 h-[550px]">
                        {activeTab === 'distribution' && (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif text-text-primary">Score Distribution</h3>
                                        <p className="text-text-muted text-xs">National aggregate of scheme ratings</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    {loadingDist ? <Skeleton className="w-full h-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={distData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px' }}
                                                />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                                                    {distData.map((entry: DistItem, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={entry.opacity || 1} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sectors' && (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif text-text-primary">Sector Budget Composition</h3>
                                        <p className="text-text-muted text-xs">Relative allocation across key sectors</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full pt-4">
                                    {loadingMinistries ? <Skeleton className="w-full h-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <Treemap
                                                data={sectorData}
                                                dataKey="value"
                                                stroke="#04070e"
                                                fill="var(--accent-blue)"
                                                content={CustomTreemapContent}
                                            />
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'utilization' && (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif text-text-primary">Utilization vs Achievement</h3>
                                        <p className="text-text-muted text-xs">Efficiency mapping by individual ministries</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full pt-4">
                                    {loadingMinistries ? <Skeleton className="w-full h-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis
                                                    type="number"
                                                    dataKey="allocated"
                                                    name="Allocated"
                                                    unit="L Cr"
                                                    stroke="var(--text-muted)"
                                                    fontSize={10}
                                                    label={{ value: 'Total Allocated (₹)', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 10 }}
                                                />
                                                <YAxis
                                                    type="number"
                                                    dataKey="utilized"
                                                    name="Utilized"
                                                    unit="L Cr"
                                                    stroke="var(--text-muted)"
                                                    fontSize={10}
                                                    label={{ value: 'Total Utilized (₹)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10 }}
                                                />
                                                <ZAxis type="number" dataKey="size" range={[100, 1000]} />
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px' }}
                                                />
                                                <Legend verticalAlign="top" height={36} />
                                                <Scatter name="Ministries" data={scatterData} fill="var(--accent-saffron)">
                                                    {scatterData.map((entry: ScatterItem, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'var(--accent-green)' : 'var(--accent-saffron)'} />
                                                    ))}
                                                </Scatter>
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-6 bg-accent-blue/5 border-accent-blue/20 space-y-4">
                        <div className="flex items-center gap-2 text-accent-blue">
                            <TrendingUp size={18} />
                            <span className="text-xs font-bold uppercase mono tracking-widest">Growth Vector</span>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-text-muted2">Top Efficiency Gains</p>
                                <p className="text-lg font-serif font-bold text-text-primary">Solar Power Grid</p>
                                <Badge color="green" className="text-[10px] mono">+14% YoY Impact</Badge>
                            </div>
                            <div className="h-px bg-white/5 w-full" />
                            <div className="space-y-1">
                                <p className="text-xs text-text-muted2">Critical Focus Area</p>
                                <p className="text-lg font-serif font-bold text-text-primary">Urban Sanitation</p>
                                <Badge color="red" className="text-[10px] mono">Surplus Idle Funds</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-text-muted">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase mono">Anomalies Detected</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                                <div className="w-1 h-full bg-accent-red rounded-full" />
                                <p className="text-[10px] text-text-muted leading-relaxed">
                                    <span className="text-text-primary font-bold">Health Ministry</span> shows high allocation but low outcome improvement in rural sectors.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                                <div className="w-1 h-full bg-accent-gold rounded-full" />
                                <p className="text-[10px] text-text-muted leading-relaxed">
                                    <span className="text-text-primary font-bold">Tech Infrastructure</span> has reached 98% utilization 4 months early.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, index, name, value, root } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: `rgba(79, 158, 255, ${0.1 + (index / root.children.length) * 0.9})`,
                    stroke: 'var(--bg-primary)',
                    strokeWidth: 2,
                }}
            />
            {width > 50 && height > 30 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 4}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize={10}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 10}
                        textAnchor="middle"
                        fill="var(--text-muted2)"
                        fontSize={8}
                        fontFamily="JetBrains Mono"
                    >
                        ₹{(value / 100000).toFixed(2)}L Cr
                    </text>
                </>
            )}
        </g>
    );
};
