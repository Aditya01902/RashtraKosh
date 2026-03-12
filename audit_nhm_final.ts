import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Auditing National Health Mission (NHM) Data...");
    const schemes = await prisma.scheme.findMany({
        where: {
            name: {
                contains: "National Health Mission",
                mode: 'insensitive'
            }
        },
        include: {
            budgetAllocations: true,
            department: {
                include: {
                    ministry: true
                }
            }
        }
    });

    console.log("--- SCHEME AUDIT RESULTS ---");
    console.log(JSON.stringify(schemes, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
