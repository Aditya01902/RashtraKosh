import { db } from "@/lib/db";

export async function buildContextForAdvisor(query: string) {
    // Simple keyword matching against scheme names for DB context
    const schemes = await db.scheme.findMany({
        take: 5,
        include: {
            scores: {
                where: { fiscalYear: '2024-25' },
                take: 1
            },
            department: { include: { ministry: true } }
        }
    });

    let contextString = "Context:\n";
    for (const s of schemes) {
        const score = s.scores[0]?.finalScore || "N/A";
        contextString += `- Scheme: ${s.name} (Ministry: ${s.department.ministry.name}), final score: ${score}\n`;
    }

    return `
You are the RashtraKosh AI Policy Advisor. Using the provided context, answer the user's query clearly and concisely.

${contextString}

User Query: ${query}
`;
}
