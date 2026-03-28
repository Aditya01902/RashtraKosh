require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding additional feedback items...");

    // Get an expert user and general user
    const expert = await prisma.user.findFirst({ where: { role: 'EXPERT_MEMBER' } });
    const general = await prisma.user.findFirst({ where: { role: 'GENERAL_MEMBER' } });

    if (!expert || !general) {
        console.error("Could not find expert or general user. Please run seed-feedback.js first.");
        return;
    }

    // Get a scheme
    const scheme = await prisma.scheme.findFirst();

    // Add additional feedback items
    await prisma.feedbackItem.create({
        data: {
            title: "Inconsistent beneficiary counts in Bihar cluster",
            body: "The reported number of beneficiaries for the recent health camps in the Bihar cluster seems to be inflated compared to the ground reports we received from local NGOs. Needs verification.",
            category: "DATA_QUALITY",
            schemeId: scheme ? scheme.id : null,
            authorId: expert.id,
            status: "NEW",
            weightedScore: 2.5,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Suspicious spike in Jal Jeevan Mission equipment procurement",
            body: "There is an unusual 300% spike in the procurement of water testing kits in Q4 without a corresponding increase in the target coverage area. This data point seems anomalous.",
            category: "ANOMALY_FLAG",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "UNDER_REVIEW",
            weightedScore: 2.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Shift underutilized MSME grants to startup incubation hubs",
            body: "Given the low utilization of the traditional MSME modernization grants in the current fiscal year, I suggest reallocating a portion of these funds to the tier-2 city startup incubation hubs which are currently cash-strapped.",
            category: "REALLOCATION_SUGGESTION",
            schemeId: scheme ? scheme.id : null,
            authorId: expert.id,
            status: "NEW",
            weightedScore: 3.5,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "PMGSY Roads in hilly terrains showing 95% durability",
            body: "The new materials used for the Pradhan Mantri Gram Sadak Yojana (PMGSY) in the northern hilly terrains are showing excellent results. Post-monsoon surveys indicate a 95% durability rate compared to 60% previously. Great performance.",
            category: "SCHEME_PERFORMANCE",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "INCORPORATED",
            weightedScore: 3.0,
        }
    });

    console.log("Additional feedback items seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
