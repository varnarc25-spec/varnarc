import type { Prisma, PrismaClient, PublishStatus } from '@prisma/client';
import type { CarCatalogSearchQuery } from '@varnarc/validation';

export const CATALOG_VARIANT_COMPARE_INCLUDE = {
  model: { include: { brand: true } },
  engine: true,
  evSpec: true,
  fuelEconomy: true,
  performance: true,
  dimensions: true,
  chassis: true,
  steering: true,
  wheels: true,
  lighting: true,
  connectivity: true,
  warranty: true,
  ownership: true,
  safetyRating: true,
  features: { include: { feature: { include: { category: true } } } },
} satisfies Prisma.AutomobileCatalogVariantInclude;
export const CATALOG_VARIANT_DETAIL_INCLUDE = {
  model: { include: { brand: true } },
  engine: true,
  evSpec: true,
  fuelEconomy: true,
  performance: true,
  dimensions: true,
  chassis: true,
  steering: true,
  wheels: true,
  lighting: true,
  connectivity: true,
  warranty: true,
  ownership: true,
  safetyRating: true,
  prices: { orderBy: { effectiveFrom: 'desc' as const }, take: 8 },
  onRoadPrices: { orderBy: { effectiveFrom: 'desc' as const }, take: 8 },
  features: { include: { feature: { include: { category: true } } } },
  images: { orderBy: { displayOrder: 'asc' as const } },
} satisfies Prisma.AutomobileCatalogVariantInclude;

export class CarCatalogRepository {
  constructor(private readonly db: PrismaClient) {}

  listBrands(params: { search?: string; status?: PublishStatus; limit?: number }) {
    return this.db.automobileManufacturer.findMany({
      where: {
        deletedAt: null,
        ...(params.status ? { status: params.status } : {}),
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: Math.min(params.limit ?? 100, 200),
    });
  }

  findBrandById(id: string) {
    return this.db.automobileManufacturer.findFirst({
      where: { id, deletedAt: null },
      include: { carModels: { where: { deletedAt: null }, orderBy: { name: 'asc' } } },
    });
  }

  findBrandBySlug(slug: string) {
    return this.db.automobileManufacturer.findFirst({
      where: { slug, deletedAt: null },
      include: {
        carModels: {
          where: { deletedAt: null, status: 'PUBLISHED' },
          include: { variants: { where: { deletedAt: null, status: 'PUBLISHED' } } },
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  listModels(params: {
    brandId?: string;
    search?: string;
    status?: PublishStatus;
    limit?: number;
  }) {
    return this.db.automobileCarModel.findMany({
      where: {
        deletedAt: null,
        ...(params.brandId ? { brandId: params.brandId } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { name: { contains: params.search, mode: 'insensitive' } } : {}),
      },
      include: { brand: true },
      orderBy: { name: 'asc' },
      take: Math.min(params.limit ?? 100, 200),
    });
  }

  findModelById(id: string) {
    return this.db.automobileCarModel.findFirst({
      where: { id, deletedAt: null },
      include: { brand: true, variants: { where: { deletedAt: null } } },
    });
  }

  findModelBySlugs(brandSlug: string, modelSlug: string) {
    return this.db.automobileCarModel.findFirst({
      where: { slug: modelSlug, deletedAt: null, brand: { slug: brandSlug, deletedAt: null } },
      include: {
        brand: true,
        variants: { where: { deletedAt: null, status: 'PUBLISHED' }, orderBy: { name: 'asc' } },
      },
    });
  }

  createModel(data: Prisma.AutomobileCarModelCreateInput) {
    return this.db.automobileCarModel.create({ data, include: { brand: true } });
  }

  updateModel(id: string, data: Prisma.AutomobileCarModelUpdateInput) {
    return this.db.automobileCarModel.update({ where: { id }, data, include: { brand: true } });
  }

  async deleteModel(id: string) {
    await this.db.automobileCarModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id, deleted: true };
  }

  findVariantById(id: string) {
    return this.db.automobileCatalogVariant.findFirst({
      where: { id, deletedAt: null },
      include: CATALOG_VARIANT_DETAIL_INCLUDE,
    });
  }

  findVariantBySlugs(brandSlug: string, modelSlug: string, variantSlug: string) {
    return this.db.automobileCatalogVariant.findFirst({
      where: {
        slug: variantSlug,
        deletedAt: null,
        model: { slug: modelSlug, deletedAt: null, brand: { slug: brandSlug, deletedAt: null } },
      },
      include: CATALOG_VARIANT_DETAIL_INCLUDE,
    });
  }

  findVariantsByIds(ids: string[]) {
    return this.db.automobileCatalogVariant.findMany({
      where: { id: { in: ids }, deletedAt: null, status: 'PUBLISHED' },
      include: CATALOG_VARIANT_COMPARE_INCLUDE,
    });
  }

  createVariant(data: Prisma.AutomobileCatalogVariantCreateInput) {
    return this.db.automobileCatalogVariant.create({
      data,
      include: CATALOG_VARIANT_DETAIL_INCLUDE,
    });
  }

  updateVariant(id: string, data: Prisma.AutomobileCatalogVariantUpdateInput) {
    return this.db.automobileCatalogVariant.update({
      where: { id },
      data,
      include: CATALOG_VARIANT_DETAIL_INCLUDE,
    });
  }

  async deleteVariant(id: string) {
    await this.db.automobileCatalogVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id, deleted: true };
  }

  upsertEngine(variantId: string, data: Prisma.AutomobileEngineSpecUncheckedCreateInput) {
    return this.db.automobileEngineSpec.upsert({
      where: { variantId },
      create: { ...data, variantId },
      update: data,
    });
  }

  upsertEv(variantId: string, data: Prisma.AutomobileEvSpecUncheckedCreateInput) {
    return this.db.automobileEvSpec.upsert({
      where: { variantId },
      create: { ...data, variantId },
      update: data,
    });
  }

  setVariantFeature(
    variantId: string,
    featureId: string,
    data: Prisma.AutomobileVariantFeatureUncheckedCreateInput,
  ) {
    return this.db.automobileVariantFeature.upsert({
      where: { variantId_featureId: { variantId, featureId } },
      create: { ...data, variantId, featureId },
      update: data,
    });
  }

  listFeatures() {
    return this.db.automobileFeature.findMany({
      where: { status: 'ACTIVE' },
      include: { category: true },
      orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
    });
  }

  async searchCars(query: CarCatalogSearchQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const take = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * take;
    const and: Prisma.AutomobileCatalogVariantWhereInput[] = [{ deletedAt: null }];
    if (query.search) {
      and.push({
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
          { model: { name: { contains: query.search, mode: 'insensitive' } } },
          { model: { brand: { name: { contains: query.search, mode: 'insensitive' } } } },
        ],
      });
    }
    if (query.brandId) and.push({ model: { brandId: query.brandId } });
    if (query.modelId) and.push({ modelId: query.modelId });
    if (query.brandSlug) and.push({ model: { brand: { slug: query.brandSlug } } });
    if (query.modelSlug) and.push({ model: { slug: query.modelSlug } });
    if (query.fuelType) and.push({ fuelType: query.fuelType });
    if (query.transmissionType) and.push({ transmissionType: query.transmissionType });
    if (query.drivetrain) and.push({ drivetrain: query.drivetrain });
    if (query.bodyType) and.push({ model: { bodyType: query.bodyType } });
    if (query.minPrice != null) and.push({ exShowroomPrice: { gte: query.minPrice } });
    if (query.maxPrice != null) and.push({ exShowroomPrice: { lte: query.maxPrice } });
    if (query.minEngineCc != null) {
      and.push({ engine: { displacementCc: { gte: query.minEngineCc } } });
    }
    if (query.maxEngineCc != null) {
      and.push({ engine: { displacementCc: { lte: query.maxEngineCc } } });
    }
    if (query.minPowerBhp != null)
      and.push({ engine: { maxPowerBhp: { gte: query.minPowerBhp } } });
    if (query.minMileage != null) {
      and.push({ fuelEconomy: { claimedMileage: { gte: query.minMileage } } });
    }
    if (query.minSeats != null) {
      and.push({ dimensions: { seatingCapacity: { gte: query.minSeats } } });
    }
    if (query.maxSeats != null) {
      and.push({ dimensions: { seatingCapacity: { lte: query.maxSeats } } });
    }
    if (query.minSafety != null) {
      and.push({ safetyRating: { ncapRating: { gte: query.minSafety } } });
    }
    if (query.minBootLitre != null) {
      and.push({ dimensions: { bootSpaceLitre: { gte: query.minBootLitre } } });
    }
    if (query.minGroundClearanceMm != null) {
      and.push({ dimensions: { groundClearanceMm: { gte: query.minGroundClearanceMm } } });
    }
    if (query.minWarrantyYears != null) {
      and.push({ warranty: { standardWarrantyYears: { gte: query.minWarrantyYears } } });
    }
    if (query.minEvRangeKm != null) {
      and.push({ evSpec: { rangeClaimedKm: { gte: query.minEvRangeKm } } });
    }
    if (query.minBatteryKwh != null) {
      and.push({ evSpec: { batteryCapacityKwh: { gte: query.minBatteryKwh } } });
    }
    if (query.automatic) {
      and.push({ transmissionType: { not: 'Manual' } });
    }
    if (query.sunroof) {
      and.push({
        features: { some: { feature: { slug: 'sunroof' }, booleanValue: true } },
      });
    }
    if (query.minAirbags != null) {
      and.push({
        features: {
          some: { feature: { slug: 'airbags' }, numericValue: { gte: query.minAirbags } },
        },
      });
    }
    and.push({ status: 'PUBLISHED' });

    const where: Prisma.AutomobileCatalogVariantWhereInput = { AND: and };
    const orderBy: Prisma.AutomobileCatalogVariantOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { exShowroomPrice: 'asc' }
        : query.sort === 'price_desc'
          ? { exShowroomPrice: 'desc' }
          : query.sort === 'name'
            ? { name: 'asc' }
            : { updatedAt: 'desc' };

    const [total, items] = await Promise.all([
      this.db.automobileCatalogVariant.count({ where }),
      this.db.automobileCatalogVariant.findMany({
        where,
        include: {
          model: { include: { brand: true } },
          engine: true,
          evSpec: true,
          dimensions: true,
          fuelEconomy: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy,
        skip,
        take,
      }),
    ]);
    return { items, total, page, pageSize: take };
  }

  listUsed(params: { city?: string; variantId?: string; limit?: number }) {
    return this.db.automobileUsedVehicle.findMany({
      where: {
        deletedAt: null,
        listingStatus: 'PUBLISHED',
        ...(params.city ? { city: { equals: params.city, mode: 'insensitive' } } : {}),
        ...(params.variantId ? { variantId: params.variantId } : {}),
      },
      include: {
        variant: { include: { model: { include: { brand: true } } } },
        images: { take: 4, orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(params.limit ?? 20, 100),
    });
  }

  createUsed(data: Prisma.AutomobileUsedVehicleCreateInput) {
    return this.db.automobileUsedVehicle.create({
      data,
      include: { variant: { include: { model: { include: { brand: true } } } } },
    });
  }

  findUsedById(id: string, includeSensitive = false) {
    return this.db.automobileUsedVehicle.findFirst({
      where: { id, deletedAt: null },
      include: {
        variant: { include: { model: { include: { brand: true } } } },
        condition: true,
        images: { orderBy: { displayOrder: 'asc' } },
        ...(includeSensitive
          ? { documents: true, serviceHistory: { orderBy: { serviceDate: 'desc' } } }
          : {}),
      },
    });
  }
}
