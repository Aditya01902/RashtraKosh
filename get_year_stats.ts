import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const yearsOverview = await prisma.budgetAllocation.groupBy({
        by: ['fiscalYear'],
        _count: { _all: true }
    });
    console.log("YEARS_STATS:", JSON.stringify(yearsOverview, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
