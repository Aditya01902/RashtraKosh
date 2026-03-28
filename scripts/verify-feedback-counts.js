require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const totalFeedback = await prisma.feedbackItem.count();
    console.log(`Total feedback items in database: ${totalFeedback}`);

    const feedbackItems = await prisma.feedbackItem.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            title: true,
            category: true,
            status: true
        }
    });

    console.log("Latest 5 feedback items:");
    console.table(feedbackItems);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
