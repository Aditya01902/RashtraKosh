import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ministries = await prisma.ministry.findMany({
    include: {
      departments: {
        include: { schemes: true }
      }
    }
  });
  let emptyCount = 0;
  for (const m of ministries) {
    const hasScheme = m.departments.some(d => d.schemes.length > 0);
    if (!hasScheme) emptyCount++;
  }
  console.log(`Remaining empty ministries: ${emptyCount}`);
}
main().finally(() => prisma.$disconnect());
