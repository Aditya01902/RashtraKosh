import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const list = await prisma.ministry.findMany({
        include: {
            _count: {
                select: { budgetAllocations: true }
            }
        }
    });

    const emptyMinistries = list.filter(m => m._count.budgetAllocations === 0);
    console.log("LOG: Ministries with 0 budgets:", JSON.stringify(emptyMinistries.map(m => m.name), null, 2));

    const totalMinistries = list.length;
    console.log(`LOG: Stats: ${emptyMinistries.length} out of ${totalMinistries} are empty.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
