import type { Prisma, PrismaClient, PublishStatus, SolarReferenceKind } from '@prisma/client';
import { BaseRepository, softDeleteById } from '../base.repository';

export class SolarReferenceRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  list(kind?: SolarReferenceKind) {
    return this.db.solarReference.findMany({
      where: { deletedAt: null, ...(kind ? { kind } : {}) },
      orderBy: [{ kind: 'asc' }, { state: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  listPublished() {
    return this.db.solarReference.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      orderBy: [{ kind: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  findById(id: string) {
    return this.db.solarReference.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.SolarReferenceCreateInput) {
    return this.db.solarReference.create({ data });
  }

  update(id: string, data: Prisma.SolarReferenceUpdateInput) {
    return this.db.solarReference.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return softDeleteById(this.db.solarReference, id);
  }
}

export type { PublishStatus };
