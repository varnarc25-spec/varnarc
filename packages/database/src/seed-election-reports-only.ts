import { PrismaClient } from '@prisma/client';
import { seedElectionReports } from './seed-election-reports';

const prisma = new PrismaClient();

async function main() {
  const count = await seedElectionReports(prisma);
  const stored = await prisma.electionStatisticalReport.count({ where: { deletedAt: null } });
  console.warn(`Election report seed complete. Catalog rows: ${count}. Stored rows: ${stored}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
