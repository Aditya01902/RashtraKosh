import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const s = await prisma.scheme.count();
    const m = await prisma.ministry.count();
    const a = await prisma.budgetAllocation.count();
    const y = await prisma.budgetAllocation.groupBy({ by: ['fiscalYear'], _count: { fiscalYear: true } });
    console.log(JSON.stringify({ schemes: s, ministries: m, allocations: a, years: y }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
