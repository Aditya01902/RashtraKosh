import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
    const scoresWithInsights = await prisma.schemeScore.findMany({
        where: {
            aiInsight: { not: null, not: "" }
        },
        include: {
            scheme: true
        },
        orderBy: {
            scheme: {
                name: 'asc'
            }
        }
    });

    console.log(`\n--- Schemes with AI Insights (${scoresWithInsights.length} total) ---\n`);
    scoresWithInsights.forEach((s, i) => {
        console.log(`${i + 1}. ${s.scheme.name} (FY ${s.fiscalYear})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
