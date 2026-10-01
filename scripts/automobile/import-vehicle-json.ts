/**
 * Import a vehicle-details JSON file ({ success, data: [...] }) into automobile_vehicles.
 * Same mapping as the admin Vehicles "Import CSV / JSON" action.
 *
 * Usage (from repo root, with the VPS tunnel on 5433):
 *   pnpm --filter @varnarc/database exec tsx --env-file=../../.env ../../scripts/automobile/import-vehicle-json.ts <file.json>
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { vehicleMatchesIndiaCatalog } from '@varnarc/validation';
import {
  parseVehicleDetailsJson,
  slugify,
} from '../../apps/api/src/modules/automobile/automobile-csv.util';

const prisma = new PrismaClient();

async function findManufacturer(manufacturerSlug: string, vehicleSlug: string) {
  const slugOrId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    manufacturerSlug,
  )
    ? [{ slug: manufacturerSlug }, { id: manufacturerSlug }]
    : [{ slug: manufacturerSlug }];
  const direct = await prisma.automobileManufacturer.findFirst({
    where: { deletedAt: null, OR: slugOrId },
  });
  if (direct) return direct;
  if (!vehicleSlug) return null;
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM automobile_manufacturers
    WHERE deleted_at IS NULL
      AND (${vehicleSlug} = slug OR ${vehicleSlug} LIKE slug || '-%')
    ORDER BY length(slug) DESC
    LIMIT 1
  `;
  const id = rows[0]?.id;
  if (!id) return null;
  return prisma.automobileManufacturer.findFirst({ where: { id, deletedAt: null } });
}

async function ensureManufacturer(name: string) {
  const slug = slugify(name);
  return prisma.automobileManufacturer.upsert({
    where: { slug },
    update: { deletedAt: null },
    create: {
      name,
      slug,
      status: 'PUBLISHED',
    },
  });
}

async function saveVehicle(input: {
  slug: string;
  manufacturerId: string;
  manufacturerName: string;
  model: string;
  variant: string;
  data: Record<string, unknown>;
}) {
  const existing =
    (await prisma.automobileVehicle.findUnique({ where: { slug: input.slug } })) ??
    (await prisma.automobileVehicle.findUnique({
      where: {
        manufacturerId_model_variant: {
          manufacturerId: input.manufacturerId,
          model: input.model,
          variant: input.variant,
        },
      },
    }));

  const availableInIndia = vehicleMatchesIndiaCatalog({
    manufacturerName: input.manufacturerName,
    name: String(input.data.name ?? input.model),
    model: input.model,
    variant: input.variant,
  });

  if (existing) {
    await prisma.automobileVehicle.update({
      where: { id: existing.id },
      data: {
        ...input.data,
        manufacturerId: input.manufacturerId,
        model: input.model,
        variant: input.variant,
        availableInIndia,
      },
    });
    return 'updated' as const;
  }

  await prisma.automobileVehicle.create({
    data: {
      ...input.data,
      name: String(input.data.name ?? input.model),
      slug: input.slug,
      manufacturerId: input.manufacturerId,
      model: input.model,
      variant: input.variant,
      availableInIndia,
    } as never,
  });
  return 'created' as const;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: import-vehicle-json.ts <file.json>');
    process.exit(1);
  }
  const text = readFileSync(resolve(file), 'utf8');
  const rows = parseVehicleDetailsJson(text);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name;
    const model = row.model;
    const manufacturerName = row.manufacturer || row.make;
    const manufacturerSlug = row.manufacturerSlug || row.manufacturerId || manufacturerName;
    if (!name || !model || !manufacturerSlug) {
      skipped += 1;
      continue;
    }
    const variant = row.variant || '';
    const slug = row.slug || slugify(`${manufacturerSlug}-${model}-${variant}`);
    let manufacturer = await findManufacturer(manufacturerSlug, slug);
    if (!manufacturer && manufacturerName) {
      manufacturer = await ensureManufacturer(manufacturerName);
    }
    if (!manufacturer) {
      skipped += 1;
      continue;
    }
    let specifications: unknown;
    if (row.specificationsJson) {
      try {
        specifications = JSON.parse(row.specificationsJson) as unknown;
      } catch {
        specifications = undefined;
      }
    }
    const result = await saveVehicle({
      slug,
      manufacturerId: manufacturer.id,
      manufacturerName: manufacturer.name,
      model,
      variant,
      data: {
        name,
        fuelType: row.fuelType || null,
        transmission: row.transmission || null,
        bodyType: row.bodyType || null,
        category: row.category || null,
        modelYear: row.modelYear ? Number(row.modelYear) : null,
        engineCapacity: row.engineCapacity || null,
        horsepower: row.horsepower ? Number(row.horsepower) : null,
        torque: row.torque ? Number(row.torque) : null,
        mileage: row.mileage ? Number(row.mileage) : null,
        seatingCapacity: row.seatingCapacity ? Number(row.seatingCapacity) : null,
        bootSpace: row.bootSpace ? Number(row.bootSpace) : null,
        groundClearance: row.groundClearance ? Number(row.groundClearance) : null,
        exShowroomPrice: row.exShowroomPrice ? Number(row.exShowroomPrice) : null,
        safetyRating: row.safetyRating ? Number(row.safetyRating) : null,
        warranty: row.warranty || null,
        description: row.description || null,
        seoTitle: row.seoTitle || null,
        seoDescription: row.seoDescription || null,
        sourceName: row.sourceName || null,
        sourceUrl: row.sourceUrl || null,
        specifications: specifications ?? undefined,
        status: row.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        deletedAt: null,
      },
    });
    if (result === 'created') created += 1;
    else updated += 1;
  }

  console.log(JSON.stringify({ rows: rows.length, created, updated, skipped }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
