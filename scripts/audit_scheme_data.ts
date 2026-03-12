import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const scheme = await prisma.scheme.findFirst({
        where: { name: { contains: 'Ayushman Bharat PM-JAY' } },
        include: {
            scores: true
        }
    });

    if (!scheme) {
        console.log('Scheme not found');
        return;
    }

    console.log(`Scheme: ${scheme.name} (${scheme.id})`);
    console.log('Scores found:', scheme.scores.length);
    scheme.scores.forEach(s => {
        console.log(`- FY: ${s.fiscalYear}, HAS_INSIGHT: ${!!s.aiInsight}, INSIGHT_LEN: ${s.aiInsight?.length || 0}`);
        if (s.aiInsight) console.log(`  CONTENT: "${s.aiInsight}"`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
