import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching ministries...');
  const ministries = await prisma.ministry.findMany({
    include: {
      departments: {
        include: {
          schemes: true
        }
      }
    }
  });

  let deletedCount = 0;
  for (const ministry of ministries) {
    let hasScheme = false;
    for (const dept of ministry.departments) {
      if (dept.schemes && dept.schemes.length > 0) {
        hasScheme = true;
        break;
      }
    }

    if (!hasScheme) {
      console.log(`Deleting Ministry: ${ministry.name} (ID: ${ministry.id}) - No schemes found.`);
      await prisma.ministry.delete({
        where: { id: ministry.id }
      });
      deletedCount++;
    }
  }

  console.log(`Successfully deleted ${deletedCount} ministries without schemes.`);
}

main()
  .catch(e => {
    console.error('Error occurred:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
