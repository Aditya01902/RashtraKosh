import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Normalizing years...");
    const budgets = await prisma.budgetAllocation.findMany({
        where: { fiscalYear: { contains: "2024-2025" } }
    });
    console.log(`Found ${budgets.length} records with 2024-2025`);
    
    for (const b of budgets) {
        try {
            // Check if 2024-25 exists for this scheme
            const target = await prisma.budgetAllocation.findUnique({
                where: { schemeId_fiscalYear: { schemeId: b.schemeId || "", fiscalYear: "2024-25" } }
            });

            if (target) {
                // Update target if it's 0 or similar
                await prisma.budgetAllocation.update({
                    where: { id: target.id },
                    data: {
                        allocated: b.allocated,
                        revisedEstimate: b.revisedEstimate,
                        utilized: b.utilized,
                        allocatedCapital: b.allocatedCapital,
                        allocatedRevenue: b.allocatedRevenue
                    }
                });
                await prisma.budgetAllocation.delete({ where: { id: b.id } });
            } else {
                await prisma.budgetAllocation.update({
                    where: { id: b.id },
                    data: { fiscalYear: "2024-25" }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
    console.log("Cleanup done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
