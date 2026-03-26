import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const stats = await prisma.budgetAllocation.groupBy({
        by: ['fiscalYear'],
        _count: { _all: true }
    });
    console.log("LOG: Distribution:", JSON.stringify(stats, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
