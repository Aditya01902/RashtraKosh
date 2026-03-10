"use client"
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Treemap,
    ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea
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
import { cn, formatBudget } from '@/lib/utils';

interface DistItem {
    name: string;
    value: number;
    color: string;
    opacity?: number;
}

interface ScatterItem {
    name: string;
    ministry: string;
    allocated: number;
    utilizationScore: number;
    outcomeScore: number;
    size: number;
    quadrant: number;
}

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'distribution' | 'sectors' | 'utilization'>('distribution');

    // Data Fetching
    const { data: ministries, isLoading: loadingMinistries } = useQuery({
        queryKey: ['ministries'],
        queryFn: () => fetch('/api/ministries').then(res => res.json())
    });

    const { data: schemes, isLoading: loadingSchemes } = useQuery({
        queryKey: ['schemes'],
        queryFn: () => fetch('/api/schemes').then(res => res.json())
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
        if (!schemes) return [];
        return schemes.map((s: { name: string; ministryShortCode?: string; ministryName?: string; allocated: number; utilizationScore?: number; outcomeScore?: number; }) => {
            const util = s.utilizationScore || 0;
            const out = s.outcomeScore || 0;
            let quadrant = 3; // Low-Low (Red)
            if (util >= 85 && out >= 70) quadrant = 1; // High-High (Green)
            else if (util >= 85 && out < 70) quadrant = 2; // High-Low (Saffron)
            else if (util < 85 && out >= 70) quadrant = 4; // Low-High (Blue)

            return {
                name: s.name,
                ministry: s.ministryShortCode || s.ministryName || 'Unknown',
                allocated: s.allocated,
                utilizationScore: util,
                outcomeScore: out,
                size: s.allocated / 1000,
                quadrant: quadrant
            };
        });
    }, [schemes]);

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
                                        <h3 className="text-xl font-bold font-serif text-text-primary">Efficiency Matrix</h3>
                                        <p className="text-text-muted text-xs">Scheme-level performance by utilisation and outcome</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider mt-2">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" /> High/High</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--accent-saffron)]" /> High/Low</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" /> Low/High</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--accent-red)]" /> Low/Low</div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full pt-4">
                                    {loadingSchemes ? <Skeleton className="w-full h-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis
                                                    type="number"
                                                    dataKey="utilizationScore"
                                                    name="Utilisation"
                                                    unit="%"
                                                    domain={[0, 100]}
                                                    stroke="var(--text-muted)"
                                                    fontSize={10}
                                                    label={{ value: 'Utilisation Score (U) %', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 10 }}
                                                />
                                                <YAxis
                                                    type="number"
                                                    dataKey="outcomeScore"
                                                    name="Outcome"
                                                    unit="%"
                                                    domain={[0, 100]}
                                                    stroke="var(--text-muted)"
                                                    fontSize={10}
                                                    label={{ value: 'Outcome Score (OC) %', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10 }}
                                                />
                                                <ZAxis type="number" dataKey="size" range={[50, 400]} />
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload as ScatterItem;
                                                            return (
                                                                <div className="bg-bg-card border border-border-default rounded-xl p-3 text-sm space-y-2 shadow-2xl backdrop-blur-md">
                                                                    <p className="font-bold text-text-primary max-w-[200px] leading-tight">{data.name}</p>
                                                                    <p className="text-xs text-text-muted">{data.ministry}</p>
                                                                    <div className="h-px bg-white/10 my-2" />
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                                        <span className="text-text-muted">Allocated:</span>
                                                                        <span className="font-mono text-text-primary text-right">₹{formatBudget(data.allocated)}</span>
                                                                        <span className="text-text-muted">Utilisation:</span>
                                                                        <span className="font-mono text-text-primary text-right">{data.utilizationScore}%</span>
                                                                        <span className="text-text-muted">Outcome:</span>
                                                                        <span className="font-mono text-text-primary text-right">{data.outcomeScore}%</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <ReferenceLine x={85} stroke="var(--text-muted)" strokeDasharray="3 3" opacity={0.5} />
                                                <ReferenceLine y={70} stroke="var(--text-muted)" strokeDasharray="3 3" opacity={0.5} />
                                                <ReferenceArea x1={85} x2={100} y1={70} y2={100} fill="var(--accent-green)" fillOpacity={0.1} stroke="var(--accent-green)" strokeOpacity={0.3} strokeWidth={1} />
                                                <ReferenceArea x1={85} x2={100} y1={0} y2={70} fill="var(--accent-saffron)" fillOpacity={0.1} stroke="var(--accent-saffron)" strokeOpacity={0.3} strokeWidth={1} />
                                                <ReferenceArea x1={0} x2={85} y1={70} y2={100} fill="var(--accent-blue)" fillOpacity={0.1} stroke="var(--accent-blue)" strokeOpacity={0.3} strokeWidth={1} />
                                                <ReferenceArea x1={0} x2={85} y1={0} y2={70} fill="var(--accent-red)" fillOpacity={0.1} stroke="var(--accent-red)" strokeOpacity={0.3} strokeWidth={1} />
                                                <Scatter name="Schemes" data={scatterData}>
                                                    {scatterData.map((entry: ScatterItem, index: number) => {
                                                        let color = 'var(--accent-red)';
                                                        if (entry.quadrant === 1) color = 'var(--accent-green)';
                                                        else if (entry.quadrant === 2) color = 'var(--accent-saffron)';
                                                        else if (entry.quadrant === 4) color = 'var(--accent-blue)';
                                                        return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                                                    })}
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
                        ₹{formatBudget(value)}
                    </text>
                </>
            )}
        </g>
    );
};
