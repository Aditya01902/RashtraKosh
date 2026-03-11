"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function InsightsAdminPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Fetch all schemes
    const { data: schemes, isLoading } = useQuery({
        queryKey: ['all-schemes-for-insights'],
        queryFn: () => fetch('/api/schemes?status=all').then(res => res.json())
    });

    // Helper to log UI messages
    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    };

    const runPuterBatch = async () => {
        if (!schemes || schemes.length === 0) return;
        setIsGenerating(true);
        setLogs([]);
        setProgress(0);

        let successCount = 0;

        try {
            // Check if Puter is loaded
            if (typeof (window as any).puter === 'undefined') {
                addLog("ERROR: Puter.js is not loaded in the browser window.");
                setIsGenerating(false);
                return;
            }

            addLog(`Starting AI Batch Generation for ${schemes.length} schemes using Claude 3 Opus via Puter.js...`);

            for (let i = 0; i < schemes.length; i++) {
                const scheme = schemes[i];
                addLog(`[${i + 1}/${schemes.length}] Analyzing: ${scheme.name}...`);

                // 1. Fetch deep historical data for this specific scheme
                const schemeResponse = await fetch(`/api/schemes/${scheme.id}`);
                const schemeData = await schemeResponse.json();

                if (!schemeData.historicalAllocations || schemeData.historicalAllocations.length === 0) {
                    addLog(`Skipping ${scheme.name}: No historical allocation data found.`);
                    setProgress(((i + 1) / schemes.length) * 100);
                    continue;
                }

                // 2. Construct the specialized Prompt
                const historyText = schemeData.historicalAllocations.map((a: any) => {
                    const scoreObj = schemeData.historicalScores?.find((s: any) => s.fiscalYear === a.fiscalYear);
                    return `[FY ${a.fiscalYear}] Allocated: ₹${a.allocated} crore, Utilized: ₹${a.utilized} crore, Score: ${scoreObj?.finalScore || 0}`;
                }).join(' | ');

                const prompt = `
You are RashtraKosh AI, a distinguished financial policy advisor for the Government of India.
Analyze the following multi-year trend for the centralized scheme '${scheme.name}'.
Target: Provide a 1-2 sentence hyper-specific recommendation or highly analytical observation on its performance trajectory.
Data: ${historyText}

Constraints:
- Be highly professional and data-driven.
- MUST be exactly 1 to 2 sentences.
- Do NOT use introductory filler (e.g., "Based on the data"). Get straight to the point.
- Refer strictly to the scheme's trajectory.`;

                try {
                    // 3. Call Puter AI (Claude-3.5-Sonnet / Opus equivalent free model)
                    const aiResponse = await (window as any).puter.ai.chat(prompt, { model: 'claude-3-5-sonnet' });
                    const insightText = aiResponse?.message?.content || String(aiResponse);

                    // 4. Save to Database
                    const saveRes = await fetch('/api/admin/save-insight', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ schemeId: scheme.id, insightText: insightText.trim() })
                    });

                    if (saveRes.ok) {
                        addLog(`✅ Saved insight for ${scheme.name}`);
                        successCount++;
                    } else {
                        addLog(`❌ Failed to save insight for ${scheme.name}`);
                    }
                } catch (aiErr: any) {
                    addLog(`❌ Puter API Error on ${scheme.name}: ${aiErr.message}`);
                }

                // Update progress bar
                setProgress(((i + 1) / schemes.length) * 100);

                // Add a small delay to avoid overwhelming the browser or rate limits
                await new Promise(r => setTimeout(r, 1000));
            }

            addLog(`🎉 Batch processing complete! Successfully generated ${successCount} insights.`);

        } catch (error: any) {
            addLog(`CRITICAL ERROR: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-12 space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold text-text-primary">AI Insight Generator</h1>
                <p className="text-text-muted">Batch process the entire database through Puter.js (Client-Side execution) to assign pre-computed insights without consuming backend API keys.</p>
            </div>

            <Card className="p-8 space-y-6 shadow-premium border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-3xl">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-accent-blue">
                        <BrainCircuit size={24} className={isGenerating ? "animate-pulse delay-75" : ""} />
                        <span className="font-bold mono tracking-widest uppercase">Puter.js Engine Connected</span>
                    </div>
                    <div className="text-sm font-bold text-text-muted">
                        Total Targets: {isLoading ? '...' : schemes?.length}
                    </div>
                </div>

                {isGenerating && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold mono text-text-muted">
                            <span>Processing schemes...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-blue transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,158,255,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <Button
                    onClick={runPuterBatch}
                    disabled={isGenerating || isLoading || !schemes || schemes.length === 0}
                    className="w-full bg-accent-blue hover:bg-accent-blue-light text-white font-bold tracking-widest uppercase py-6"
                >
                    {isGenerating ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> EXECUTING CLAUDE-3 BATCH...</>
                    ) : (
                        'INITIALIZE BATCH GENERATION'
                    )}
                </Button>
            </Card>

            <Card className="p-0 overflow-hidden border-white/10 dark:border-white/5 bg-black/90">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest mono">Terminal Output</span>
                    {progress === 100 && <CheckCircle2 size={16} className="text-accent-green" />}
                </div>
                <div className="p-6 h-[400px] overflow-y-auto space-y-2 font-mono text-xs">
                    {logs.length === 0 && (
                        <span className="text-white/20">Waiting for execution command...</span>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className={cn(
                            "leading-relaxed",
                            log.includes("ERROR") || log.includes("❌") ? "text-rose-400" :
                                log.includes("✅") ? "text-accent-green" :
                                    log.includes("🎉") ? "text-accent-saffron font-bold text-sm mt-4" :
                                        "text-white/70"
                        )}>
                            {log}
                        </div>
                    ))}
                </div>
            </Card>
        </main>
    );
}
