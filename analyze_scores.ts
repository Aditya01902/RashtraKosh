import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const totalSchemes = await prisma.scheme.count();
    const zeroScoreSchemes = await prisma.scheme.count({
        where: {
            scores: {
                some: {
                    finalScore: 0
                }
            }
        }
    });

    const noScoreSchemes = await prisma.scheme.count({
        where: {
            scores: {
                none: {}
            }
        }
    });

    console.log({
        totalSchemes,
        zeroScoreSchemes,
        noScoreSchemes
    });

    const totalMinistries = await prisma.ministry.count();
    console.log({ totalMinistries });
}

main().catch(console.error).finally(() => prisma.$disconnect());
