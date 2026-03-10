"use client"
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/explorer-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { ScoreBar } from '@/components/ui/score-bar';
import { Stat } from '@/components/ui/stat';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChevronRight, ArrowLeft, Building2, Layers,
    Target, Info, BrainCircuit, Wallet, BarChart3
} from 'lucide-react';
import { cn, formatLakhCrore } from '@/lib/utils';

export default function ExplorerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        level, selectedMinistryId, selectedDepartmentId, selectedSchemeId,
        setLevel, selectMinistry, selectDepartment, selectScheme, hideMethodology
    } = useExplorerStore();

    // URL Sync: On mount, read params and hydrate store
    useEffect(() => {
        const ministryId = searchParams.get('ministry');
        const departmentId = searchParams.get('department');
        const schemeId = searchParams.get('scheme');

        if (schemeId) {
            selectMinistry(ministryId);
            selectDepartment(departmentId);
            selectScheme(schemeId);
        } else if (departmentId) {
            selectMinistry(ministryId);
            selectDepartment(departmentId);
        } else if (ministryId) {
            selectMinistry(ministryId);
        }
    }, [searchParams, selectMinistry, selectDepartment, selectScheme]);

    // Sync Store -> URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedMinistryId) params.set('ministry', selectedMinistryId);
        if (selectedDepartmentId) params.set('department', selectedDepartmentId);
        if (selectedSchemeId) params.set('scheme', selectedSchemeId);

        const query = params.toString();
        router.replace(`/explorer${query ? `?${query}` : ''}`, { scroll: false });
    }, [selectedMinistryId, selectedDepartmentId, selectedSchemeId, router]);

    // Data Fetching
    const { data: ministries, isLoading: loadingMinistries } = useQuery({
        queryKey: ['ministries'],
        queryFn: () => fetch('/api/ministries').then(res => res.json())
    });

    const { data: ministryDetail, isLoading: loadingMinistryDetail } = useQuery({
        queryKey: ['ministry', selectedMinistryId],
        queryFn: () => fetch(`/api/ministries/${selectedMinistryId}`).then(res => res.json()),
        enabled: !!selectedMinistryId
    });

    const { data: schemeDetail } = useQuery({
        queryKey: ['scheme', selectedSchemeId],
        queryFn: () => fetch(`/api/schemes/${selectedSchemeId}`).then(res => res.json()),
        enabled: !!selectedSchemeId
    });

    // Derived Left Panel List
    const listItems = React.useMemo(() => {
        if (level === 'ministry') return ministries || [];
        if (level === 'department') return ministryDetail?.departments || [];
        if (level === 'scheme') {
            const dept = ministryDetail?.departments.find((d: { id: string }) => d.id === selectedDepartmentId);
            return dept?.schemes || [];
        }
        return [];
    }, [level, ministries, ministryDetail, selectedDepartmentId]);

    const currentLevelLabel = {
        ministry: 'Ministries',
        department: 'Departments',
        scheme: 'Schemes',
        methodology: 'Methodology'
    }[level];

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-3 text-sm mb-10 overflow-x-auto whitespace-nowrap pb-4 no-scrollbar">
                <button
                    onClick={() => { selectMinistry(null); setLevel('ministry'); }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                >
                    <Building2 size={14} className="group-hover:text-accent-blue transition-colors" />
                    <span className="font-medium">Budget</span>
                </button>

                {selectedMinistryId && (
                    <>
                        <ChevronRight size={14} className="text-text-muted2 shrink-0" />
                        <button
                            onClick={() => selectMinistry(selectedMinistryId)}
                            className={cn(
                                "px-4 py-1.5 rounded-full border transition-all duration-300 font-medium",
                                level === 'department' && !selectedDepartmentId
                                    ? "bg-accent-saffron/10 border-accent-saffron/20 text-accent-saffron shadow-[0_0_15px_rgba(var(--accent-saffron-rgb),0.05)]"
                                    : "bg-white/5 border-white/5 text-text-muted hover:text-text-primary hover:bg-white/10"
                            )}
                        >
                            {ministryDetail?.name || 'Loading...'}
                        </button>
                    </>
                )}

                {selectedDepartmentId && (
                    <>
                        <ChevronRight size={14} className="text-text-muted2 shrink-0" />
                        <button
                            onClick={() => selectDepartment(selectedDepartmentId)}
                            className={cn(
                                "px-4 py-1.5 rounded-full border transition-all duration-300 font-medium",
                                level === 'scheme' && !selectedSchemeId
                                    ? "bg-accent-saffron/10 border-accent-saffron/20 text-accent-saffron shadow-[0_0_15px_rgba(var(--accent-saffron-rgb),0.05)]"
                                    : "bg-white/5 border-white/5 text-text-muted hover:text-text-primary hover:bg-white/10"
                            )}
                        >
                            {ministryDetail?.departments.find((d: { id: string; name: string }) => d.id === selectedDepartmentId)?.name || 'Loading...'}
                        </button>
                    </>
                )}

                {selectedSchemeId && (
                    <>
                        <ChevronRight size={14} className="text-text-muted2 shrink-0" />
                        <div className="px-4 py-1.5 rounded-full bg-accent-saffron/10 border border-accent-saffron/20 text-accent-saffron font-bold shadow-[0_0_15px_rgba(var(--accent-saffron-rgb),0.05)]">
                            {schemeDetail?.name || 'Loading...'}
                        </div>
                    </>
                )}

                {level === 'methodology' && (
                    <>
                        <ChevronRight size={14} className="text-text-muted2 shrink-0" />
                        <div className="px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-bold shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.05)]">
                            Scoring Methodology
                        </div>
                    </>
                )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: List */}
                <div className="lg:col-span-4 space-y-4 min-w-0">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-serif font-bold text-text-primary">{currentLevelLabel}</h2>
                        {level !== 'ministry' && (
                            <button
                                onClick={() => {
                                    if (level === 'methodology') hideMethodology();
                                    else if (level === 'scheme' && selectedSchemeId) selectScheme(null);
                                    else if (level === 'scheme') setLevel('department');
                                    else if (level === 'department') setLevel('ministry');
                                }}
                                className="px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/20 text-[10px] uppercase tracking-widest font-bold text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue/40 transition-all duration-300 flex items-center gap-1.5 group backdrop-blur-sm"
                            >
                                <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                            </button>
                        )}
                    </div>

                    {level === 'methodology' ? (
                        <div className="p-6 rounded-2xl border border-accent-blue/20 bg-accent-blue/5 space-y-4">
                            <h4 className="text-sm font-bold text-accent-blue">Documentation Mode</h4>
                            <p className="text-xs text-text-muted leading-relaxed">
                                You are viewing the mathematical framework. Use the &quot;Back&quot; button to return to your previous investigation level.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-accent-blue/20 text-accent-blue hover:bg-accent-blue/10"
                                onClick={() => hideMethodology()}
                            >
                                Resume Explorer
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto px-4 py-2 custom-scrollbar">
                            {loadingMinistries || (level !== 'ministry' && loadingMinistryDetail) ? (
                                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)
                            ) : listItems.length > 0 ? (
                                listItems.map((item: { id: string; name: string; totalAllocated?: number; departmentCount?: number; finalScore?: number; avgFinalScore?: number; priorityCategory?: string }) => {
                                    const isSelected =
                                        (level === 'ministry' && selectedMinistryId === item.id) ||
                                        (level === 'department' && selectedDepartmentId === item.id) ||
                                        (level === 'scheme' && selectedSchemeId === item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (level === 'ministry') selectMinistry(item.id);
                                                else if (level === 'department') selectDepartment(item.id);
                                                else if (level === 'scheme') selectScheme(item.id);
                                            }}
                                            onMouseMove={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                                            }}
                                            className={cn(
                                                "w-full text-left p-4 rounded-2xl border transition-all duration-500 group spotlight-card glass-card relative overflow-hidden",
                                                isSelected
                                                    ? "bg-accent-saffron/10 dark:bg-accent-saffron/10 border-accent-saffron/30 dark:border-accent-saffron/40 scale-[1.03] shadow-lg dark:shadow-[0_0_30px_rgba(255,153,51,0.15)] ring-1 ring-accent-saffron/20"
                                                    : "hover:scale-[1.01] hover:bg-white/60 dark:hover:bg-white/5 border-transparent hover:border-white/20 dark:hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex justify-between items-start gap-4 relative z-10">
                                                <div className="space-y-1">
                                                    <p className={cn(
                                                        "text-sm font-bold leading-tight transition-colors duration-300",
                                                        isSelected ? "text-accent-saffron" : "text-text-muted group-hover:text-text-primary"
                                                    )}>
                                                        {item.name}
                                                    </p>
                                                    {level === 'ministry' && (
                                                        <div className="flex flex-col items-start gap-1 text-[11px] text-text-muted2 mono">
                                                            <span className="text-accent-blue font-bold text-xs">₹{((item.totalAllocated || 0) / 100000).toFixed(2)}L Cr</span>
                                                            <span>{item.departmentCount || 0} Depts</span>
                                                        </div>
                                                    )}
                                                    {level === 'scheme' && (
                                                        <Badge color={(item.finalScore || 0) > 80 ? 'green' : 'saffron'} className="text-[10px] mono py-0">
                                                            {item.priorityCategory || 'GENERAL'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <ScoreRing score={item.avgFinalScore || item.finalScore || 0} size={42} />
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-text-muted text-sm border border-dashed border-border-default rounded-xl">
                                    No items found at this level.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-6 min-w-0">
                    {(() => {
                        if (level === 'methodology') {
                            return <MethodologyDetail />;
                        }
                        if (level === 'scheme' && selectedSchemeId && schemeDetail) {
                            return <SchemeDetail data={schemeDetail} />;
                        }
                        if (level === 'scheme' && selectedDepartmentId) {
                            return (
                                <DepartmentDetail
                                    data={ministryDetail?.departments.find((d: { id: string }) => d.id === selectedDepartmentId)}
                                    parentMinistry={ministryDetail}
                                />
                            );
                        }
                        if (level === 'department' && selectedDepartmentId) {
                            return (
                                <DepartmentDetail
                                    data={ministryDetail?.departments.find((d: { id: string }) => d.id === selectedDepartmentId)}
                                    parentMinistry={ministryDetail}
                                />
                            );
                        }
                        if (level === 'department' && selectedMinistryId && ministryDetail) {
                            return <MinistryDetail data={ministryDetail} />;
                        }
                        if (level === 'ministry' && selectedMinistryId && ministryDetail) {
                            return <MinistryDetail data={ministryDetail} />;
                        }
                        return <LandingDetail />;
                    })()}
                </div>
            </div>
        </main>
    );
}

function LandingDetail() {
    const { showMethodology } = useExplorerStore();
    return (
        <div className="glass-panel p-12 text-center min-h-[70vh] flex flex-col items-center justify-center space-y-8 relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/5 shadow-premium">
            {/* Animated background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-saffron/10 dark:bg-accent-saffron/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-100" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 dark:bg-accent-blue/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50 dark:opacity-100" />

            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-saffron/20 to-accent-saffron/5 flex items-center justify-center text-accent-saffron shadow-[0_0_30px_rgba(255,153,51,0.2)] animate-float">
                    <Building2 size={48} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue backdrop-blur-md border border-accent-blue/20">
                    <BarChart3 size={20} />
                </div>
            </div>

            <div className="max-w-md space-y-4 relative z-10">
                <h2 className="text-4xl font-serif font-bold text-text-primary tracking-tight">Budget Drill-down</h2>
                <p className="text-text-muted leading-relaxed font-medium">
                    Select a ministry from the left to begin exploring its departmental structure, individual schemes, and performance metrics in high resolution.
                </p>
                <button
                    onClick={() => showMethodology()}
                    className="text-accent-blue text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto pt-4"
                >
                    <Info size={14} /> How are scores calculated?
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-8 relative z-10">
                <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-left space-y-3 group hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold mono text-sm shadow-sm ring-1 ring-accent-blue/20">01</div>
                    <p className="text-[15px] font-bold text-text-primary">Choose Ministry</p>
                    <p className="text-xs text-text-muted2 leading-relaxed font-medium">Select from the comprehensive list of government sectors.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-left space-y-3 group hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-xl bg-accent-saffron/10 flex items-center justify-center text-accent-saffron font-bold mono text-sm shadow-sm ring-1 ring-accent-saffron/20">02</div>
                    <p className="text-[15px] font-bold text-text-primary">Analyze Performance</p>
                    <p className="text-xs text-text-muted2 leading-relaxed font-medium">Review scorecards and utilization trends with AI insights.</p>
                </div>
            </div>
        </div>
    );
}

function MinistryDetail({ data }: {
    data: {
        sector: string;
        name: string;
        description: string;
        totalAllocated: number;
        totalUtilized: number;
        utilizationPct: number;
        departmentCount: number;
        departments: { id: string; name: string; schemes: { allocated: number }[] }[]
    }
}) {
    const { selectDepartment } = useExplorerStore();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Badge color="blue">{data.sector}</Badge>
                <h2 className="text-4xl font-serif font-bold text-text-primary leading-tight">{data.name}</h2>
                <p className="text-text-muted leading-relaxed max-w-2xl">{data.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stat
                    icon={<Wallet size={20} />}
                    label="Ministry Allocation"
                    value={`₹${formatLakhCrore(data.totalAllocated / 1000)}`}
                    sub={`${data.departmentCount} Departments included`}
                />
                <Stat
                    icon={<BarChart3 size={20} />}
                    label="Utilization"
                    value={`${data.utilizationPct}%`}
                    sub={`₹${formatLakhCrore(data.totalUtilized / 1000)} Utilized`}
                    delta={"+1.2%"}
                    deltaDirection="up"
                />
            </div>

            <Card className="p-8 space-y-8 bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 backdrop-blur-3xl rounded-[2rem] shadow-premium">
                <div className="flex justify-between items-center">
                    <h3 className="font-serif font-bold text-2xl text-text-primary tracking-tight">Departmental Share</h3>
                    <div className="px-4 py-1.5 rounded-full bg-accent-saffron/10 border border-accent-saffron/20 text-accent-saffron text-[10px] mono font-bold uppercase tracking-widest">
                        Ministry Breakdown
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {data.departments.map((dept: { id: string; name: string; schemes: { allocated: number }[] }) => {
                        const deptAlloc = dept.schemes.reduce((acc: number, cur: { allocated: number }) => acc + cur.allocated, 0);
                        const pctOfMinistry = (deptAlloc / data.totalAllocated) * 100;
                        return (
                            <button
                                key={dept.id}
                                onClick={() => selectDepartment(dept.id)}
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                                }}
                                className="w-full p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-accent-saffron/30 dark:hover:border-accent-saffron/40 transition-all duration-500 group spotlight-card relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-accent-blue group-hover:bg-accent-saffron transition-all duration-500 group-hover:scale-125 shadow-[0_0_10px_rgba(79,158,255,0.4)] group-hover:shadow-[0_0_10px_rgba(255,153,51,0.4)]" />
                                            <span className="font-bold text-text-muted group-hover:text-text-primary transition-colors text-[15px]">{dept.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-text-primary">₹{formatLakhCrore(deptAlloc / 100).split(' ')[0]}</p>
                                                <p className="text-[9px] text-text-muted2 mono uppercase font-bold tracking-tighter">Lakh Cr</p>
                                            </div>
                                            <span className="mono text-accent-saffron font-bold text-sm bg-accent-saffron/10 px-3 py-1 rounded-xl ring-1 ring-accent-saffron/20">{pctOfMinistry.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 dark:bg-black/40 rounded-full overflow-hidden p-[1.5px] ring-1 ring-black/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-blue via-accent-blue/80 to-accent-blue/40 rounded-full group-hover:from-accent-saffron group-hover:via-accent-saffron/80 group-hover:to-accent-saffron/40 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,158,255,0.3)] group-hover:shadow-[0_0_15px_rgba(255,153,51,0.3)] relative"
                                            style={{ width: `${pctOfMinistry}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function DepartmentDetail({ data, parentMinistry }: {
    data: { id: string; name: string; schemes: { id: string; name: string; allocated: number; finalScore: number }[] } | undefined;
    parentMinistry: { name: string } | undefined;
}) {
    const { selectScheme } = useExplorerStore();
    if (!data) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-muted text-sm font-bold uppercase tracking-widest mono">
                    <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/20">
                        <Building2 size={16} />
                    </div>
                    {parentMinistry?.name}
                </div>
                <h2 className="text-5xl font-serif font-bold text-text-primary leading-tight tracking-tight">{data.name}</h2>
                <p className="text-text-muted leading-relaxed max-w-2xl font-medium">
                    Analyzing <span className="text-text-primary font-bold">{data.schemes.length} core schemes</span> within this department with AI-driven performance tracking.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stat
                    icon={<Target size={20} />}
                    label="Active Schemes"
                    value={data.schemes.length}
                    sub="Tracked this Fiscal Year"
                    className="shadow-premium"
                />
                <Stat
                    icon={<Layers size={20} />}
                    label="Avg Schemes Performance"
                    value={(data.schemes.reduce((acc: number, cur: { finalScore: number }) => acc + cur.finalScore, 0) / data.schemes.length).toFixed(1)}
                    sub="Composite Health Score"
                    className="shadow-premium"
                />
            </div>

            <Card className="p-0 overflow-hidden border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/60 dark:bg-white/10 border-b border-white/20 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-6 text-[11px] mono uppercase tracking-[0.2em] text-text-muted font-bold">Scheme Intelligence</th>
                                <th className="px-8 py-6 text-[11px] mono uppercase tracking-[0.2em] text-text-muted font-bold">Allocation</th>
                                <th className="px-8 py-6 text-[11px] mono uppercase tracking-[0.2em] text-text-muted text-center font-bold">Health Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 dark:divide-white/5">
                            {data.schemes.map((scheme: { id: string; name: string; allocated: number; finalScore: number }) => (
                                <tr
                                    key={scheme.id}
                                    onClick={() => selectScheme(scheme.id)}
                                    className="hover:bg-white/60 dark:hover:bg-accent-blue/5 transition-all duration-500 cursor-pointer group"
                                >
                                    <td className="px-8 py-7 text-[15px] font-bold text-text-muted group-hover:text-text-primary transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-accent-blue group-hover:bg-accent-saffron transition-all duration-500 group-hover:scale-125 shadow-[0_0_10px_rgba(79,158,255,0.4)]" />
                                            {scheme.name}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-500">
                                            <span className="text-text-primary text-[15px] font-bold leading-none tracking-tight">₹{(scheme.allocated / 100000).toFixed(2)}</span>
                                            <span className="text-[10px] text-text-muted2 mt-2 leading-none font-bold uppercase tracking-widest mono">Lakh crores</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex justify-center group-hover:scale-110 transition-transform duration-500">
                                            <ScoreRing score={scheme.finalScore} size={42} strokeWidth={4} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function SchemeDetail({ data }: {
    data: {
        name: string;
        description: string;
        priorityCategory: string;
        allocation: {
            allocated: number;
            utilized: number;
            capitalAllocated: number;
            revenueAllocated: number;
        };
        score: {
            finalScore: number;
            utilizationScore: number;
            outputScore: number;
            outcomeScore: number;
        };
    }
}) {
    const { showMethodology } = useExplorerStore();
    const allocation = data.allocation;
    const score = data.score;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                    <Badge color="gold">{data.priorityCategory}</Badge>
                    <h2 className="text-4xl font-serif font-bold text-text-primary leading-tight">{data.name}</h2>
                    <p className="text-text-muted leading-relaxed max-w-2xl">{data.description}</p>
                    <button
                        onClick={() => showMethodology()}
                        className="text-accent-blue text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                        <Info size={14} /> View Methodology
                    </button>
                </div>
                <ScoreRing score={score?.finalScore || 0} size={100} strokeWidth={10} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat
                    className="p-4"
                    icon={<Wallet size={16} />}
                    label="Allocated"
                    value={`₹${formatLakhCrore(allocation?.allocated / 1000)}`}
                />
                <Stat
                    className="p-4"
                    icon={<BarChart3 size={16} />}
                    label="Utilized"
                    value={`₹${formatLakhCrore(allocation?.utilized / 1000)}`}
                />
                <Stat
                    className="p-4"
                    icon={<Info size={16} />}
                    label="Capital"
                    value={`₹${formatLakhCrore(allocation?.capitalAllocated / 1000)}`}
                />
                <Stat
                    className="p-4"
                    icon={<Info size={16} />}
                    label="Revenue"
                    value={`₹${formatLakhCrore(allocation?.revenueAllocated / 1000)}`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6 space-y-6">
                    <h3 className="font-serif font-bold text-xl">Performance Metrics</h3>
                    <div className="space-y-6">
                        <ScoreBar label="Utilization Score (U)" value={score?.utilizationScore || 0} color="var(--accent-blue)" />
                        <ScoreBar label="Output Score (OP)" value={score?.outputScore || 0} color="var(--accent-green)" />
                        <ScoreBar label="Outcome Score (OC)" value={score?.outcomeScore || 0} color="var(--accent-purple)" />
                        <ScoreBar label="Final Rating" value={score?.finalScore || 0} color="var(--accent-saffron)" />
                    </div>
                </Card>

                <div className="space-y-6">
                    {/* AI Recommendation Callout */}
                    <div className="p-6 rounded-3xl bg-accent-saffron/5 border border-accent-saffron/20 shadow-[0_0_30px_rgba(255,153,51,0.05)] space-y-4 backdrop-blur-md relative overflow-hidden group hover:bg-accent-saffron/10 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-saffron/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                        <div className="flex items-center gap-3 text-accent-saffron relative z-10">
                            <BrainCircuit size={24} className="animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] mono">AI Intelligence Report</span>
                        </div>
                        <p className="text-[15px] text-text-primary leading-relaxed italic relative z-10 font-medium">
                            &quot;Current utilization trends suggest a potential surplus of ₹{formatLakhCrore((allocation?.allocated - allocation?.utilized) * 0.4 / 1000)}. We recommend reallocating 15% of the idle revenue budget to high-impact capital projects identified in the output achievement analysis.&quot;
                        </p>
                    </div>

                    <Card className="p-6 bg-white/5 border-white/5 border-dashed rounded-3xl backdrop-blur-md group transition-all duration-300 hover:border-accent-blue/30">
                        <div className="flex items-center gap-2 text-text-muted mb-6 group-hover:text-accent-blue transition-colors">
                            <Layers size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest mono">Capital/Revenue Breakdown</span>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] mono uppercase tracking-wider font-bold">
                                    <span className="text-text-muted2">Capital Contribution</span>
                                    <span className="text-text-primary">42%</span>
                                </div>
                                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-accent-blue w-[42%] shadow-[0_0_10px_rgba(79,158,255,0.4)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] mono uppercase tracking-wider font-bold">
                                    <span className="text-text-muted2">Revenue Contribution</span>
                                    <span className="text-text-primary">58%</span>
                                </div>
                                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-accent-purple w-[58%] shadow-[0_0_10px_rgba(164,124,255,0.4)]" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MethodologyDetail() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/20">
                        <BrainCircuit size={20} />
                    </div>
                    <Badge color="blue">SCORING FRAMEWORK V2.0</Badge>
                </div>
                <h2 className="text-5xl md:text-6xl font-serif font-bold gold-leaf-text leading-tight tracking-tight">Mathematical Methodology</h2>
                <p className="text-text-muted leading-relaxed max-w-2xl font-medium text-lg">
                    RashtraKosh evaluates government performance through a rigorous, weighted index across three primary dimensions.
                </p>
            </div>

            {/* Formula Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent-gold/40 via-accent-saffron/20 to-accent-gold/40 rounded-[2rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative glass-panel p-10 bg-black/60 dark:bg-black/80 border-accent-gold/40 flex flex-col items-center gap-10 shadow-2xl ring-2 ring-accent-gold/10">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.4em] mono">Statistical Formulation Layer</span>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent-gold to-transparent"></div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                        <div className="flex flex-col items-center gap-3 group/term">
                            <span className="text-5xl font-serif text-text-primary font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">0.30<span className="text-accent-gold-bright opacity-90 ml-1">U</span></span>
                            <span className="text-[10px] font-bold text-accent-gold-bright uppercase tracking-widest mono bg-accent-gold/20 px-4 py-1.5 rounded-full ring-2 ring-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">Utilization</span>
                        </div>
                        <span className="text-4xl text-accent-gold font-serif drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">⊕</span>
                        <div className="flex flex-col items-center gap-3 group/term">
                            <span className="text-5xl font-serif text-text-primary font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">0.35<span className="text-accent-green opacity-90 ml-1">OP</span></span>
                            <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest mono bg-accent-green/20 px-4 py-1.5 rounded-full ring-2 ring-accent-green shadow-[0_0_20px_rgba(31,207,116,0.1)]">Output Index</span>
                        </div>
                        <span className="text-4xl text-accent-gold font-serif drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">⊕</span>
                        <div className="flex flex-col items-center gap-3 group/term">
                            <span className="text-5xl font-serif text-text-primary font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">0.35<span className="text-accent-purple opacity-90 ml-1">OC</span></span>
                            <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest mono bg-accent-purple/20 px-4 py-1.5 rounded-full ring-2 ring-accent-purple shadow-[0_0_20px_rgba(164,124,255,0.1)]">Outcome Gain</span>
                        </div>
                    </div>

                    <div className="max-w-xl text-center">
                        <p className="text-xs text-text-muted2 italic leading-relaxed">
                            "The methodology prioritizes <span className="text-text-primary font-bold">real-world impact (70%)</span> while ensuring accountability through <span className="text-text-primary font-bold">fiscal discipline (30%)</span>."
                        </p>
                    </div>
                </div>
            </div>

            {/* Metric Breakdowns */}
            <div className="grid grid-cols-1 gap-12">
                {/* Metric 1 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-l-2 border-accent-blue pl-6">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold text-text-primary tracking-tight">Utilization Index (U)</h4>
                            <p className="text-xs text-text-muted">Measuring speed and regularity of capital deployment.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-accent-blue">30%</span>
                            <p className="text-[9px] font-bold text-text-muted2 uppercase tracking-widest">Global Weight</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Exp. Rate", weight: "40%", icon: <Wallet size={12} />, desc: "Allocation vs Expenditure" },
                            { label: "Temporal Dist.", weight: "25%", icon: <Stat icon={<BarChart3 size={12} />} label="" value="" />, desc: "Quarterly spending parity" },
                            { label: "Surrender", weight: "20%", icon: <ArrowLeft size={12} />, desc: "Late fund return penalty" },
                            { label: "Discipline", weight: "15%", icon: <Info size={12} />, desc: "Supplementary demand check" }
                        ].map((m, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-blue/30 transition-all group/card">
                                <div className="flex items-center gap-2 text-accent-blue mb-3">
                                    {m.icon}
                                    <span className="text-[10px] font-bold uppercase tracking-widest mono">{m.weight}</span>
                                </div>
                                <p className="text-[13px] font-bold text-text-primary mb-1">{m.label}</p>
                                <p className="text-[10px] text-text-muted2 leading-relaxed font-medium">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-l-2 border-accent-green pl-6">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold text-text-primary tracking-tight">Output Performance (OP)</h4>
                            <p className="text-xs text-text-muted">Tracking completion of planned physical units and services.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-accent-green">35%</span>
                            <p className="text-[9px] font-bold text-text-muted2 uppercase tracking-widest">Global Weight</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            { label: "Units", weight: "30%", desc: "Physical completion" },
                            { label: "Reach", weight: "25%", desc: "Beneficiary count" },
                            { label: "Timeline", weight: "20%", desc: "Milestone dates" },
                            { label: "Quality", weight: "15%", desc: "Audit standards" },
                            { label: "Equity", weight: "10%", desc: "Geo-distribution" }
                        ].map((m, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-green/30 transition-all">
                                <span className="text-[9px] font-bold text-accent-green uppercase tracking-widest mono block mb-2">{m.weight}</span>
                                <p className="text-xs font-bold text-text-primary mb-1">{m.label}</p>
                                <p className="text-[9px] text-text-muted2 leading-tight">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-l-2 border-accent-purple pl-6">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold text-text-primary tracking-tight">Outcome Impact (OC)</h4>
                            <p className="text-xs text-text-muted">Evaluating long-term sector-wide qualitative improvements.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-accent-purple">35%</span>
                            <p className="text-[9px] font-bold text-text-muted2 uppercase tracking-widest">Global Weight</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            { label: "KPI Gain", weight: "30%", desc: "Net positive shift" },
                            { label: "Baseline", weight: "25%", desc: "Historical improvement" },
                            { label: "Quality Life", weight: "20%", desc: "Citizen impact" },
                            { label: "Direct Share", weight: "15%", desc: "Attribution rate" },
                            { label: "Sustainability", weight: "10%", desc: "Long-term effect" }
                        ].map((m, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-purple/30 transition-all">
                                <span className="text-[9px] font-bold text-accent-purple uppercase tracking-widest mono block mb-2">{m.weight}</span>
                                <p className="text-xs font-bold text-text-primary mb-1">{m.label}</p>
                                <p className="text-[9px] text-text-muted2 leading-tight">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="w-14 h-14 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0 ring-1 ring-accent-blue/20">
                    <Target size={28} />
                </div>
                <div className="space-y-2 text-center md:text-left relative z-10">
                    <h5 className="font-bold text-text-primary text-lg">Statistical Integrity Notice</h5>
                    <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
                        To maintain transparency, all sub-metrics are calculated to 4 decimal points before weighting. The final scores shown are mathematically guaranteed to reflect the specific weighted contribution of every sub-metric within each dimension. Data is audited every 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
