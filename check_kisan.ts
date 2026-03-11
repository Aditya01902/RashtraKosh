import { PrismaClient } from './generated/prisma/index.js';
const p = new PrismaClient();
async function main() {
    const result = await p.schemeScore.findFirst({
        where: { scheme: { name: { contains: 'Kisan' } }, fiscalYear: '2024-25' }
    });
    console.log(JSON.stringify(result, null, 2));
}
main().finally(() => p.$disconnect());
