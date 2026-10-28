import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Repositories } from '@varnarc/database';
import {
  assertSolarPayload,
  calculateSolar,
  type SolarCalculateInput,
  type SolarReferenceWrite,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';

const CACHE_KEY = 'solar:published';

@Injectable()
export class SolarReferenceService {
  constructor(
    @Inject(REPOS) private readonly repos: Repositories,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async published() {
    const hit = await this.cache.get(CACHE_KEY);
    if (hit) return hit;
    const rows = await this.repos.solarReferences.listPublished();
    await this.cache.set(CACHE_KEY, rows, 60_000);
    return rows;
  }

  list() {
    return this.repos.solarReferences.list();
  }

  async create(body: SolarReferenceWrite, userId: string) {
    assertSolarPayload(body.kind, body.payload);
    const row = await this.repos.solarReferences.create({
      kind: body.kind,
      status: body.status,
      title: body.title,
      state: body.state ?? null,
      city: body.city ?? null,
      payload: body.payload as object,
      sourceUrl: body.sourceUrl ?? null,
      sourceLabel: body.sourceLabel ?? null,
      lastVerifiedAt: body.lastVerifiedAt ? new Date(body.lastVerifiedAt) : null,
      createdBy: userId,
      updatedBy: userId,
    });
    await this.cache.del(CACHE_KEY);
    return row;
  }

  async update(id: string, body: SolarReferenceWrite, userId: string) {
    const current = await this.repos.solarReferences.findById(id);
    if (!current) throw new NotFoundException('Solar reference not found.');
    assertSolarPayload(body.kind, body.payload);
    const row = await this.repos.solarReferences.update(id, {
      kind: body.kind,
      status: body.status,
      title: body.title,
      state: body.state ?? null,
      city: body.city ?? null,
      payload: body.payload as object,
      sourceUrl: body.sourceUrl ?? null,
      sourceLabel: body.sourceLabel ?? null,
      lastVerifiedAt: body.lastVerifiedAt ? new Date(body.lastVerifiedAt) : null,
      updatedBy: userId,
    });
    await this.cache.del(CACHE_KEY);
    return row;
  }

  async remove(id: string) {
    const okDelete = await this.repos.solarReferences.softDelete(id);
    if (!okDelete) throw new NotFoundException('Solar reference not found.');
    await this.cache.del(CACHE_KEY);
    return { id };
  }

  preview(input: SolarCalculateInput) {
    return calculateSolar(input);
  }
}
