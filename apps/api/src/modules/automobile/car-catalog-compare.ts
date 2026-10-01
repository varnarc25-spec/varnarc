import { type Prisma } from '@varnarc/database';

export type CompareField = {
  name: string;
  unit: string | null;
  values: Array<number | boolean | string | null>;
  displayValues: Array<string | null>;
};

export type CompareCategory = {
  name: string;
  fields: CompareField[];
};

export type CompareCarHeader = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  slugPath: string;
};

const variantInclude = {
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

export const catalogVariantCompareInclude = variantInclude;

export type CatalogVariantForCompare = Prisma.AutomobileCatalogVariantGetPayload<{
  include: typeof variantInclude;
}>;

function num(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function bool(value: unknown): boolean | null {
  if (value == null) return null;
  return Boolean(value);
}

function display(value: number | boolean | string | null, unit?: string | null): string | null {
  if (value == null) return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return unit ? `${value} ${unit}` : String(value);
  return value;
}

function field(
  name: string,
  unit: string | null,
  values: Array<number | boolean | string | null>,
): CompareField {
  return {
    name,
    unit,
    values,
    displayValues: values.map((v) => display(v, unit)),
  };
}

export function buildCatalogComparePayload(variants: CatalogVariantForCompare[]): {
  cars: CompareCarHeader[];
  categories: CompareCategory[];
} {
  const cars: CompareCarHeader[] = variants.map((v) => ({
    id: v.id,
    brand: v.model.brand.name,
    model: v.model.name,
    variant: v.name,
    slugPath: `/cars/${v.model.brand.slug}/${v.model.slug}/${v.slug}`,
  }));

  const categories: CompareCategory[] = [
    {
      name: 'Price',
      fields: [
        field(
          'Ex-showroom',
          'INR',
          variants.map((v) => num(v.exShowroomPrice)),
        ),
      ],
    },
    {
      name: 'Engine',
      fields: [
        field(
          'Engine capacity',
          'cc',
          variants.map((v) => num(v.engine?.displacementCc)),
        ),
        field(
          'Power',
          'bhp',
          variants.map((v) => num(v.engine?.maxPowerBhp) ?? num(v.evSpec?.motorPowerBhp)),
        ),
        field(
          'Torque',
          'Nm',
          variants.map((v) => num(v.engine?.maxTorqueNm) ?? num(v.evSpec?.motorTorqueNm)),
        ),
        field(
          'Fuel type',
          null,
          variants.map((v) => str(v.fuelType)),
        ),
        field(
          'Transmission',
          null,
          variants.map((v) => str(v.transmissionType)),
        ),
        field(
          'Drivetrain',
          null,
          variants.map((v) => str(v.drivetrain)),
        ),
        field(
          'Cylinders',
          null,
          variants.map((v) => num(v.engine?.cylinders)),
        ),
      ],
    },
    {
      name: 'Performance',
      fields: [
        field(
          '0-100 km/h',
          's',
          variants.map((v) => num(v.performance?.acceleration0100Kmph)),
        ),
        field(
          'Top speed',
          'km/h',
          variants.map((v) => num(v.performance?.topSpeedKmph)),
        ),
      ],
    },
    {
      name: 'Mileage',
      fields: [
        field(
          'Claimed mileage',
          variants[0]?.fuelEconomy?.mileageUnit ?? 'km/l',
          variants.map((v) => num(v.fuelEconomy?.claimedMileage)),
        ),
        field(
          'EV range claimed',
          'km',
          variants.map((v) => num(v.evSpec?.rangeClaimedKm)),
        ),
        field(
          'Battery',
          'kWh',
          variants.map((v) => num(v.evSpec?.batteryCapacityKwh)),
        ),
      ],
    },
    {
      name: 'Dimensions',
      fields: [
        field(
          'Length',
          'mm',
          variants.map((v) => num(v.dimensions?.lengthMm)),
        ),
        field(
          'Width',
          'mm',
          variants.map((v) => num(v.dimensions?.widthMm)),
        ),
        field(
          'Height',
          'mm',
          variants.map((v) => num(v.dimensions?.heightMm)),
        ),
        field(
          'Wheelbase',
          'mm',
          variants.map((v) => num(v.dimensions?.wheelbaseMm)),
        ),
        field(
          'Ground clearance',
          'mm',
          variants.map((v) => num(v.dimensions?.groundClearanceMm)),
        ),
        field(
          'Boot space',
          'L',
          variants.map((v) => num(v.dimensions?.bootSpaceLitre)),
        ),
        field(
          'Kerb weight',
          'kg',
          variants.map((v) => num(v.dimensions?.kerbWeightKg)),
        ),
      ],
    },
    {
      name: 'Capacity',
      fields: [
        field(
          'Seating',
          null,
          variants.map((v) => num(v.dimensions?.seatingCapacity)),
        ),
        field(
          'Doors',
          null,
          variants.map((v) => num(v.dimensions?.numberOfDoors)),
        ),
        field(
          'Fuel tank',
          'L',
          variants.map((v) => num(v.dimensions?.fuelTankCapacityLitre)),
        ),
      ],
    },
    {
      name: 'Safety',
      fields: [
        field(
          'NCAP rating',
          'stars',
          variants.map((v) => num(v.safetyRating?.ncapRating)),
        ),
        field(
          'Rating agency',
          null,
          variants.map((v) => str(v.safetyRating?.ratingAgency)),
        ),
      ],
    },
    {
      name: 'Warranty',
      fields: [
        field(
          'Standard warranty',
          'years',
          variants.map((v) => num(v.warranty?.standardWarrantyYears)),
        ),
        field(
          'Standard warranty km',
          'km',
          variants.map((v) => num(v.warranty?.standardWarrantyKm)),
        ),
        field(
          'Battery warranty years',
          'years',
          variants.map((v) => num(v.warranty?.batteryWarrantyYears)),
        ),
      ],
    },
    {
      name: 'Ownership',
      fields: [
        field(
          'Est. annual service',
          'INR',
          variants.map((v) => num(v.ownership?.estimatedAnnualServiceCost)),
        ),
        field(
          'Service interval',
          'km',
          variants.map((v) => num(v.ownership?.serviceIntervalKm)),
        ),
      ],
    },
  ];

  const featureSlugs = new Map<string, { name: string; category: string; unit: string | null }>();
  for (const v of variants) {
    for (const row of v.features) {
      if (!row.feature.comparisonEnabled) continue;
      featureSlugs.set(row.feature.slug, {
        name: row.feature.name,
        category: row.feature.category.name,
        unit: row.feature.unit,
      });
    }
  }

  const byCategory = new Map<string, CompareField[]>();
  for (const [slug, meta] of featureSlugs) {
    const values = variants.map((v) => {
      const row = v.features.find(
        (f: CatalogVariantForCompare['features'][number]) => f.feature.slug === slug,
      );
      if (!row) return null;
      if (row.numericValue != null) return num(row.numericValue);
      if (row.booleanValue != null) return bool(row.booleanValue);
      return str(row.displayValue ?? row.value);
    });
    const list = byCategory.get(meta.category) ?? [];
    list.push(field(meta.name, meta.unit, values));
    byCategory.set(meta.category, list);
  }

  for (const [name, fields] of byCategory) {
    categories.push({ name, fields });
  }

  return { cars, categories };
}

export function catalogCompareSeoSlug(cars: CompareCarHeader[]): string {
  return cars
    .map((c) => `${c.brand}-${c.model}`)
    .join('-vs-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
