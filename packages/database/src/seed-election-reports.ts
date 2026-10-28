import type { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLE_DEFINITIONS } from '@varnarc/auth';
import { ELECTION_REPORT_SOURCE_URL, ELECTION_STATISTICAL_REPORTS } from '@varnarc/validation';

async function grantElectionView(prisma: PrismaClient) {
  const permission = await prisma.permission.upsert({
    where: { slug: PERMISSIONS.ELECTION_VIEW },
    update: { name: 'View election reports', module: 'elections', deletedAt: null },
    create: {
      slug: PERMISSIONS.ELECTION_VIEW,
      name: 'View election reports',
      module: 'elections',
    },
  });

  for (const [slug, definition] of Object.entries(ROLE_DEFINITIONS)) {
    if (!definition.permissions.includes(PERMISSIONS.ELECTION_VIEW)) continue;
    const role = await prisma.role.findUnique({ where: { slug } });
    if (!role) continue;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: permission.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }
}

/** Upserts the Election Commission statistical-report catalog. Existing rows are refreshed by seed key. */
export async function seedElectionReports(prisma: PrismaClient) {
  await grantElectionView(prisma);
  for (const row of ELECTION_STATISTICAL_REPORTS) {
    await prisma.electionStatisticalReport.upsert({
      where: { seedKey: row.seedKey },
      update: {
        section: row.section,
        jurisdiction: row.jurisdiction,
        label: row.label,
        url: row.url,
        sortOrder: row.sortOrder,
        sourceUrl: ELECTION_REPORT_SOURCE_URL,
        deletedAt: null,
      },
      create: {
        seedKey: row.seedKey,
        section: row.section,
        jurisdiction: row.jurisdiction,
        label: row.label,
        url: row.url,
        sortOrder: row.sortOrder,
        sourceUrl: ELECTION_REPORT_SOURCE_URL,
      },
    });
  }
  return ELECTION_STATISTICAL_REPORTS.length;
}
