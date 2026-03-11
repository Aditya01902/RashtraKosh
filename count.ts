import { PrismaClient } from './generated/prisma/index.js';
const p = new PrismaClient();
async function main() {
    const min = await p.ministry.count();
    const dep = await p.department.count();
    const sch = await p.scheme.count();
    const ba = await p.budgetAllocation.count();
    const byYear = await p.budgetAllocation.groupBy({
        by: ['fiscalYear'],
        _count: { fiscalYear: true }
    });
    console.log(`Ministries: ${min}, Departments: ${dep}, Schemes: ${sch}, Allocations: ${ba}`);
    console.log(byYear);
}
main().finally(() => p.$disconnect());
