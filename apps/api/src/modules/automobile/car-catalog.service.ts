import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Repositories } from '@varnarc/database';
import type {
  CarCatalogSearchQuery,
  CarCompareQuery,
  UpsertCarModelInput,
  UpsertCatalogVariantInput,
  UpsertEngineSpecInput,
  UpsertEvSpecInput,
  UpsertUsedVehicleInput,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';
import {
  buildCatalogComparePayload,
  catalogCompareSeoSlug,
  type CatalogVariantForCompare,
} from './car-catalog-compare';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class CarCatalogService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  private get catalog() {
    return this.repos.carCatalog;
  }

  listBrands(search?: string, admin = false, withVehicles = false) {
    return this.catalog.listBrands({
      search,
      status: admin ? undefined : 'PUBLISHED',
      limit: 200,
      withVehicles,
    });
  }

  async getBrand(id: string) {
    const row = await this.catalog.findBrandById(id);
    if (!row) throw new NotFoundException('Brand not found.');
    return row;
  }

  async getBrandBySlug(slug: string) {
    const row = await this.catalog.findBrandBySlug(slug);
    if (!row) throw new NotFoundException('Brand not found.');
    return row;
  }

  listModels(brandId?: string, search?: string, admin = false) {
    return this.catalog.listModels({
      brandId,
      search,
      status: admin ? undefined : 'PUBLISHED',
    });
  }

  async getModel(id: string) {
    const row = await this.catalog.findModelById(id);
    if (!row) throw new NotFoundException('Model not found.');
    return row;
  }

  async getModelBySlugs(brand: string, model: string) {
    const row = await this.catalog.findModelBySlugs(brand, model);
    if (!row) throw new NotFoundException('Model not found.');
    return row;
  }

  createModel(input: UpsertCarModelInput, actorId: string) {
    return this.catalog.createModel({
      brand: { connect: { id: input.brandId } },
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      generation: input.generation,
      facelift: input.facelift,
      launchYear: input.launchYear,
      discontinuedYear: input.discontinuedYear,
      bodyType: input.bodyType,
      vehicleSegment: input.vehicleSegment,
      description: input.description,
      status: input.status ?? 'DRAFT',
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  async updateModel(id: string, input: UpsertCarModelInput, actorId: string) {
    await this.getModel(id);
    return this.catalog.updateModel(id, {
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      generation: input.generation,
      facelift: input.facelift,
      launchYear: input.launchYear,
      discontinuedYear: input.discontinuedYear,
      bodyType: input.bodyType,
      vehicleSegment: input.vehicleSegment,
      description: input.description,
      ...(input.status ? { status: input.status } : {}),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      updatedBy: actorId,
    });
  }

  async deleteModel(id: string) {
    await this.getModel(id);
    return this.catalog.deleteModel(id);
  }

  searchCars(query: CarCatalogSearchQuery) {
    return this.catalog.searchCars(query);
  }

  async getCar(id: string) {
    const row = await this.catalog.findVariantById(id);
    if (!row) throw new NotFoundException('Car variant not found.');
    return row;
  }

  async getCarBySlugs(brand: string, model: string, variant: string) {
    const row = await this.catalog.findVariantBySlugs(brand, model, variant);
    if (!row) throw new NotFoundException('Car variant not found.');
    return row;
  }

  createCar(input: UpsertCatalogVariantInput, actorId: string) {
    return this.catalog.createVariant({
      model: { connect: { id: input.modelId } },
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      variantCode: input.variantCode,
      modelYear: input.modelYear,
      launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
      discontinuedDate: input.discontinuedDate ? new Date(input.discontinuedDate) : undefined,
      fuelType: input.fuelType,
      transmissionType: input.transmissionType,
      drivetrain: input.drivetrain,
      exShowroomPrice: input.exShowroomPrice,
      status: input.status ?? 'DRAFT',
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
      sourceDate: input.sourceDate ? new Date(input.sourceDate) : undefined,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  async updateCar(id: string, input: UpsertCatalogVariantInput, actorId: string) {
    await this.getCar(id);
    return this.catalog.updateVariant(id, {
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      variantCode: input.variantCode,
      modelYear: input.modelYear,
      fuelType: input.fuelType,
      transmissionType: input.transmissionType,
      drivetrain: input.drivetrain,
      exShowroomPrice: input.exShowroomPrice,
      ...(input.status ? { status: input.status } : {}),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      updatedBy: actorId,
    });
  }

  async deleteCar(id: string) {
    await this.getCar(id);
    return this.catalog.deleteVariant(id);
  }

  async saveEngine(id: string, input: UpsertEngineSpecInput) {
    await this.getCar(id);
    return this.catalog.upsertEngine(id, { variantId: id, ...input });
  }

  async saveEv(id: string, input: UpsertEvSpecInput) {
    await this.getCar(id);
    return this.catalog.upsertEv(id, { variantId: id, ...input });
  }

  listFeatures() {
    return this.catalog.listFeatures();
  }

  async compare(query: CarCompareQuery) {
    const rows = await this.catalog.findVariantsByIds(query.ids);
    const byId = new Map(rows.map((row: CatalogVariantForCompare) => [row.id, row]));
    const ordered = query.ids
      .map((id: string) => byId.get(id))
      .filter((row): row is CatalogVariantForCompare => Boolean(row));
    if (ordered.length < 2) {
      throw new NotFoundException('At least two published catalog variants are required.');
    }
    const payload = buildCatalogComparePayload(ordered);
    return {
      ...payload,
      seoSlug: catalogCompareSeoSlug(payload.cars),
      canonicalPath: `/compare/${catalogCompareSeoSlug(payload.cars)}`,
    };
  }

  listUsed(city?: string) {
    return this.catalog.listUsed({ city });
  }

  async getUsed(id: string, privileged = false) {
    const row = await this.catalog.findUsedById(id, privileged);
    if (!row) throw new NotFoundException('Used vehicle not found.');
    if (privileged) return row;
    return {
      ...row,
      vin: undefined,
      engineNumber: undefined,
      chassisNumber: undefined,
    };
  }

  async createUsed(input: UpsertUsedVehicleInput, actorId: string) {
    const variant = await this.catalog.findVariantById(input.variantId);
    if (!variant) throw new NotFoundException('Variant not found.');
    return this.catalog.createUsed({
      variant: { connect: { id: input.variantId } },
      registrationNumber: input.registrationNumber,
      vin: input.vin,
      engineNumber: input.engineNumber,
      chassisNumber: input.chassisNumber,
      color: input.color,
      odometerKm: input.odometerKm,
      ownerCount: input.ownerCount,
      askingPrice: input.askingPrice,
      city: input.city,
      locality: input.locality,
      pincode: input.pincode,
      vehicleCondition: input.vehicleCondition,
      listingStatus: input.listingStatus ?? 'DRAFT',
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
}
