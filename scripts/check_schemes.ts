import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const s = await p.scheme.findMany({ select: { name: true } });
    console.log(s.map(x => x.name));

    // Also check if departments for Health, Rural Dev, Education exist:
    const d = await p.department.findMany({ select: { name: true, id: true, ministryId: true } });
    console.log("Departments:", d);
}
main().finally(() => p.$disconnect());
