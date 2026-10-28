import type { ElectionReportSection, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base.repository';

export type ElectionReportListFilter = {
  page: number;
  pageSize: number;
  search?: string;
  section?: ElectionReportSection;
  jurisdiction?: string;
};

export class ElectionReportRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  private where(
    filter: Omit<ElectionReportListFilter, 'page' | 'pageSize'>,
  ): Prisma.ElectionStatisticalReportWhereInput {
    const search = filter.search?.trim();
    return {
      deletedAt: null,
      ...(filter.section ? { section: filter.section } : {}),
      ...(filter.jurisdiction ? { jurisdiction: filter.jurisdiction } : {}),
      ...(search
        ? {
            OR: [
              { label: { contains: search, mode: 'insensitive' } },
              { jurisdiction: { contains: search, mode: 'insensitive' } },
              { url: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  async list(filter: ElectionReportListFilter) {
    const where = this.where(filter);
    const [total, items] = await Promise.all([
      this.db.electionStatisticalReport.count({ where }),
      this.db.electionStatisticalReport.findMany({
        where,
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
        include: {
          state: true,
          _count: { select: { files: { where: { deletedAt: null } } } },
        },
      }),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return this.db.electionStatisticalReport.findFirst({
      where: { id, deletedAt: null },
      include: {
        state: true,
        files: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: { state: true },
        },
      },
    });
  }

  listStates() {
    return this.db.electionState.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            files: { where: { deletedAt: null } },
            reports: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  async facets() {
    const [sections, jurisdictions] = await Promise.all([
      this.db.electionStatisticalReport.groupBy({
        by: ['section'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.db.electionStatisticalReport.findMany({
        where: { deletedAt: null, jurisdiction: { not: null } },
        distinct: ['jurisdiction'],
        select: { jurisdiction: true },
        orderBy: { jurisdiction: 'asc' },
      }),
    ]);
    return {
      sections: sections.map((row) => ({
        section: row.section,
        count: row._count._all,
      })),
      jurisdictions: jurisdictions
        .map((row) => row.jurisdiction)
        .filter((value): value is string => Boolean(value)),
    };
  }
}
