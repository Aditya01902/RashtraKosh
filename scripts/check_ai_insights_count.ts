import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const totalScores = await prisma.schemeScore.count();
    const scoresWithInsights = await prisma.schemeScore.count({
        where: {
            aiInsight: {
                not: null,
                notIn: ['']
            }
        }
    });

    console.log(`Total Scheme Scores: ${totalScores}`);
    console.log(`Scores with AI Insights: ${scoresWithInsights}`);
    console.log(`Progress: ${((scoresWithInsights / totalScores) * 100).toFixed(2)}%`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
