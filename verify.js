const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const count = await prisma.feedbackItem.count();
        console.log(`FEEDBACK_COUNT=${count}`);
        const lastItems = await prisma.feedbackItem.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: { title: true }
        });
        console.log("LAST_ENTRIES=" + JSON.stringify(lastItems));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
