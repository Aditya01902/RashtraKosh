import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const schemes = await prisma.scheme.findMany({
        select: { id: true, name: true, departmentId: true }
    });

    console.log(`LOG: Total Schemes: ${schemes.length}`);

    const schemeMap: Record<string, string[]> = {};
    schemes.forEach(s => {
        const key = s.name.toLowerCase().trim();
        if (!schemeMap[key]) schemeMap[key] = [];
        schemeMap[key].push(s.id);
    });

    const duplicates = Object.entries(schemeMap).filter(([_, ids]) => ids.length > 1);
    console.log(`LOG: Direct duplicates found: ${duplicates.length}`);
    console.log(JSON.stringify(duplicates.slice(0, 5).map(([name, ids]) => ({ name, count: ids.length })), null, 2));

    // Fuzzy matching would be better
}

main().catch(console.error).finally(() => prisma.$disconnect());
