import type { Prisma, PrismaClient, PublishStatus } from '@prisma/client';
import { BaseRepository, listActiveWithCursor, softDeleteById } from '../base.repository';
import type { CursorPageParams } from '../../pagination';

type ListParams = CursorPageParams & {
  status?: PublishStatus;
  search?: string;
  featured?: boolean;
  manufacturerId?: string;
  manufacturerSlug?: string;
  model?: string;
  category?: string;
  fuelType?: string;
  bodyType?: string;
  transmission?: string;
  minSeats?: number;
  maxSeats?: number;
  maxPrice?: number;
  minPrice?: number;
  minMileage?: number;
  minSafety?: number;
  minGroundClearance?: number;
  minEngineCc?: number;
  maxEngineCc?: number;
  modelYear?: number;
  modelYearFrom?: number;
  modelYearTo?: number;
  launchMode?: 'current' | 'upcoming' | 'launches';
  availableInIndia?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'mileage' | 'newest';
  page?: number;
};

export function automobileVehicleWhere(params: ListParams): Prisma.AutomobileVehicleWhereInput {
  const now = new Date().getFullYear();
  const and: Prisma.AutomobileVehicleWhereInput[] = [];
  if (params.status) and.push({ status: params.status });
  if (params.manufacturerId) and.push({ manufacturerId: params.manufacturerId });
  if (params.manufacturerSlug) {
    and.push({ manufacturer: { slug: params.manufacturerSlug, deletedAt: null } });
  }
  if (params.model) {
    and.push({ model: { equals: params.model, mode: 'insensitive' } });
  }
  if (params.category) and.push({ category: { equals: params.category, mode: 'insensitive' } });
  if (params.fuelType) {
    and.push({
      OR: [
        { fuelType: { contains: params.fuelType, mode: 'insensitive' } },
        { category: { contains: params.fuelType, mode: 'insensitive' } },
      ],
    });
  }
  if (params.bodyType) {
    const parts = params.bodyType
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    and.push({
      OR: parts.flatMap((part) => [
        { bodyType: { contains: part, mode: 'insensitive' as const } },
        { category: { contains: part, mode: 'insensitive' as const } },
      ]),
    });
  }
  if (params.transmission) {
    const t = params.transmission.toLowerCase();
    if (t === 'automatic') {
      and.push({
        OR: [
          { transmission: { contains: 'auto', mode: 'insensitive' } },
          { transmission: { contains: 'amt', mode: 'insensitive' } },
          { transmission: { contains: 'cvt', mode: 'insensitive' } },
          { transmission: { contains: 'dct', mode: 'insensitive' } },
        ],
      });
    } else {
      and.push({ transmission: { contains: params.transmission, mode: 'insensitive' } });
    }
  }
  if (params.minSeats != null) and.push({ seatingCapacity: { gte: params.minSeats } });
  if (params.maxSeats != null) and.push({ seatingCapacity: { lte: params.maxSeats } });
  if (params.maxPrice != null) and.push({ exShowroomPrice: { lte: params.maxPrice, gt: 0 } });
  if (params.minPrice != null) and.push({ exShowroomPrice: { gte: params.minPrice } });
  if (params.minMileage != null) and.push({ mileage: { gt: 0 } });
  if (params.minSafety != null) and.push({ safetyRating: { gte: params.minSafety } });
  if (params.minGroundClearance != null) {
    and.push({ groundClearance: { gte: params.minGroundClearance } });
  }
  if (params.modelYear != null) {
    and.push({ modelYear: params.modelYear });
  } else {
    if (params.modelYearFrom != null) and.push({ modelYear: { gte: params.modelYearFrom } });
    if (params.modelYearTo != null) and.push({ modelYear: { lte: params.modelYearTo } });
  }
  if (params.launchMode === 'upcoming') {
    and.push({
      OR: [{ modelYear: { gt: now } }, { launchStatus: { in: ['EXPECTED', 'RUMOURED'] } }],
    });
  }
  if (params.launchMode === 'launches') {
    and.push({
      OR: [{ modelYear: now }, { modelYear: now - 1 }, { launchStatus: 'CONFIRMED' }],
    });
  }
  if (params.featured != null) and.push({ featured: params.featured });
  if (params.availableInIndia != null) and.push({ availableInIndia: params.availableInIndia });
  if (params.search) {
    and.push({
      OR: [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
        { variant: { contains: params.search, mode: 'insensitive' } },
      ],
    });
  }
  return { deletedAt: null, ...(and.length ? { AND: and } : {}) };
}

function vehicleListOrder(
  sort: ListParams['sort'],
): Prisma.AutomobileVehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ exShowroomPrice: 'asc' }, { name: 'asc' }];
    case 'price_desc':
      return [{ exShowroomPrice: 'desc' }, { name: 'asc' }];
    case 'mileage':
      return [{ mileage: 'desc' }, { name: 'asc' }];
    case 'newest':
      return [{ modelYear: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }];
    case 'featured':
      return [
        { featured: 'desc' },
        { modelYear: { sort: 'desc', nulls: 'last' } },
        { name: 'asc' },
      ];
    default:
      return [{ updatedAt: 'desc' }, { id: 'desc' }];
  }
}

export class AutomobileManufacturerRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  findById(id: string) {
    return this.db.automobileManufacturer.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { vehicles: true } } },
    });
  }

  findBySlug(slug: string) {
    return this.db.automobileManufacturer.findFirst({
      where: { slug, deletedAt: null },
      include: {
        vehicles: {
          where: { deletedAt: null, status: 'PUBLISHED', availableInIndia: true },
          take: 24,
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { vehicles: true } },
      },
    });
  }

  listAll() {
    return this.db.automobileManufacturer.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { vehicles: true } } },
    });
  }

  list(params: ListParams = {}) {
    return listActiveWithCursor(this.db.automobileManufacturer, {
      ...params,
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.featured != null ? { featured: params.featured } : {}),
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
                { country: { contains: params.search, mode: 'insensitive' } },
                { tagline: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { vehicles: true } } },
    });
  }

  create(data: Prisma.AutomobileManufacturerCreateInput) {
    return this.db.automobileManufacturer.create({ data });
  }

  update(id: string, data: Prisma.AutomobileManufacturerUpdateInput) {
    return this.db.automobileManufacturer.update({ where: { id }, data });
  }

  softDelete(id: string, actorId?: string | null) {
    return softDeleteById(this.db.automobileManufacturer, id, actorId);
  }
}

export class AutomobileVehicleRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  private include = {
    manufacturer: true,
    maintenanceSchedules: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' as const } },
    images: { where: { deletedAt: null }, orderBy: { displayOrder: 'asc' as const } },
    prices: { where: { isCurrent: true }, orderBy: { countryCode: 'asc' as const } },
    reviewLinks: {
      where: { review: { deletedAt: null, status: 'PUBLISHED' } },
      include: {
        review: {
          include: { product: true },
        },
      },
    },
  } satisfies Prisma.AutomobileVehicleInclude;

  findById(id: string) {
    return this.db.automobileVehicle.findFirst({
      where: { id, deletedAt: null },
      include: this.include,
    });
  }

  findBySlug(slug: string) {
    return this.db.automobileVehicle.findFirst({
      where: { slug, deletedAt: null },
      include: this.include,
    });
  }

  findByManufacturerModelVariant(
    manufacturerId: string,
    model: string,
    variant: string,
    excludeId?: string,
  ) {
    return this.db.automobileVehicle.findFirst({
      where: {
        manufacturerId,
        model,
        variant: variant || '',
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  async replaceGallery(
    vehicleId: string,
    images: Array<{
      imageUrl?: string | null;
      mediaId?: string | null;
      altText?: string | null;
      displayOrder?: number;
    }>,
  ) {
    await this.db.automobileVehicleImage.deleteMany({ where: { vehicleId } });
    if (!images.length) return [];
    await this.db.automobileVehicleImage.createMany({
      data: images.map((img, index) => ({
        vehicleId,
        imageUrl: img.imageUrl || null,
        mediaId: img.mediaId || null,
        altText: img.altText || null,
        displayOrder: img.displayOrder ?? index,
        updatedAt: new Date(),
      })),
    });
    return this.db.automobileVehicleImage.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async replaceReviewLinks(vehicleId: string, reviewIds: string[]) {
    await this.db.automobileVehicleReview.deleteMany({ where: { vehicleId } });
    if (!reviewIds.length) return [];
    await this.db.automobileVehicleReview.createMany({
      data: reviewIds.map((reviewId) => ({ vehicleId, reviewId })),
      skipDuplicates: true,
    });
    return this.db.automobileVehicleReview.findMany({
      where: { vehicleId },
      include: { review: { include: { product: true } } },
    });
  }

  list(params: ListParams = {}) {
    return listActiveWithCursor(this.db.automobileVehicle, {
      ...params,
      where: automobileVehicleWhere(params),
      include: { manufacturer: true },
    });
  }

  async listPaged(params: ListParams = {}) {
    const where = automobileVehicleWhere(params);
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = Math.min(params.limit ?? 25, 100);
    const [total, items] = await Promise.all([
      this.db.automobileVehicle.count({ where }),
      this.db.automobileVehicle.findMany({
        where,
        include: {
          manufacturer: true,
          prices: { where: { isCurrent: true } },
        },
        orderBy: vehicleListOrder(params.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, total, page, pageSize };
  }

  listForExport(params: ListParams = {}) {
    return this.db.automobileVehicle.findMany({
      where: automobileVehicleWhere(params),
      include: {
        manufacturer: { select: { name: true, slug: true } },
        prices: { where: { isCurrent: true } },
      },
      orderBy: vehicleListOrder(params.sort),
    });
  }

  listManufacturerFilterOptions() {
    return this.db.automobileManufacturer.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 2000,
    });
  }

  async searchModels(params: ListParams & { limit?: number; page?: number }) {
    const where = automobileVehicleWhere(params);
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit ?? 12, 100);
    const skip = (page - 1) * limit;
    const groups = await this.db.automobileVehicle.groupBy({
      by: ['manufacturerId', 'model'],
      where,
      _count: { _all: true },
      _min: {
        exShowroomPrice: true,
        mileage: true,
        seatingCapacity: true,
        modelYear: true,
        safetyRating: true,
        groundClearance: true,
      },
      _max: {
        exShowroomPrice: true,
        mileage: true,
        seatingCapacity: true,
        modelYear: true,
        safetyRating: true,
        updatedAt: true,
      },
    });

    const sort = params.sort ?? 'featured';
    const sorted = [...groups].sort((a, b) => {
      if (sort === 'price_asc') {
        return (
          Number(a._min.exShowroomPrice ?? Infinity) - Number(b._min.exShowroomPrice ?? Infinity)
        );
      }
      if (sort === 'price_desc') {
        return Number(b._max.exShowroomPrice ?? 0) - Number(a._max.exShowroomPrice ?? 0);
      }
      if (sort === 'mileage') {
        return Number(b._max.mileage ?? 0) - Number(a._max.mileage ?? 0);
      }
      if (sort === 'newest') {
        return (b._max.modelYear ?? 0) - (a._max.modelYear ?? 0);
      }
      return (b._max.updatedAt?.getTime() ?? 0) - (a._max.updatedAt?.getTime() ?? 0);
    });

    const total = sorted.length;
    const pageGroups = sorted.slice(skip, skip + limit);
    const items = [];
    for (const g of pageGroups) {
      const variants = await this.db.automobileVehicle.findMany({
        where: {
          ...where,
          manufacturerId: g.manufacturerId,
          model: g.model,
        },
        include: { manufacturer: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        orderBy: [{ featured: 'desc' }, { modelYear: 'desc' }, { updatedAt: 'desc' }],
        take: 40,
      });
      const representative = variants[0];
      if (!representative) continue;
      const fuels = [...new Set(variants.map((v) => v.fuelType).filter(Boolean))] as string[];
      const transmissions = [
        ...new Set(variants.map((v) => v.transmission).filter(Boolean)),
      ] as string[];
      const bodyTypes = [...new Set(variants.map((v) => v.bodyType).filter(Boolean))] as string[];
      items.push({
        manufacturerId: g.manufacturerId,
        manufacturer: representative.manufacturer,
        model: g.model,
        name: [representative.manufacturer?.name, g.model].filter(Boolean).join(' '),
        slug: representative.slug,
        representativeId: representative.id,
        variantCount: g._count._all,
        imageUrl: variants.find((v) => v.imageUrl)?.imageUrl ?? representative.imageUrl,
        imageAttribution:
          variants.find((v) => v.imageUrl)?.imageAttribution ?? representative.imageAttribution,
        minPrice: g._min.exShowroomPrice,
        maxPrice: g._max.exShowroomPrice,
        minMileage: g._min.mileage,
        maxMileage: g._max.mileage,
        minSeats: g._min.seatingCapacity,
        maxSeats: g._max.seatingCapacity,
        minYear: g._min.modelYear,
        maxYear: g._max.modelYear,
        safetyRating: g._max.safetyRating,
        safetyAgency: representative.safetyAgency,
        groundClearance: g._min.groundClearance,
        fuels,
        transmissions,
        bodyTypes,
        featured: representative.featured,
      });
    }

    return { items, total, page, pageSize: limit };
  }

  create(data: Prisma.AutomobileVehicleCreateInput) {
    return this.db.automobileVehicle.create({ data, include: this.include });
  }

  update(id: string, data: Prisma.AutomobileVehicleUpdateInput) {
    return this.db.automobileVehicle.update({ where: { id }, data, include: this.include });
  }

  softDelete(id: string, actorId?: string | null) {
    return softDeleteById(this.db.automobileVehicle, id, actorId);
  }

  findManyByIds(ids: string[]) {
    return this.db.automobileVehicle.findMany({
      where: { id: { in: ids }, deletedAt: null, status: 'PUBLISHED' },
      include: { manufacturer: true },
    });
  }

  listIndiaSyncBatch(cursor: string | undefined, take: number) {
    return this.db.automobileVehicle.findMany({
      where: { deletedAt: null, ...(cursor ? { id: { gt: cursor } } : {}) },
      orderBy: { id: 'asc' },
      take,
      select: {
        id: true,
        name: true,
        model: true,
        variant: true,
        manufacturer: { select: { name: true } },
      },
    });
  }

  resetIndiaAvailability() {
    return this.db.automobileVehicle.updateMany({
      where: { deletedAt: null, availableInIndia: true },
      data: { availableInIndia: false },
    });
  }

  markIndiaAvailability(ids: string[]) {
    if (!ids.length) return Promise.resolve({ count: 0 });
    return this.db.automobileVehicle.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { availableInIndia: true },
    });
  }

  listPrices(vehicleId: string) {
    return this.db.automobileVehiclePrice.findMany({
      where: { vehicleId },
      orderBy: [{ isCurrent: 'desc' }, { countryCode: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }

  async recordPrice(
    vehicleId: string,
    data: {
      countryCode: string;
      currencyCode: string;
      market?: string | null;
      priceType: string;
      amount?: number | null;
      priceMin?: number | null;
      priceMax?: number | null;
      city?: string | null;
      state?: string | null;
      available: boolean;
      sourceName?: string | null;
      sourceType?: string | null;
      sourceUrl?: string | null;
      verified: boolean;
      verifiedAt?: Date | null;
    },
  ) {
    const current = await this.db.automobileVehiclePrice.findFirst({
      where: {
        vehicleId,
        countryCode: data.countryCode,
        priceType: data.priceType,
        isCurrent: true,
      },
    });
    const amountOf = (value: unknown) => (value == null ? null : Number(value));
    const same =
      current &&
      amountOf(current.amount) === amountOf(data.amount) &&
      current.available === data.available &&
      current.currencyCode === data.currencyCode &&
      (current.sourceUrl ?? null) === (data.sourceUrl ?? null) &&
      current.verified === data.verified;
    if (same && current) return current;
    const now = new Date();
    if (current) {
      await this.db.automobileVehiclePrice.update({
        where: { id: current.id },
        data: { isCurrent: false, effectiveTo: now },
      });
    }
    return this.db.automobileVehiclePrice.create({
      data: {
        vehicleId,
        countryCode: data.countryCode,
        currencyCode: data.currencyCode,
        market: data.market ?? null,
        priceType: data.priceType,
        amount: data.amount ?? null,
        priceMin: data.priceMin ?? null,
        priceMax: data.priceMax ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        available: data.available,
        sourceName: data.sourceName ?? null,
        sourceType: data.sourceType ?? null,
        sourceUrl: data.sourceUrl || null,
        verified: data.verified,
        verifiedAt: data.verifiedAt ?? null,
        effectiveFrom: now,
        isCurrent: true,
      },
    });
  }
}

export class AutomobileMaintenanceRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  listByVehicle(vehicleId: string) {
    return this.db.automobileMaintenanceSchedule.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { vehicle: { select: { id: true, name: true, slug: true } } },
    });
  }

  listAdmin(params: ListParams = {}) {
    return listActiveWithCursor(this.db.automobileMaintenanceSchedule, {
      ...params,
      where: {
        ...(params.search
          ? {
              OR: [
                { title: { contains: params.search, mode: 'insensitive' } },
                { serviceInterval: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { vehicle: { select: { id: true, name: true, slug: true } } },
    });
  }

  create(data: Prisma.AutomobileMaintenanceScheduleCreateInput) {
    return this.db.automobileMaintenanceSchedule.create({
      data,
      include: { vehicle: { select: { id: true, name: true, slug: true } } },
    });
  }

  update(id: string, data: Prisma.AutomobileMaintenanceScheduleUpdateInput) {
    return this.db.automobileMaintenanceSchedule.update({
      where: { id },
      data,
      include: { vehicle: { select: { id: true, name: true, slug: true } } },
    });
  }

  softDelete(id: string, actorId?: string | null) {
    return softDeleteById(this.db.automobileMaintenanceSchedule, id, actorId);
  }
}
