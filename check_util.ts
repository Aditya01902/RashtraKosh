import { PrismaClient } from './generated/prisma/index.js';

const p = new PrismaClient();

async function main() {
    console.log("Checking for missing utilisation values...");
    const allocations = await p.budgetAllocation.findMany({
        where: {
            utilized: 0
        },
        include: {
            scheme: {
                select: { name: true }
            }
        }
    });

    if (allocations.length === 0) {
        console.log("No allocations found with utilized = 0.");
    } else {
        console.log(`Found ${allocations.length} allocations with utilized = 0:`);
        allocations.forEach(a => {
            console.log(`- ${a.fiscalYear} | ${a.scheme.name} (BE: ${a.allocated}, RE: ${a.revisedEstimate})`);
        });
    }

    const aiOutputFiles = await p.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1
    });

    if (aiOutputFiles.length > 0) {
        console.log("\nLast Audit Log Content snippet:");
        console.log(aiOutputFiles[0].content.substring(0, 1000) + "...");
    }
}

main().finally(() => p.$disconnect());
