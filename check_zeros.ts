import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const list = await prisma.budgetAllocation.findMany({
        where: { 
            OR: [
                { allocated: 0 },
                { utilized: 0 }
            ]
        },
        take: 20,
        include: {
            scheme: {
                include: {
                    department: {
                        include: { ministry: true }
                    }
                }
            }
        }
    });

    console.log("LOG: Zeros found:", JSON.stringify(list.map(b => ({
        ministry: b.scheme?.department?.ministry?.name,
        scheme: b.scheme?.name,
        year: b.fiscalYear,
        allocated: b.allocated.toString(),
        utilized: b.utilized.toString()
    })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
