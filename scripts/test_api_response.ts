import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const scheme = await prisma.scheme.findFirst({
        where: { name: { contains: 'Ayushman Bharat PM-JAY' } }
    });

    if (!scheme) {
        console.log('Scheme not found');
        return;
    }

    const url = `http://localhost:3000/api/schemes/${scheme.id}?fy=2024-25`;
    console.log(`Fetching: ${url}`);

    const res = await fetch(url);
    const data = await res.json();

    console.log('API Score Object:', JSON.stringify(data.score, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
