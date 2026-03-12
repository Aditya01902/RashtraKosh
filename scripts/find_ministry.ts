import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const scheme = await prisma.scheme.findFirst({
        where: { name: { contains: 'Kisan' } },
        include: {
            department: {
                include: { ministry: true }
            }
        }
    });

    if (scheme) {
        console.log(`Scheme: ${scheme.name}`);
        console.log(`Ministry ID: ${scheme.department.ministry.id}`);
    } else {
        console.log('Scheme not found');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
