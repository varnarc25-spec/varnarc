import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import {
  migrateVehiclePricingRecord,
  type NormalizedVehiclePrice,
} from '../../packages/validation/src/vehicle-pricing';

const filePath = process.argv[2];
if (!filePath) {
  throw new Error('Usage: tsx scripts/automobile/apply-vehicle-market-prices.ts <vehicles.json>');
}

const prisma = new PrismaClient();

function amountOf(value: unknown): number | null {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function recordPrice(vehicleId: string, price: NormalizedVehiclePrice) {
  const current = await prisma.automobileVehiclePrice.findFirst({
    where: {
      vehicleId,
      countryCode: price.countryCode,
      priceType: price.priceType,
      isCurrent: true,
    },
  });
  const same =
    current &&
    amountOf(current.amount) === price.amount &&
    current.available === price.available &&
    current.currencyCode === price.currencyCode &&
    (current.sourceUrl ?? null) === (price.sourceUrl ?? null);
  if (same) return;
  const now = new Date();
  if (current) {
    await prisma.automobileVehiclePrice.update({
      where: { id: current.id },
      data: { isCurrent: false, effectiveTo: now },
    });
  }
  await prisma.automobileVehiclePrice.create({
    data: {
      vehicleId,
      countryCode: price.countryCode,
      currencyCode: price.currencyCode,
      market: price.market,
      priceType: price.priceType,
      amount: price.amount,
      priceMin: price.priceMin,
      priceMax: price.priceMax,
      city: price.city,
      state: price.state,
      available: price.available,
      sourceName: price.sourceName,
      sourceType: price.sourceType,
      sourceUrl: price.sourceUrl,
      verified: price.verified,
      verifiedAt: price.verifiedDate ? new Date(`${price.verifiedDate}T00:00:00.000Z`) : null,
      effectiveFrom: now,
      isCurrent: true,
    },
  });
}

async function applyRecord(record: Record<string, unknown>) {
  const migration = migrateVehiclePricingRecord(record);
  const slug = typeof record.slug === 'string' ? record.slug : '';
  if (!slug || !migration.flags.ukPricePreserved) return false;
  const vehicle = await prisma.automobileVehicle.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (!vehicle) return false;
  for (const price of migration.prices) {
    await recordPrice(vehicle.id, price);
  }
  await prisma.automobileVehicle.update({
    where: { id: vehicle.id },
    data: {
      exShowroomPrice: null,
      indiaAvailability: migration.indiaAvailability,
      primaryMarket: 'IN',
      ...(migration.vehicle.availableInIndia === true ? { availableInIndia: true } : {}),
    },
  });
  return true;
}

async function main() {
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as
    { data: Record<string, unknown>[] } | Record<string, unknown>[];
  const rows = Array.isArray(raw) ? raw : raw.data;
  let updated = 0;
  for (const row of rows) {
    if (await applyRecord(row)) updated += 1;
  }

  const extras = await prisma.automobileVehicle.findMany({
    where: {
      deletedAt: null,
      exShowroomPrice: { not: null },
      OR: [
        { specifications: { path: ['currency'], equals: 'GBP' } },
        { specifications: { path: ['prices', 'currency'], equals: 'GBP' } },
        { specifications: { path: ['market'], equals: 'United Kingdom' } },
      ],
    },
    select: {
      slug: true,
      exShowroomPrice: true,
      specifications: true,
    },
  });
  let extrasUpdated = 0;
  for (const row of extras) {
    const applied = await applyRecord({
      slug: row.slug,
      exShowroomPrice: amountOf(row.exShowroomPrice),
      specifications: row.specifications,
      currency: 'GBP',
      market: 'United Kingdom',
    });
    if (applied) extrasUpdated += 1;
  }

  console.log(JSON.stringify({ fileRowsUpdated: updated, extraGbpRowsUpdated: extrasUpdated }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
