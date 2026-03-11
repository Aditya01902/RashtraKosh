import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

async function main() {
    const res = await fetch("http://localhost:3001/api/ingest");
    const allocations = await res.json();

    for (const alloc of allocations) {
        const scheme = await prisma.scheme.findFirst({
            where: { name: alloc.scheme_name_mapped }
        });

        if (scheme) {
            await prisma.budgetAllocation.updateMany({
                where: { schemeId: scheme.id, fiscalYear: "2024-25" },
                data: {
                    allocated: alloc.BE,
                    allocatedCapital: alloc.Capital,
                    allocatedRevenue: alloc.Revenue,
                    revisedEstimate: alloc.RE,
                    utilized: alloc.Actuals,
                    anomalyFlag: alloc.anomaly_flag
                }
            });
            console.log(`✅ Updated ${alloc.scheme_name_mapped}`);
        }
    }
}

main().finally(() => prisma.$disconnect());
