"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Card
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Send, BrainCircuit, History,
    Lightbulb, ShieldAlert, ChevronRight, Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
    "Which ministries have the highest budget utilization?",
    "Analyze the performance of Jal Jeevan Mission in 2024.",
    "What are the top 5 schemes by outcome score?",
    "Recommend budget reallocations based on idle funds.",
    "Identify schemes with declining efficiency over 3 years."
];

export default function IntelligencePage() {
    const { data: session } = useSession();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAsk = async (text?: string) => {
        const finalQuery = text || query;
        if (!finalQuery || loading) return;

        if (!session) {
            alert("Please login to use the AI Policy Advisor.");
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: finalQuery }]);
        setQuery('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: finalQuery })
            });

            if (!res.ok) throw new Error("Unauthorized or Error");

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                const chunk = decoder.decode(value);
                assistantContent += chunk;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = assistantContent;
                    return newMsgs;
                });
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please ensure you have the required administrative permissions to access the live analysis engine." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 space-y-12">

            {/* Hero Section */}
            <section className="text-center space-y-8 py-12">
                <div className="space-y-4">
                    <Badge color="purple" className="px-4 py-1 flex items-center gap-2 mx-auto w-fit">
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Chanakya AI Advisor</span>
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-text-primary">
                        Ask <span className="text-accent-purple">Chanakya</span>
                    </h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">
                        Our AI analyzes live scheme outcomes, utilization spikes, and efficiency trends to provide real-time policy recommendations.
                    </p>
                </div>

                {/* Large Centered Input */}
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-accent-purple/20 via-accent-blue/20 to-accent-purple/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[30px]" />
                    <div className="relative bg-bg-card border border-border-default hover:border-accent-purple/40 transition-all rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
                        <div className="pl-4 text-accent-purple">
                            <BrainCircuit size={24} />
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Query any ministry, scheme, or financial trend..."
                            className="bg-transparent border-none focus:ring-0 flex-1 h-14 text-lg text-text-primary placeholder:text-text-muted2"
                        />
                        <Button
                            onClick={() => handleAsk()}
                            disabled={loading}
                            className="bg-accent-purple hover:bg-accent-purple/90 text-white h-12 w-12 rounded-xl p-0 shrink-0"
                        >
                            <Send size={20} />
                        </Button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleAsk(s)}
                            className="px-4 py-2 rounded-full border border-border-default bg-white/5 text-xs text-text-muted2 hover:text-text-primary hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all flex items-center gap-2"
                        >
                            <Lightbulb size={12} className="text-accent-gold" />
                            {s}
                        </button>
                    ))}
                </div>
            </section>

            {/* Chat & Context Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
                {/* Left: Intelligence Report Panel */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                    <h3 className="font-serif font-bold text-xl flex items-center gap-2 px-1">
                        <History size={18} className="text-text-muted" />
                        Context & Analysis
                    </h3>
                    <Card className="flex-1 p-6 relative overflow-hidden group border-dashed border-border-default bg-transparent">
                        <div className="absolute top-0 right-0 p-4">
                            <Terminal size={100} className="text-white/[0.02] -mr-8 -mt-8" />
                        </div>
                        <div className="relative space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] mono text-accent-blue uppercase tracking-widest font-bold">Active Context</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent-saffron/10 flex items-center justify-center text-accent-saffron">
                                                <ChevronRight size={16} />
                                            </div>
                                            <span className="text-xs font-medium text-text-primary">FY 2024-25 Data</span>
                                        </div>
                                        <Badge color="green" className="text-[8px] mono">LIVE</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                                                <ChevronRight size={16} />
                                            </div>
                                            <span className="text-xs font-medium text-text-primary">All Ministries</span>
                                        </div>
                                        <Badge color="blue" className="text-[8px] mono">GLOBAL</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] mono text-accent-purple uppercase tracking-widest font-bold">Inference Engine</p>
                                <div className="p-4 rounded-xl bg-accent-purple/5 border border-accent-purple/10 space-y-2">
                                    <p className="text-[10px] text-text-muted2 leading-relaxed">
                                        Using <span className="text-accent-purple mono font-bold">Claude 3.5 Sonnet</span> with dedicated weights for Indian Public Finance.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-accent-red/5 border border-accent-red/10 flex gap-3">
                                <ShieldAlert size={18} className="text-accent-red shrink-0" />
                                <p className="text-[10px] text-text-muted2 leading-relaxed italic">
                                    AI responses are for analysis only and should be verified against official Ministry of Finance gazettes before policy decisions.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Chat Interface */}
                <div className="lg:col-span-8 flex flex-col h-full bg-bg-card rounded-2xl border border-border-default overflow-hidden">
                    <div className="p-4 border-b border-border-default bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                            <span className="text-xs font-mono font-bold tracking-widest text-text-muted2 uppercase">Session Console</span>
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="text-[10px] mono text-text-muted hover:text-accent-red transition-colors"
                        >
                            CLEAR STORAGE
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                <Terminal size={48} className="text-text-muted" />
                                <p className="text-sm mono">AWAIT_USER_INPUT...</p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex flex-col space-y-2 max-w-[85%]",
                                        m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-accent-purple/20 border border-accent-purple/30 text-text-primary rounded-tr-none"
                                            : "bg-white/5 border border-border-default text-text-muted rounded-tl-none whitespace-pre-wrap"
                                    )}>
                                        {m.content || (loading && i === messages.length - 1 ? <span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span> : '')}
                                    </div>
                                    <span className="text-[10px] mono text-text-muted uppercase px-1">
                                        {m.role === 'user' ? 'Local Terminal' : 'Chanakya AI'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-border-default bg-white/[0.01]">
                        {!session && (
                            <div className="text-center p-2 rounded-lg bg-accent-saffron/10 border border-accent-saffron/20 text-xs text-accent-saffron font-bold">
                                AUTHENTICATION_REQUIRED: PLEASE LOGIN TO ENABLE LIVE ANALYSIS ENGINE
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
