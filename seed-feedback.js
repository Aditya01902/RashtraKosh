require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding feedback items...");

    // Get an expert user and general user, or create them
    let expert = await prisma.user.findFirst({ where: { role: 'EXPERT_MEMBER' } });
    if (!expert) {
        expert = await prisma.user.create({
            data: {
                name: "Prof. Sunita Desai",
                email: "sunita.desai@iima.ac.in",
                role: 'EXPERT_MEMBER',
                membershipTier: 'EXPERT'
            }
        });
    }

    let general = await prisma.user.findFirst({ where: { role: 'GENERAL_MEMBER' } });
    if (!general) {
        general = await prisma.user.create({
            data: {
                name: "Arjun Patel",
                email: "arjun.patel@gmail.com",
                role: 'GENERAL_MEMBER',
                membershipTier: 'GENERAL'
            }
        });
    }

    // Get a scheme
    const scheme = await prisma.scheme.findFirst();

    // Add feedback items
    await prisma.feedbackItem.create({
        data: {
            title: "Excellent transparency in the new highway projects",
            body: "The recent updates to the highway development data have been extremely useful. I appreciate the detailed breakdown of capital vs revenue expenditure.",
            category: "SCHEME_PERFORMANCE",
            schemeId: scheme ? scheme.id : null,
            authorId: expert.id,
            status: "NEW",
            weightedScore: 2.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Suggest reallocating unused funds to rural healthcare",
            body: "Looking at the Q3 expenditure, there seems to be a significant amount of surrendered funds in urban infrastructure. This could be reallocated to rural health centers.",
            category: "REALLOCATION_SUGGESTION",
            authorId: expert.id,
            status: "UNDER_REVIEW",
            weightedScore: 3.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Data anomaly in quarter 2 spending",
            body: "The Q2 spending for this scheme appears to jump by 400% without corresponding output metrics. Can we have an investigation into this anomaly?",
            category: "ANOMALY_FLAG",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "NEW",
            weightedScore: 1.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Policy suggestion: integrate local vendors",
            body: "The scheme would perform much better if local vendors were integrated into the supply chain. This would increase rural income directly.",
            category: "POLICY_SUGGESTION",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "INCORPORATED",
            weightedScore: 2.5,
        }
    });
    
    await prisma.feedbackItem.create({
        data: {
            title: "Excellent progress on PM-Kisan data integration",
            body: "The real-time synchronization with state-level land records has significantly reduced the delay in direct benefit transfers. This is a huge win for transparency.",
            category: "SCHEME_PERFORMANCE",
            schemeId: scheme ? scheme.id : null,
            authorId: expert.id,
            status: "INCORPORATED",
            weightedScore: 2.5,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Potential overlap in skill development schemes",
            body: "I've noticed that both the Ministry of Skill Development and the Ministry of Electronics have overlapping funding for 'Digital Literacy' in rural blocks. We should consolidate these to avoid duplication.",
            category: "REALLOCATION_SUGGESTION",
            schemeId: scheme ? scheme.id : null,
            authorId: expert.id,
            status: "NEW",
            weightedScore: 3.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Missing GPS coordinates for 15% of PMAY-G houses",
            body: "While the financial data for Pradhan Mantri Awas Yojana (Gramin) is complete, about 15% of the entries in the eastern sector lack GPS-tagged photos and coordinates. This needs to be flagged for data quality.",
            category: "DATA_QUALITY",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "UNDER_REVIEW",
            weightedScore: 1.5,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Suggestion: Dynamic dashboard for localized budget tracking",
            body: "Citizens would benefit greatly if they could see the budget utilization of specifically their district or block rather than just state-level aggregates.",
            category: "POLICY_SUGGESTION",
            schemeId: scheme ? scheme.id : null,
            authorId: general.id,
            status: "NEW",
            weightedScore: 2.0,
        }
    });

    console.log("Feedback items seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
