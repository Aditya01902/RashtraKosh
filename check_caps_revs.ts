import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const total = await prisma.budgetAllocation.count();
    const zeroCap = await prisma.budgetAllocation.count({ where: { allocatedCapital: 0 } });
    const zeroRev = await prisma.budgetAllocation.count({ where: { allocatedRevenue: 0 } });
    console.log("LOG: Splits Status:", JSON.stringify({ 
        total, 
        zeroCap, 
        zeroRev, 
        percentMissingCap: (zeroCap/total * 100).toFixed(1) + "%",
        percentMissingRev: (zeroRev/total * 100).toFixed(1) + "%"
    }, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
