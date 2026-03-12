
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for National Health Mission (NHM) in the database...");

    const schemes = await prisma.scheme.findMany({
        where: {
            name: {
                contains: "National Health Mission",
                mode: 'insensitive'
            }
        },
        include: {
            budgetAllocations: {
                where: {
                    fiscalYear: {
                        in: ["2023-24", "2024-25"]
                    }
                }
            }
        }
    });

    if (schemes.length === 0) {
        console.log("No scheme found with 'National Health Mission'. Searching for 'NHM'...");
        const nhmSchemes = await prisma.scheme.findMany({
            where: {
                name: {
                    contains: "NHM",
                    mode: 'insensitive'
                }
            },
            include: {
                budgetAllocations: {
                    where: {
                        fiscalYear: {
                            in: ["2023-24", "2024-25"]
                        }
                    }
                }
            }
        });
        console.log(JSON.stringify(nhmSchemes, null, 2));
    } else {
        console.log(JSON.stringify(schemes, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
