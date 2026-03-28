require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const feedbackCount = await prisma.feedbackItem.count();
    console.log(`Total feedback items: ${feedbackCount}`);
    
    const latestItems = await prisma.feedbackItem.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { title: true, category: true, status: true }
    });
    
    console.log("Latest items:");
    latestItems.forEach((item, i) => {
        console.log(`${i+1}. ${item.title} | ${item.category} | ${item.status}`);
    });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
