import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("LOG: Final Cleanup phase...");
    const all = await prisma.scheme.findMany({ include: { budgetAllocations: true } });
    let removed = 0;
    for (const scheme of all) {
        const someExp = scheme.budgetAllocations.some(b => Number(b.utilized) > 0);
        if (!someExp) {
            console.log(`LOG: Removing ${scheme.name} - No expenditure.`);
            await prisma.scheme.delete({ where: { id: scheme.id } });
            removed++;
        }
    }
    console.log(`LOG: Removed ${removed} schemes. Finalizing DB...`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
