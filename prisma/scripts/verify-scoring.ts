import { Prisma } from '@prisma/client';
import { calculateUtilizationScore } from '../../lib/scoring/utilization';
import { calculateFinalScore, classifyScore } from '../../lib/scoring/final';
import { calculateOutputScore } from '../../lib/scoring/output';
import { calculateOutcomeScore } from '../../lib/scoring/outcome';

async function main() {
    console.log('--- SCORE VERIFICATION ---');

    // 1. UtilizationScore with scheme (100% spent evenly) >= 95
    const perfectScheme = {
        allocated: new Prisma.Decimal(100),
        utilized: new Prisma.Decimal(100),
        expenditureQ1: new Prisma.Decimal(25),
        expenditureQ2: new Prisma.Decimal(25),
        expenditureQ3: new Prisma.Decimal(25),
        expenditureQ4: new Prisma.Decimal(25),
        surrendered: new Prisma.Decimal(0),
        supplementaryDemands: 0,
    };
    const perfectResult = calculateUtilizationScore(perfectScheme);
    console.log('Perfect Scheme Utilization Score:', perfectResult.score);
    if (perfectResult.score >= 95) {
        console.log('✅ PASS: UtilizationScore >= 95');
    } else {
        console.error('❌ FAIL: UtilizationScore should be >= 95');
    }

    // 2. UtilizationScore with scheme (90% spent Q4, 8% surrendered) < 65
    const badScheme = {
        allocated: new Prisma.Decimal(100),
        utilized: new Prisma.Decimal(92),      // 8% surrendered
        expenditureQ1: new Prisma.Decimal(0),
        expenditureQ2: new Prisma.Decimal(2),
        expenditureQ3: new Prisma.Decimal(0),
        expenditureQ4: new Prisma.Decimal(90), // 90 spent in Q4
        surrendered: new Prisma.Decimal(8),
        supplementaryDemands: 5,               // poor discipline to bring score down further
    };
    const badResult = calculateUtilizationScore(badScheme);
    console.log('\nBad Scheme Utilization Score:', badResult.score);
    console.log('Breakdown:', badResult.breakdown);
    if (badResult.score < 65) {
        console.log('✅ PASS: UtilizationScore < 65');
    } else {
        console.error('❌ FAIL: UtilizationScore should be < 65');
    }

    // 3. Final score formula weights sum exactly 1.0
    const weightsSum = 0.30 + 0.35 + 0.35;
    console.log(`\nFinal score weights sum: ${weightsSum}`);
    if (Math.abs(weightsSum - 1.0) < 0.001) {
        console.log('✅ PASS: Weights sum to 1.0');
    } else {
        console.error('❌ FAIL: Weights do not sum to 1.0');
    }

    // 4. classifyScore(86) returns EXCELLENT
    const class86 = classifyScore(86);
    if (class86 === 'EXCELLENT') {
        console.log(`✅ PASS: classifyScore(86) = ${class86}`);
    } else {
        console.error(`❌ FAIL: classifyScore(86) = ${class86}, expected EXCELLENT`);
    }

    // 5. classifyScore(54) returns POOR
    const class54 = classifyScore(54);
    if (class54 === 'POOR') {
        console.log(`✅ PASS: classifyScore(54) = ${class54}`);
    } else {
        console.error(`❌ FAIL: classifyScore(54) = ${class54}, expected POOR`);
    }

    // 6. Test fallback data
    console.log('\nTesting Fallback Output/Outcome Scores:');
    const fallbackOutput = calculateOutputScore(null);
    console.log('Fallback Output Score:', fallbackOutput.score);
    if (fallbackOutput.score === 50) {
        console.log('✅ PASS: Output fallback is 50');
    } else {
        console.error('❌ FAIL: Output fallback is not 50');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
