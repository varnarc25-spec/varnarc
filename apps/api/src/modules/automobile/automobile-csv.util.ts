import { migrateVehiclePricingRecord } from '@varnarc/validation';

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const lines = splitCsvLines(text.replace(/^\uFEFF/, ''));
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((header, i) => {
      row[header] = (cols[i] ?? '').trim();
    });
    return row;
  });
}

export function detectAutomobileCsvEntity(fileName: string, headers: string[]): string {
  const name = fileName.toLowerCase();
  if (name.includes('manufacturer')) return 'manufacturers';
  if (name.includes('image')) return 'vehicle-images';
  if (name.includes('review')) return 'vehicle-reviews';
  if (name.includes('spec') || name.includes('cars')) return 'specs';
  if (name.includes('vehicle')) return 'vehicles';
  const set = new Set(headers.map((h) => h.toLowerCase()));
  if (set.has('make') && set.has('model')) return 'specs';
  if (set.has('imageurl') || set.has('image_url')) return 'vehicle-images';
  if (set.has('reviewslug') || set.has('reviewid')) return 'vehicle-reviews';
  if (set.has('country') && set.has('slug') && set.has('name') && !set.has('model')) {
    return 'manufacturers';
  }
  return 'vehicles';
}

function csvBool(value: string | undefined): boolean | undefined {
  if (value == null || value.trim() === '') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return undefined;
}

function csvDate(value: string | undefined): Date | null | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return new Date(`${trimmed}T00:00:00.000Z`);
}

export function manufacturerImportData(row: CsvRow) {
  const name = row.name || row.make;
  if (!name) return null;
  const featured = csvBool(row.featured);
  const availableInIndia = csvBool(row.availableInIndia);
  const indiaVerifiedAt = csvDate(row.indiaVerifiedDate);
  return {
    name,
    slug: row.slug || slugify(name),
    country: row.country || null,
    website: row.website || null,
    status: (row.status as 'DRAFT' | 'PUBLISHED') || 'PUBLISHED',
    ...(featured !== undefined ? { featured } : {}),
    ...(availableInIndia !== undefined ? { availableInIndia } : {}),
    ...(row.indiaAvailabilityStatus !== undefined
      ? { indiaAvailabilityStatus: row.indiaAvailabilityStatus || null }
      : {}),
    ...(row.indiaWebsite !== undefined ? { indiaWebsite: row.indiaWebsite || null } : {}),
    ...(indiaVerifiedAt !== undefined ? { indiaVerifiedAt } : {}),
    ...(row.indiaVerificationNote !== undefined
      ? { indiaVerificationNote: row.indiaVerificationNote || null }
      : {}),
    ...(row.tagline !== undefined ? { tagline: row.tagline || null } : {}),
  };
}

export function slugify(value: string, max = 90): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug.slice(0, max) || 'vehicle';
}

export const MERGE_IMPORT_ORDER = [
  'manufacturers',
  'specs',
  'vehicles',
  'vehicle-images',
  'vehicle-reviews',
] as const;

function splitCsvLines(text: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      current += ch;
      if (inQuotes && text[i + 1] === '"') {
        current += text[i + 1];
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      if (current.trim()) rows.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) rows.push(current);
  return rows;
}

function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cols.push(current);
  return cols;
}

function cell(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object') return '';
  return String(value).trim();
}

function readManufacturer(item: Record<string, unknown>) {
  const nested = item.manufacturer;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const record = nested as Record<string, unknown>;
    const name = cell(record.name);
    const slug = cell(record.slug);
    if (name || slug) return { name, slug };
  }
  const name = pick(item, 'model.brand.name', 'manufacturer', 'make', 'brand');
  const slug = pick(item, 'model.brand.slug', 'manufacturerSlug');
  return { name, slug };
}

function boolCell(value: unknown) {
  if (value === true || value === 'true' || value === '1') return 'true';
  if (value === false || value === 'false' || value === '0') return 'false';
  return '';
}

function indiaPricing(item: Record<string, unknown>): Record<string, unknown> | null {
  const pricing = item.pricing;
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) return null;
  const india = (pricing as { india?: unknown }).india;
  return india && typeof india === 'object' && !Array.isArray(india)
    ? (india as Record<string, unknown>)
    : null;
}

export function mapIndiaAvailability(value: string): string {
  const raw = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (['AVAILABLE', 'EXACT_VARIANT', 'EXACT_VARIANT_AVAILABLE'].includes(raw))
    return 'EXACT_VARIANT';
  if (['MODEL_ONLY', 'MODEL_AVAILABLE_VARIANT_NOT_SOLD'].includes(raw)) return 'MODEL_ONLY';
  if (['NOT_AVAILABLE', 'MODEL_NOT_SOLD_IN_INDIA'].includes(raw)) return 'NOT_AVAILABLE';
  if (['UNVERIFIED', 'POSSIBLE_INDIA', 'UPCOMING_INDIA'].includes(raw)) return 'UNVERIFIED';
  return '';
}

function statedIndiaAvailability(item: Record<string, unknown>): string {
  const india = indiaPricing(item);
  return mapIndiaAvailability(
    pick(item, 'indiaAvailability') ||
      cell(india?.availabilityStatus) ||
      cell(india?.indiaAvailability),
  );
}

function inrAmount(item: Record<string, unknown>): string {
  const india = indiaPricing(item);
  const currency = (cell(india?.currency) || pick(item, 'currency') || 'INR').toUpperCase();
  const raw = india?.exShowroomPrice ?? item.exShowroomPrice;
  const amount = typeof raw === 'number' ? raw : Number(cell(raw));
  if (currency !== 'INR' || !Number.isFinite(amount) || amount < 100_000) return '';
  return String(amount);
}

function hasUkPrice(item: Record<string, unknown>, specPrices?: { currency?: unknown }): boolean {
  if (typeof item.currency === 'string' && item.currency.toUpperCase() === 'GBP') return true;
  if (
    typeof item.market === 'string' &&
    ['united kingdom', 'uk'].includes(item.market.toLowerCase())
  ) {
    return true;
  }
  if (typeof specPrices?.currency === 'string' && specPrices.currency.toUpperCase() === 'GBP') {
    return true;
  }
  const pricing = item.pricing;
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) return false;
  const uk = (pricing as { uk?: unknown }).uk;
  if (!uk || typeof uk !== 'object' || Array.isArray(uk)) return false;
  const record = uk as { otrPrice?: unknown; listPrice?: unknown };
  return [record.otrPrice, record.listPrice].some(
    (value) => typeof value === 'number' && Number.isFinite(value),
  );
}

function indiaMarketPricingJson(item: Record<string, unknown>, amount: string): string {
  if (!amount) return '';
  const india = indiaPricing(item);
  const sourceUrl = cell(india?.sourceUrl) || pick(item, 'indiaPricingSourceUrl', 'sourceUrl');
  const verifiedDate = cell(india?.verifiedDate) || pick(item, 'indiaVerifiedDate');
  const verified = india?.verified === true || Boolean(sourceUrl && verifiedDate);
  return JSON.stringify([
    {
      countryCode: 'IN',
      currencyCode: 'INR',
      market: 'India',
      priceType: 'EX_SHOWROOM',
      amount: Number(amount),
      priceMin: null,
      priceMax: null,
      city: null,
      state: null,
      available: true,
      sourceName: pick(item, 'sourceName') || null,
      sourceType: sourceUrl.includes('autocarindia.com')
        ? 'SECONDARY'
        : sourceUrl
          ? 'MANUFACTURER'
          : null,
      sourceUrl: sourceUrl || null,
      verified,
      verifiedDate: verified && verifiedDate ? verifiedDate : null,
    },
  ]);
}

function pick(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = cell(row[key]);
    if (value) return value;
  }
  return '';
}

export function parseVehicleDetailsJson(text: string): CsvRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file.');
  }
  const items = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { data?: unknown }).data)
      ? (parsed as { data: unknown[] }).data
      : parsed && typeof parsed === 'object'
        ? [parsed]
        : [];
  return items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const brand = readManufacturer(item);
      const modelName =
        pick(item, 'model.name') || (typeof item.model === 'string' ? cell(item.model) : '');
      const originalName = pick(item, 'originalName');
      const nameField = pick(item, 'name');
      const explicitVariant = pick(item, 'variant', 'variantCode');
      const variant = originalName ? nameField || explicitVariant : explicitVariant;
      const displayName =
        originalName || nameField || [brand.name, modelName, variant].filter(Boolean).join(' ');
      const statusRaw = pick(item, 'status').toUpperCase();
      const status =
        statusRaw === 'PUBLISHED' || statusRaw === 'DRAFT' ? statusRaw : statusRaw ? '' : 'DRAFT';
      const specPrices =
        item.specifications &&
        typeof item.specifications === 'object' &&
        !Array.isArray(item.specifications)
          ? (item.specifications as { prices?: { currency?: unknown } }).prices
          : undefined;
      const foreignPrice = hasUkPrice(item, specPrices);
      const pricing = foreignPrice ? migrateVehiclePricingRecord(item) : null;
      const indiaPrice = pricing?.prices.find((price) => price.countryCode === 'IN');
      const indiaAvailability = pricing?.indiaAvailability || statedIndiaAvailability(item);
      const exactInr =
        !foreignPrice && indiaAvailability === 'EXACT_VARIANT' ? inrAmount(item) : '';
      return {
        name: displayName,
        model: modelName,
        variant,
        manufacturer: brand.name,
        make: brand.name,
        manufacturerSlug: brand.slug || slugify(brand.name),
        slug: pick(item, 'slug', 'originalSlug'),
        fuelType: pick(item, 'fuelType'),
        transmission: pick(item, 'transmissionType', 'transmission'),
        bodyType: pick(item, 'model.bodyType', 'bodyType'),
        category: pick(item, 'model.vehicleSegment', 'category'),
        modelYear: pick(item, 'modelYear'),
        engineCapacity: pick(item, 'engine.displacementCc', 'engineCapacity'),
        horsepower: pick(item, 'engine.maxPowerBhp', 'horsepower'),
        torque: pick(item, 'engine.maxTorqueNm', 'torque'),
        mileage: pick(item, 'fuelEconomy.claimedMileage', 'fuelEconomy.cityMileage', 'mileage'),
        seatingCapacity: pick(item, 'dimensions.seatingCapacity', 'seatingCapacity'),
        bootSpace: pick(item, 'dimensions.bootSpaceLitre', 'bootSpace'),
        groundClearance: pick(item, 'dimensions.groundClearanceMm', 'groundClearance'),
        exShowroomPrice:
          indiaPrice?.amount != null && indiaPrice.currencyCode === 'INR'
            ? String(indiaPrice.amount)
            : exactInr
              ? exactInr
              : foreignPrice
                ? ''
                : pick(item, 'exShowroomPrice'),
        seoTitle: pick(item, 'seoTitle'),
        seoDescription: pick(item, 'seoDescription'),
        sourceName: pick(item, 'sourceName'),
        sourceUrl: pick(item, 'sourceUrl'),
        safetyRating: pick(item, 'safetyRating.ncapRating'),
        warranty: pick(item, 'warranty.warrantyNotes', 'warranty.standardWarrantyYears'),
        description: pick(item, 'model.description', 'description'),
        availableInIndia: foreignPrice
          ? pricing?.vehicle.availableInIndia === true
            ? 'true'
            : 'false'
          : boolCell(item.availableInIndia) ||
            (indiaAvailability === 'EXACT_VARIANT'
              ? 'true'
              : indiaAvailability === 'NOT_AVAILABLE'
                ? 'false'
                : ''),
        indiaAvailability,
        marketPricingJson: pricing
          ? JSON.stringify(pricing.prices)
          : indiaMarketPricingJson(item, exactInr),
        status,
        specificationsJson: JSON.stringify(pricing?.vehicle ?? item),
      };
    });
}
