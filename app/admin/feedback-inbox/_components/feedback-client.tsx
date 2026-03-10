"use client";

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, ShieldAlert, BadgeCheck, FileText, ChevronDown, ChevronUp, MoreVertical, Plus } from "lucide-react";
import { FeedbackCategory, FeedbackStatus, MembershipTier } from "@prisma/client";

interface FeedbackItemProps {
    id: string;
    title: string;
    body: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    weightedScore: number;
    createdAt: Date;
    adminNote: string | null;
    author: {
        name: string;
        membershipTier: MembershipTier;
        credentialVerified: boolean;
    };
    scheme: {
        name: string;
    } | null;
}

export default function FeedbackClient({ initialData, stats }: { initialData: FeedbackItemProps[], stats: any }) {
    const [items, setItems] = useState<FeedbackItemProps[]>(initialData);
    const [briefingQueue, setBriefingQueue] = useState<string[]>([]);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterTier, setFilterTier] = useState<string>("ALL");

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleBriefingQueue = (id: string) => {
        setBriefingQueue(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
        try {
            // Mock API call
            await fetch(`/api/feedback/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
        } catch (e) {
            console.error(e);
        }
    };

    const handleAdminNoteBlur = async (id: string, note: string) => {
        setItems(items.map(item => item.id === id ? { ...item, adminNote: note } : item));
        try {
            // Mock API call
            await fetch(`/api/feedback/${id}/note`, { method: "PATCH", body: JSON.stringify({ adminNote: note }) });
        } catch (e) {
            console.error(e);
        }
    };

    const formatCategory = (cat: string) => {
        return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const filteredItems = items.filter(item => {
        if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
        if (filterTier === "EXPERT" && item.author.membershipTier !== "EXPERT") return false;
        if (filterTier === "GENERAL" && item.author.membershipTier === "EXPERT") return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">New Items</p>
                        <p className="text-xl font-bold mt-0.5">{stats.newCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Under Review</p>
                        <p className="text-xl font-bold mt-0.5">{stats.reviewCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Incorporated</p>
                        <p className="text-xl font-bold mt-0.5">{stats.incorporatedCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 border border-rose-200 dark:border-rose-900/50 rounded-lg shadow-sm flex items-center gap-4 bg-rose-50/50 dark:bg-rose-950/20">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Expert-Tier Priority</p>
                        <p className="text-xl font-bold mt-0.5 text-rose-600 dark:text-rose-400">{stats.expertCount}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Inbox */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Controls */}
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-semibold">Feedback Stream</h2>
                        <div className="flex gap-2">
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm">
                                <option value="ALL">All Statuses</option>
                                <option value="NEW">New</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="INCORPORATED">Incorporated</option>
                            </select>
                            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm">
                                <option value="ALL">All Tiers</option>
                                <option value="EXPERT">Expert Only</option>
                                <option value="GENERAL">General Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-4">
                        {filteredItems.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No feedback items match your filters.</div>
                        ) : filteredItems.map((item) => {
                            const isExpanded = expandedItems.includes(item.id);
                            const inQueue = briefingQueue.includes(item.id);
                            const isExpert = item.author.membershipTier === "EXPERT" || item.author.membershipTier === "INSTITUTIONAL";

                            return (
                                <div key={item.id} className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm transition-all ${isExpert ? 'border-rose-200 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-900/5' : 'border-slate-200 dark:border-slate-800'}`}>

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {isExpert && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                                                        <BadgeCheck className="h-3 w-3" /> VERIFIED EXPERT
                                                    </span>
                                                )}
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {formatCategory(item.category)}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mt-1">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.author.name}</span>
                                                {item.scheme && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2">{item.scheme.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800/50">
                                                    Score: {Number(item.weightedScore).toFixed(1)}
                                                </span>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                                                    className={`text-xs font-bold px-2 py-1 rounded border outline-none ${item.status === 'NEW' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' :
                                                            item.status === 'UNDER_REVIEW' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' :
                                                                item.status === 'INCORPORATED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
                                                                    'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <option value="NEW">NEW</option>
                                                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                                                    <option value="INCORPORATED">INCORPORATED</option>
                                                    <option value="ARCHIVED">ARCHIVED</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className={`text-sm text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap ${!isExpanded && 'line-clamp-2'}`}>
                                        {item.body}
                                    </div>

                                    {item.body.length > 150 && (
                                        <button onClick={() => toggleExpand(item.id)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-4 hover:underline">
                                            {isExpanded ? <><ChevronUp className="h-3 w-3" /> Show Less</> : <><ChevronDown className="h-3 w-3" /> Read More</>}
                                        </button>
                                    )}

                                    {/* Admin Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Add internal admin note (saves on blur)..."
                                                defaultValue={item.adminNote || ""}
                                                onBlur={(e) => handleAdminNoteBlur(item.id, e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => toggleBriefingQueue(item.id)}
                                            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${inQueue
                                                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                                                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {inQueue ? 'Remove from Briefing' : <><Plus className="h-4 w-4" /> Include in Policy Briefing</>}
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Briefing Queue Sidebar */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                    <div className="bg-slate-900 dark:bg-slate-950 p-5 rounded-xl border border-slate-800 text-white sticky top-6 shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-500/20 rounded-lg">
                                <FileText className="h-5 w-5 text-rose-400" />
                            </div>
                            <h2 className="font-semibold text-lg">Briefing Queue</h2>
                        </div>

                        <div className="mb-6">
                            {briefingQueue.length === 0 ? (
                                <p className="text-sm text-slate-400">Select items to compile into the next policy briefing document.</p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-emerald-400">{briefingQueue.length} items queued</p>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        {briefingQueue.map(id => {
                                            const item = items.find(i => i.id === id);
                                            return (
                                                <li key={id} className="truncate border-l-2 border-rose-500 pl-2">
                                                    {item?.title}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={briefingQueue.length === 0}
                            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                            Generate Briefing Document
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
