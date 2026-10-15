import { PrismaClient } from '@prisma/client';
import { seedDocuments } from './seed-documents';

const prisma = new PrismaClient();

async function main() {
  await seedDocuments(prisma);
  const published = await prisma.documentTemplate.count({
    where: { status: 'PUBLISHED', deletedAt: null },
  });
  const review = await prisma.documentTemplate.count({
    where: { status: 'REVIEW_REQUIRED', deletedAt: null },
  });
  console.warn(`Document seed complete. Published: ${published}. Review required: ${review}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
