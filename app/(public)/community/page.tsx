"use client"
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
    Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    MessageSquare, ThumbsUp, TrendingUp, Users,
    Search, Filter, Plus, UserCircle2, Building2,
    Clock, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedbackItemWithAuthor } from '@/lib/types';

const CATEGORIES = ['ALL', 'SCHEME_PERFORMANCE', 'POLICY_SUGGESTION', 'ANOMALY_FLAG', 'REALLOCATION_SUGGESTION', 'DATA_QUALITY'];

const PROTOTYPE_REVIEWS = [
    {
        id: 'rev-1',
        author: 'Dr. Arvinder Singh',
        role: 'Economic Policy Analyst',
        content: 'The depth of data available for OOMF framework analysis is unprecedented. This platform could revolutionize how we track capital expenditure efficiency.',
        rating: 5,
        date: '2026-03-15'
    },
    {
        id: 'rev-2',
        author: 'Meera Deshmukh',
        role: 'Social Impact Researcher',
        content: 'I love how easy it is to flag anomalies in scheme allocations. The community-driven approach to fiscal transparency is exactly what we need.',
        rating: 4,
        date: '2026-03-20'
    },
    {
        id: 'rev-3',
        author: 'Rahul Verma',
        role: 'FinTech Entrepreneur',
        content: 'The AI-driven insights (Chanakya) combined with citizen feedback creates a powerful hybrid for governance monitoring. A great prototype!',
        rating: 5,
        date: '2026-03-25'
    }
];

export default function CommunityPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [statusFilter] = useState('ALL'); // New state for status filter
    const [categoryFilter, setCategoryFilter] = useState('ALL'); // Renamed from activeCategory
    const [sortBy] = useState('newest'); // New state for sort by
    const [showForm, setShowForm] = useState(false);

    // Data Fetching
    const { data: feedbackItems, isLoading } = useQuery({
        queryKey: ['feedback', statusFilter, categoryFilter, sortBy],
        queryFn: () => fetch(`/api/feedback?status=${statusFilter}&category=${categoryFilter}&sort=${sortBy}`).then(res => res.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Mutations
    const { mutate: vote, isPending: isVoting } = useMutation({
        mutationFn: (id: string) => fetch(`/api/feedback/${id}/vote`, { method: 'POST' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        }
    });

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 space-y-12">

            {/* Hero / CTA Section */}
            <section className="glass-panel relative h-[320px] rounded-[40px] flex flex-col items-center justify-center text-center p-8 border-border-accent/10">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-saffron/10 via-transparent to-accent-blue/5 opacity-50" />

                <div className="relative space-y-6 max-w-3xl">
                    <Badge color="saffron" className="px-4 py-1 bg-accent-saffron/10 text-accent-saffron border-accent-saffron/20">
                        Open Governance Forum
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-primary text-glow-saffron">
                        Shape India&apos;s <span className="text-accent-gold">Capital</span> Future
                    </h1>
                    <p className="text-lg text-text-muted max-w-2xl balance mx-auto">
                        Participate in the scrutiny of India&apos;s financial future. Share observations, flag anomalies, and suggest reallocations.
                    </p>
                    <div className="pt-4">
                        <Button
                            onClick={() => session ? setShowForm(true) : alert("Please login to submit feedback.")}
                            className="glass-button bg-accent-saffron/10 text-accent-saffron hover:bg-accent-saffron hover:text-white border-accent-saffron/30 hover:shadow-[0_0_30px_rgba(255,153,51,0.3)] h-12 px-8 rounded-xl font-bold flex items-center gap-2 transition-all duration-300"
                        >
                            <Plus size={20} /> Submit Policy Feedback
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Filters & Stats */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-serif font-bold text-xl flex items-center gap-2 px-1">
                            <Filter size={18} className="text-text-muted" />
                            Filters
                        </h3>
                        <div className="flex flex-col gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        "w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                                        categoryFilter === cat
                                            ? "bg-accent-saffron/20 text-accent-saffron border border-accent-saffron/30 shadow-[0_4px_20px_rgba(255,153,51,0.1)] translate-x-1"
                                            : "text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-white/10"
                                    )}
                                >
                                    <span className="relative z-10">{cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' ')}</span>
                                    <ChevronRight size={14} className={cn("opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1", categoryFilter === cat && "opacity-100 translate-x-1")} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card className="glass-card p-6 border-accent-blue/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={40} className="text-accent-blue" />
                        </div>
                        <h4 className="text-[10px] mono font-bold uppercase tracking-widest text-accent-blue flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                            Community Impact
                        </h4>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20 group-hover/item:bg-accent-blue/20 transition-colors">
                                    <Users size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xl font-serif font-bold text-text-primary leading-none">1.2k</p>
                                    <p className="text-[10px] text-text-muted2 mono uppercase tracking-wider font-bold">Active Reviewers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green border border-accent-green/20 group-hover/item:bg-accent-green/20 transition-colors">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xl font-serif font-bold text-text-primary leading-none">84%</p>
                                    <p className="text-[10px] text-text-muted2 mono uppercase tracking-wider font-bold">Response Rate</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-serif font-bold text-text-primary flex items-center gap-3">
                            <TrendingUp className="text-accent-gold" size={24} />
                            Recent Feedback
                            <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-[9px] font-bold uppercase tracking-wider ml-2">
                                Prototype
                            </Badge>
                        </h2>
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within/search:text-accent-saffron transition-colors" size={16} />
                            <input
                                placeholder="Search threads..."
                                className="glass-input pl-11 pr-5 py-2.5 text-sm w-72 focus:w-80 transition-all duration-500 ease-out shadow-lg"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)
                    ) : feedbackItems?.length > 0 ? (
                        <div className="space-y-4">
                            {feedbackItems.map((item: FeedbackItemWithAuthor) => (
                                <FeedbackCard
                                    key={item.id}
                                    item={item}
                                    onVote={() => vote(item.id)}
                                    isVoted={item.hasCurrentUserVoted}
                                    isVoting={isVoting}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center space-y-4 border border-dashed border-border-default rounded-2xl">
                            <MessageSquare size={48} className="mx-auto text-text-muted opacity-20" />
                            <p className="text-text-muted font-medium">No feedback items found in this category.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section - PROTOTYPE VERSION */}
            <ReviewsSection />

            {/* Submission Modal (Simulated for this implementation) */}
            {showForm && (
                <FeedbackFormModal onClose={() => setShowForm(false)} />
            )}
        </main>
    );
}

function FeedbackCard({ item, onVote, isVoted, isVoting }: {
    item: FeedbackItemWithAuthor;
    onVote: () => void;
    isVoted: boolean;
    isVoting: boolean;
}) {
    const author = item.author;
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Card className="glass-card spotlight-card p-6 transition-all duration-500 hover:border-accent-saffron/20 group animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-6 relative z-10">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-1.5">
                    <button
                        disabled={isVoting}
                        onClick={onVote}
                        aria-label={`Vote for feedback: ${item.title}`}
                        aria-pressed={isVoted}
                        className={cn(
                            "w-12 h-14 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
                            isVoted
                                ? "bg-accent-saffron text-white border-accent-saffron shadow-[0_4px_15px_rgba(255,153,51,0.4)]"
                                : "bg-white/5 border-border-default text-text-muted hover:text-accent-saffron hover:border-accent-saffron/30 hover:bg-white/10"
                        )}
                    >
                        <ThumbsUp size={18} className={cn("transition-transform", isVoting && "animate-pulse")} aria-hidden="true" />
                        <span className="text-xs font-bold mono mt-0.5">{item.voteCount}</span>
                    </button>
                    <span className="text-[10px] mono text-text-muted2 uppercase font-bold tracking-widest text-center" aria-hidden="true">Votes</span>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                            <h4 className="text-xl font-bold text-text-primary group-hover:text-accent-saffron transition-colors duration-300">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    className={cn(
                                        "text-[9px] px-2.5 py-0.5 border transition-colors",
                                        item.category === 'POLICY_SUGGESTION' ? "bg-accent-purple/10 text-accent-purple border-accent-purple/20" :
                                            item.category === 'REALLOCATION_SUGGESTION' ? "bg-accent-gold/10 text-accent-gold border-accent-gold/20" :
                                                "bg-accent-blue/10 text-accent-blue border-accent-blue/20"
                                    )}
                                >
                                    {item.category.replace(/_/g, ' ')}
                                </Badge>
                                <span className="text-[10px] text-text-muted2 mono flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                    <Clock size={10} /> {date}
                                </span>
                            </div>
                        </div>
                        <Badge
                            className={cn(
                                "text-[9px] mono px-2 py-0.5 rounded-md",
                                item.status === 'NEW' ? "border-accent-blue/30 text-accent-blue" : "border-accent-green/30 text-accent-green"
                            )}
                        >
                            {item.status}
                        </Badge>
                    </div>

                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2 italic">
                        &quot;{item.body}&quot;
                    </p>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {author ? (
                                <div className="flex items-center gap-2.5 group/author">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue/20 to-accent-purple/20 flex items-center justify-center text-accent-blue border border-white/10 group-hover/author:border-accent-blue/30 transition-colors shadow-sm">
                                        <UserCircle2 size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-primary group-hover/author:text-accent-blue transition-colors">{author.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-text-muted2 mono uppercase tracking-wider">{author.membershipTier}</span>
                                            {author.membershipTier !== 'FREE' && (
                                                <ShieldCheck size={10} className="text-accent-gold" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5 opacity-60">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted border border-border-default">
                                        <Users size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-text-muted italic leading-none">Anonymous Citizen</span>
                                        <span className="text-[9px] text-text-muted2 mono uppercase tracking-wider">Independent Stakeholder</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {item.schemeName && (
                            <div className="flex items-center gap-2 text-accent-blue text-[9px] font-bold uppercase mono bg-accent-blue/10 px-4 py-1.5 rounded-full border border-accent-blue/20 shadow-sm group-hover:bg-accent-blue/20 transition-all">
                                <Building2 size={12} /> {item.schemeName}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function FeedbackFormModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        category: 'POLICY',
        isAnonymous: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['feedback'] });
                onClose();
            } else {
                const err = await res.text();
                alert(err);
            }
        } catch {
            alert("Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md" onClick={onClose} />
            <Card className="relative w-full max-w-2xl bg-bg-card border-border-accent/40 shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-serif font-bold text-text-primary">New Policy Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="feedback-title" className="text-xs font-bold mono text-text-muted uppercase tracking-widest">Feedback Title</label>
                            <input
                                id="feedback-title"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Inefficiency in Rural Water Distribution - Sector X"
                                className="w-full bg-white/5 border border-border-default rounded-xl px-4 py-3 h-12 text-sm text-text-primary focus:border-accent-saffron/50 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="feedback-category" className="text-xs font-bold mono text-text-muted uppercase tracking-widest">Category</label>
                                <select
                                    id="feedback-category"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/5 border border-border-default rounded-xl px-4 py-3 h-12 text-sm text-text-primary focus:border-accent-saffron/50 outline-none transition-all"
                                >
                                    <option value="SCHEME_PERFORMANCE">Scheme Performance</option>
                                    <option value="POLICY_SUGGESTION">Policy Suggestion</option>
                                    <option value="ANOMALY_FLAG">Anomaly Flag</option>
                                    <option value="REALLOCATION_SUGGESTION">Reallocation Suggestion</option>
                                    <option value="DATA_QUALITY">Data Quality</option>
                                </select>
                            </div>
                            <div className="space-y-2 flex flex-col justify-end">
                                <label htmlFor="feedback-anonymous" className="flex items-center gap-3 p-3 border border-border-default rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                                    <input
                                        id="feedback-anonymous"
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/5 border-border-default text-accent-saffron focus:ring-accent-saffron/30"
                                    />
                                    <span className="text-xs font-medium text-text-muted">Post Anonymously</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="feedback-body" className="text-xs font-bold mono text-text-muted uppercase tracking-widest">Detail Description (Min. 50 chars)</label>
                            <textarea
                                id="feedback-body"
                                required
                                rows={5}
                                value={formData.body}
                                onChange={e => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Provide data-points, observations, or specific recommendations..."
                                className="w-full bg-white/5 border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent-saffron/50 outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={loading || formData.body.length < 50} className="flex-1 h-12 rounded-xl bg-accent-saffron text-white">
                                {loading ? "Submitting..." : "Publish Feedback"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card >
        </div >
    );
}

function ReviewsSection() {
    return (
        <section className="space-y-8 pt-12 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <Badge color="saffron" className="px-3 py-0.5 bg-accent-saffron/10 text-accent-saffron border-accent-saffron/20 text-[10px] font-bold tracking-widest uppercase mb-2">
                        Citizen Voices
                    </Badge>
                    <h2 className="text-3xl font-serif font-bold text-text-primary">
                        User <span className="text-accent-gold">Reviews</span>
                    </h2>
                    <p className="text-sm text-text-muted max-w-xl">
                        See what the community is saying about RashtraKosh and its impact on financial transparency.
                    </p>
                </div>
                <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-accent-blue uppercase tracking-wider">Prototype Version</p>
                        <p className="text-[10px] text-text-muted2">Showing how the review system will work in production.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROTOTYPE_REVIEWS.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </section>
    );
}

function ReviewCard({ review }: { review: typeof PROTOTYPE_REVIEWS[0] }) {
    return (
        <Card className="glass-card p-6 border-white/5 hover:border-accent-saffron/20 transition-all duration-300 group">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1 text-accent-gold">
                        {Array(5).fill(0).map((_, i) => (
                            <ThumbsUp key={i} size={12} className={cn(i < review.rating ? "fill-accent-gold" : "opacity-20")} />
                        ))}
                    </div>
                    <span className="text-[10px] mono text-text-muted2">{new Date(review.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </div>
                
                <p className="text-sm text-text-muted leading-relaxed italic">
                    &quot;{review.content}&quot;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-saffron/20 to-accent-gold/20 flex items-center justify-center text-accent-saffron border border-white/10 group-hover:border-accent-saffron/30 transition-colors">
                        <UserCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-primary group-hover:text-accent-saffron transition-colors">{review.author}</p>
                        <p className="text-[10px] text-text-muted2 mono uppercase tracking-wider">{review.role}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function ChevronRight({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
    return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
}
