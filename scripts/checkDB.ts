// @ts-nocheck
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

async function main() {
    const schemes = await prisma.scheme.findMany({
        where: {
            name: { in: ["MGNREGA", "Ayushman Bharat PM-JAY", "National Infrastructure Fund", "PM POSHAN", "PM Gati Shakti", "Sovereign Green Bonds"] }
        },
        include: {
            budgetAllocations: true
        }
    });
    console.log(JSON.stringify(schemes, null, 2));
}

main().finally(() => prisma.$disconnect());
