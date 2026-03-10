import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { puter } from '@heyputer/puter.js';

// Set up basic in-memory rate limit: 20 queries per hour per admin
const rateLimits = new Map<string, { count: number, resetAt: number }>();
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

export const maxDuration = 60; // Allow 60s for AI to respond

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'MINISTRY_ADMIN')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const adminId = session.user.id!;
        const now = Date.now();

        // Check rate limit
        let rl = rateLimits.get(adminId);
        if (!rl || rl.resetAt < now) {
            rl = { count: 0, resetAt: now + WINDOW_MS };
            rateLimits.set(adminId, rl);
        }
        if (rl.count >= LIMIT) {
            return new NextResponse('Rate limit exceeded', { status: 429 });
        }
        rl.count++;

        const { query, context } = await req.json();

        if (!query) {
            return new NextResponse('Missing query', { status: 400 });
        }

        // Build context
        let contextDb = '';
        if (context?.schemeId) {
            const scheme = await db.scheme.findUnique({
                where: { id: context.schemeId },
                include: { scores: { orderBy: { fiscalYear: 'desc' }, take: 1 } }
            });
            if (scheme) {
                contextDb += `Focus Scheme: ${scheme.name} (ID: ${scheme.id})\n`;
                const score = scheme.scores[0];
                if (score) {
                    contextDb += `Latest Final Score: ${Number(score.finalScore)}\nOutput Score: ${Number(score.outputScore)}\nOutcome Score: ${Number(score.outcomeScore)}\nUtilization Score: ${Number(score.utilizationScore)}\n`;
                }
            }
        }

        if (context?.ministryId) {
            const ministry = await db.ministry.findUnique({
                where: { id: context.ministryId },
                include: { departments: { include: { schemes: { include: { scores: { orderBy: { fiscalYear: 'desc' }, take: 1 } } } } } }
            });
            if (ministry) {
                contextDb += `Focus Ministry: ${ministry.name}\n`;
                // Top performer in this ministry
                const allSchemes: { name: string; score: number }[] = [];
                ministry.departments.forEach(d => {
                    d.schemes.forEach(s => {
                        if (s.scores[0]) allSchemes.push({ name: s.name, score: Number(s.scores[0].finalScore) });
                    });
                });
                allSchemes.sort((a, b) => b.score - a.score);
                if (allSchemes.length > 0) {
                    contextDb += `Top Performer: ${allSchemes[0].name} (${allSchemes[0].score})\n`;
                    contextDb += `Bottom Performer: ${allSchemes[allSchemes.length - 1].name} (${allSchemes[allSchemes.length - 1].score})\n`;
                }
            }
        }

        const systemPrompt = `You are RashtraKosh AI, a government scheme analysis assistant. You have access to real-time evaluation data.
Provide concise, data-driven responses based on the provided context. If no context answers the question, state that you don't have enough data.
${contextDb ? `\nContext:\n${contextDb}` : ''}`;

        const fullPrompt = systemPrompt + "\n\nUser Query: " + query;

        // Use Puter.js Claude API with the requested model claude-opus-4-6
        const puterResponse = await puter.ai.chat(fullPrompt, { model: 'claude-opus-4-6', stream: true });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    for await (const part of puterResponse as any) {
                        if (part?.text) {
                            // To be compatible with AI SDK stream format if needed, we can just send raw text. 
                            // The problem states: "Stream the response back using ReadableStream"
                            // Sending raw text chunks:
                            controller.enqueue(encoder.encode(part.text));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache, no-transform'
            }
        });
    } catch (error) {
        console.error('[AI_QUERY_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
