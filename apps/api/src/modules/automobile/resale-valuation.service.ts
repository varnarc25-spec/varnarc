import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@varnarc/database';
import type { Repositories } from '@varnarc/database';
import type {
  UpdateResaleValuationConfigInput,
  UpsertResaleValuationConfigInput,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';

function dateOrNull(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(value);
}

function decimalToNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toJson(row: {
  value: unknown;
  minValue?: unknown;
  maxValue?: unknown;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  lastVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}) {
  return {
    ...row,
    value: decimalToNumber(row.value),
    minValue: decimalToNumber(row.minValue),
    maxValue: decimalToNumber(row.maxValue),
    effectiveFrom: row.effectiveFrom ? row.effectiveFrom.toISOString() : null,
    effectiveTo: row.effectiveTo ? row.effectiveTo.toISOString() : null,
    lastVerifiedAt: row.lastVerifiedAt ? row.lastVerifiedAt.toISOString() : null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : undefined,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

@Injectable()
export class ResaleValuationService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  private get configs() {
    return this.repos.resaleValuation;
  }

  async listPublic() {
    const rows = await this.configs.listActive();
    return rows.map((row) => toJson(row));
  }

  async listAdmin() {
    const rows = await this.configs.listAll();
    return rows.map((row) => toJson(row));
  }

  async create(input: UpsertResaleValuationConfigInput) {
    const row = await this.configs.create(this.toCreate(input));
    return toJson(row);
  }

  async update(id: string, input: UpdateResaleValuationConfigInput) {
    const existing = (await this.configs.listAll()).find((row) => row.id === id);
    if (!existing) throw new NotFoundException('Valuation config not found.');
    const row = await this.configs.update(id, this.toUpdate(input));
    return toJson(row);
  }

  async remove(id: string) {
    const existing = (await this.configs.listAll()).find((row) => row.id === id);
    if (!existing) throw new NotFoundException('Valuation config not found.');
    return this.configs.softDelete(id);
  }

  private toCreate(
    input: UpsertResaleValuationConfigInput,
  ): Prisma.ResaleValuationConfigCreateInput {
    return {
      type: input.type,
      key: input.key,
      value: input.value,
      manufacturerId: input.manufacturerId ?? null,
      modelId: input.modelId ?? null,
      variantId: input.variantId ?? null,
      segment: input.segment ?? null,
      fuelType: input.fuelType ?? null,
      minValue: input.minValue ?? null,
      maxValue: input.maxValue ?? null,
      effectiveFrom: dateOrNull(input.effectiveFrom) ?? null,
      effectiveTo: dateOrNull(input.effectiveTo) ?? null,
      sourceName: input.sourceName || null,
      sourceUrl: input.sourceUrl || null,
      lastVerifiedAt: dateOrNull(input.lastVerifiedAt) ?? null,
      isActive: input.isActive ?? true,
      notes: input.notes ?? null,
    };
  }

  private toUpdate(
    input: UpdateResaleValuationConfigInput,
  ): Prisma.ResaleValuationConfigUpdateInput {
    const data: Prisma.ResaleValuationConfigUpdateInput = {};
    if (input.type != null) data.type = input.type;
    if (input.key != null) data.key = input.key;
    if (input.value != null) data.value = input.value;
    if (input.manufacturerId !== undefined) data.manufacturerId = input.manufacturerId;
    if (input.modelId !== undefined) data.modelId = input.modelId;
    if (input.variantId !== undefined) data.variantId = input.variantId;
    if (input.segment !== undefined) data.segment = input.segment;
    if (input.fuelType !== undefined) data.fuelType = input.fuelType;
    if (input.minValue !== undefined) data.minValue = input.minValue;
    if (input.maxValue !== undefined) data.maxValue = input.maxValue;
    if (input.effectiveFrom !== undefined) data.effectiveFrom = dateOrNull(input.effectiveFrom);
    if (input.effectiveTo !== undefined) data.effectiveTo = dateOrNull(input.effectiveTo);
    if (input.sourceName !== undefined) data.sourceName = input.sourceName || null;
    if (input.sourceUrl !== undefined) data.sourceUrl = input.sourceUrl || null;
    if (input.lastVerifiedAt !== undefined) data.lastVerifiedAt = dateOrNull(input.lastVerifiedAt);
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.notes !== undefined) data.notes = input.notes;
    return data;
  }
}
