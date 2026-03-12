import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const scoresWithInsights = await prisma.schemeScore.findMany({
        where: {
            AND: [
                { aiInsight: { not: null } },
                { aiInsight: { not: "" } }
            ]
        },
        select: {
            schemeId: true,
            fiscalYear: true,
            aiInsight: true
        }
    });

    console.log(`Total scores with insights: ${scoresWithInsights.length}`);
    if (scoresWithInsights.length > 0) {
        console.log('Sample insight:', scoresWithInsights[0]);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
