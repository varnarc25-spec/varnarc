import type { Prisma, PrismaClient } from '@prisma/client';

const publicSelect = {
  id: true,
  type: true,
  manufacturerId: true,
  modelId: true,
  variantId: true,
  segment: true,
  fuelType: true,
  key: true,
  value: true,
  minValue: true,
  maxValue: true,
  sourceName: true,
  sourceUrl: true,
  lastVerifiedAt: true,
  effectiveFrom: true,
  effectiveTo: true,
} satisfies Prisma.ResaleValuationConfigSelect;

export class ResaleValuationRepository {
  constructor(private readonly db: PrismaClient) {}

  listActive(now = new Date()) {
    return this.db.resaleValuationConfig.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        AND: [
          { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] },
        ],
      },
      select: publicSelect,
      orderBy: [{ type: 'asc' }, { key: 'asc' }],
    });
  }

  listAll() {
    return this.db.resaleValuationConfig.findMany({
      where: { deletedAt: null },
      orderBy: [{ type: 'asc' }, { key: 'asc' }],
    });
  }

  create(data: Prisma.ResaleValuationConfigCreateInput) {
    return this.db.resaleValuationConfig.create({ data });
  }

  update(id: string, data: Prisma.ResaleValuationConfigUpdateInput) {
    return this.db.resaleValuationConfig.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.db.resaleValuationConfig.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { id, deleted: true };
  }
}
