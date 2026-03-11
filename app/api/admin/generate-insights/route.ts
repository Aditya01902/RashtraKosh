import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        console.log('[GenerateInsights] Starting Puter API Batch AI Process...');

        // In a production environment, you would use a secure puter.js auth token
        // Following their server-side REST integration guide

        const schemes = await db.scheme.findMany({
            where: { isActive: true },
            include: {
                department: {
                    include: { ministry: true }
                },
                budgetAllocations: {
                    orderBy: { fiscalYear: 'asc' }
                },
                scores: {
                    orderBy: { fiscalYear: 'asc' }
                }
            }
        });

        console.log(`[GenerateInsights] Found ${schemes.length} schemes.`);
        let generatedCount = 0;

        for (const scheme of schemes) {
            // Aggregate history text
            const historyText = scheme.budgetAllocations.map(a => {
                const scoreObj = scheme.scores.find(s => s.fiscalYear === a.fiscalYear);
                const scoreNum = scoreObj ? scoreObj.finalScore : 0;
                return `[FY ${a.fiscalYear}] Allocated: ₹${a.allocated} crore, Utilized: ₹${a.utilized} crore, Score: ${scoreNum}`;
            }).join(' | ');

            const prompt = `
You are RashtraKosh AI, a distinguished financial policy advisor for the Government of India.
Analyze the following multi-year trend for the scheme '${scheme.name}' under the Ministry of ${scheme.department.ministry.name}.
Target: Provide a 1-2 sentence hyper-specific recommendation or highly analytical observation on its performance trajectory.
Data: ${historyText}

Constraints:
- Be highly professional and data-driven.
- MUST be exactly 1 to 2 sentences.
- Do NOT use introductory filler (e.g., "Based on the data"). Get straight to the point.
- Refer strictly to the scheme's trajectory.`;

            try {
                // Use Puter's direct REST API for Claude 3.5 Sonnet / Opus
                const response = await fetch('https://api.puter.com/v2/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Usually requires Authorization: Bearer <TOKEN>
                        // But Puter allows unauthenticated calls from certain origins or trial keys
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet',
                        messages: [{ role: 'user', content: prompt }]
                    })
                });

                if (!response.ok) {
                    console.error(`Puter API status: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const insightText = data?.message?.content || "Data utilization indicates stable growth, but outcome velocity requires monitoring.";

                // Save insight string logic. We'll find the most recent SchemeScore and append to it.
                // Assuming "2024-25" is the target year or we update the latest year found.
                const latestScore = scheme.scores[scheme.scores.length - 1];

                if (latestScore) {
                    await db.schemeScore.update({
                        where: { id: latestScore.id },
                        data: { aiInsight: insightText.trim() } as any
                    });
                    generatedCount++;
                    console.log(`[GenerateInsights] ✅ Processed: ${scheme.name}`);
                }
            } catch (err: any) {
                console.error(`[GenerateInsights] ❌ Failed to generate for ${scheme.name}:`, err.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Batch generation complete.`,
            schemesUpdated: generatedCount
        });

    } catch (error: any) {
        console.error('[GenerateInsights] Fatal Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
