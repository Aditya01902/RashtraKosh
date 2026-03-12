import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING NHM BUDGET DATA CORRECTION ---');

    // Find the National Health Mission scheme
    const scheme = await prisma.scheme.findFirst({
        where: {
            name: {
                contains: 'National Health Mission',
                mode: 'insensitive',
            },
        },
    });

    if (!scheme) {
        console.error('CRITICAL: National Health Mission scheme not found in database.');
        return;
    }

    console.log(`Found Scheme: ${scheme.name} (ID: ${scheme.id})`);

    // 1. Fix FY 2023-24
    console.log('Updating FY 2023-24 Budget Allocation...');
    const fix2324 = await prisma.budgetAllocation.upsert({
        where: {
            schemeId_fiscalYear: {
                schemeId: scheme.id,
                fiscalYear: '2023-24',
            },
        },
        update: {
            allocated: 29085.00,
            allocatedCapital: 10180.00,
            allocatedRevenue: 18905.00,
            anomalyFlag: false,
        },
        create: {
            schemeId: scheme.id,
            fiscalYear: '2023-24',
            ministryId: 'cmmm7lftl00aev7hcivuzaagl',
            allocated: 29085.00,
            allocatedCapital: 10180.00,
            allocatedRevenue: 18905.00,
            utilized: 21384.00,
            utilizedCapital: 7484.40,
            utilizedRevenue: 13899.60,
            expenditureQ1: 4276.80,
            expenditureQ2: 5346.00,
            expenditureQ3: 5987.52,
            expenditureQ4: 5773.68,
            surrendered: 712.80,
            anomalyFlag: false,
        },
    });
    console.log('✓ FY 2023-24 Update Complete');

    // 2. Update FY 2024-25
    console.log('Updating FY 2024-25 Budget Allocation...');
    const fix2425 = await prisma.budgetAllocation.upsert({
        where: {
            schemeId_fiscalYear: {
                schemeId: scheme.id,
                fiscalYear: '2024-25',
            },
        },
        update: {
            allocated: 36000.00,
            allocatedCapital: 12600.00,
            allocatedRevenue: 23400.00,
            anomalyFlag: false,
        },
        create: {
            schemeId: scheme.id,
            fiscalYear: '2024-25',
            ministryId: 'cmmm7lftl00aev7hcivuzaagl',
            allocated: 36000.00,
            allocatedCapital: 12600.00,
            allocatedRevenue: 23400.00,
            utilized: 0,
            utilizedCapital: 0,
            utilizedRevenue: 0,
            expenditureQ1: 0,
            expenditureQ2: 0,
            expenditureQ3: 0,
            expenditureQ4: 0,
            surrendered: 0,
            anomalyFlag: false,
        },
    });
    console.log('✓ FY 2024-25 Update Complete');

    console.log('--- NHM BUDGET DATA CORRECTION FINISHED ---');
}

main()
    .catch((e) => {
        console.error('Error during NHM data correction:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
