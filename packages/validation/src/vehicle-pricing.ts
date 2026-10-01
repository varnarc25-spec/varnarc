import { z } from 'zod';

export const VEHICLE_MARKETS = ['IN', 'GB', 'US', 'AE', 'AU', 'DE', 'JP'] as const;
export type VehicleMarketCode = (typeof VEHICLE_MARKETS)[number];

export const MARKET_CURRENCY: Record<VehicleMarketCode, string> = {
  IN: 'INR',
  GB: 'GBP',
  US: 'USD',
  AE: 'AED',
  AU: 'AUD',
  DE: 'EUR',
  JP: 'JPY',
};

export const VEHICLE_PRICE_TYPES = ['EX_SHOWROOM', 'OTR', 'LIST', 'ON_ROAD'] as const;
export type VehiclePriceType = (typeof VEHICLE_PRICE_TYPES)[number];

export const INDIA_AVAILABILITY = [
  'EXACT_VARIANT',
  'MODEL_ONLY',
  'NOT_AVAILABLE',
  'UNVERIFIED',
] as const;
export type IndiaAvailability = (typeof INDIA_AVAILABILITY)[number];

export const INDIA_PRICE_DISCLAIMER =
  'Prices shown are indicative ex-showroom prices and may vary by city, state, variant, options, taxes and manufacturer revisions. Verify the latest price with the manufacturer or an authorised dealer.';

export const INTERNATIONAL_PRICE_DISCLAIMER =
  "International prices are shown for reference and do not represent the vehicle's selling price in India.";

const SECONDARY_HOSTS = [
  'carwale.com',
  'cardekho.com',
  'zigwheels.com',
  'autocarindia.com',
  'overdrive.in',
];

export function expectedCurrency(countryCode: string): string | null {
  const code = countryCode.toUpperCase() as VehicleMarketCode;
  return MARKET_CURRENCY[code] ?? null;
}

export function currencyMatchesMarket(
  countryCode: string,
  currencyCode: string,
  override = false,
): boolean {
  if (override) return true;
  const expected = expectedCurrency(countryCode);
  if (!expected) return false;
  return expected === currencyCode.toUpperCase();
}

export function formatIndianVehiclePrice(
  amount: number | string | null | undefined,
): string | null {
  if (amount == null || amount === '') return null;
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value) || value < 0) return null;
  if (value < 100_000) {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
  }
  if (value < 10_000_000) {
    return `₹${(value / 100_000).toFixed(2)} Lakh`;
  }
  return `₹${(value / 10_000_000).toFixed(2)} Crore`;
}

export function formatInternationalVehiclePrice(
  amount: number | string | null | undefined,
  currencyCode: string,
): string | null {
  if (amount == null || amount === '') return null;
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value)) return null;
  const currency = currencyCode.toUpperCase();
  if (currency === 'INR') return formatIndianVehiclePrice(value);
  if (currency === 'GBP') {
    return `£${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
  }
  return `${currency} ${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
}

export const vehiclePriceInputSchema = z
  .object({
    countryCode: z.enum(VEHICLE_MARKETS),
    currencyCode: z.string().trim().length(3),
    priceType: z.enum(VEHICLE_PRICE_TYPES),
    amount: z.number().min(0).nullable(),
    priceMin: z.number().min(0).nullable().optional(),
    priceMax: z.number().min(0).nullable().optional(),
    city: z.string().max(80).nullable().optional(),
    state: z.string().max(80).nullable().optional(),
    available: z.boolean(),
    sourceName: z.string().max(200).nullable().optional(),
    sourceType: z.enum(['MANUFACTURER', 'SECONDARY']).nullable().optional(),
    sourceUrl: z.string().url().max(500).nullable().optional().or(z.literal('')),
    verified: z.boolean().default(false),
    verifiedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    currencyOverride: z.boolean().optional(),
  })
  .superRefine((input, ctx) => {
    if (!currencyMatchesMarket(input.countryCode, input.currencyCode, input.currencyOverride)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currencyCode'],
        message: `${input.countryCode} prices must use ${expectedCurrency(input.countryCode)}.`,
      });
    }
    if (input.verified && input.sourceType === 'SECONDARY') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['verified'],
        message: 'A secondary source cannot be marked manufacturer verified.',
      });
    }
    if (input.verified && !input.sourceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sourceUrl'],
        message: 'A verified price needs a source URL.',
      });
    }
    if (input.verified && !input.verifiedDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['verifiedDate'],
        message: 'A verified price needs a verification date.',
      });
    }
    if (
      input.countryCode === 'IN' &&
      input.amount != null &&
      input.amount > 0 &&
      input.amount < 100_000 &&
      !input.currencyOverride
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message:
          'Indian ex-showroom prices are stored in rupees. An amount under ₹1,00,000 needs an explicit override so a GBP figure is not saved as INR.',
      });
    }
  });

export type VehiclePriceInput = z.infer<typeof vehiclePriceInputSchema>;

export type NormalizedVehiclePrice = {
  countryCode: VehicleMarketCode;
  currencyCode: string;
  market: string | null;
  priceType: VehiclePriceType;
  amount: number | null;
  priceMin: number | null;
  priceMax: number | null;
  city: string | null;
  state: string | null;
  available: boolean;
  sourceName: string | null;
  sourceType: 'MANUFACTURER' | 'SECONDARY' | null;
  sourceUrl: string | null;
  verified: boolean;
  verifiedDate: string | null;
};

type VehicleRecord = Record<string, unknown>;

function asRecord(value: unknown): VehicleRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as VehicleRecord)
    : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function sourceTypeFor(url: string | null): 'MANUFACTURER' | 'SECONDARY' | null {
  const host = hostOf(url);
  if (!host) return null;
  if (SECONDARY_HOSTS.some((name) => host === name || host.endsWith(`.${name}`))) {
    return 'SECONDARY';
  }
  return 'MANUFACTURER';
}

function isImageAsset(url: string): boolean {
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'].some((ext) =>
    path.endsWith(ext),
  );
}

function gbpAmount(record: VehicleRecord): { amount: number; source: VehicleRecord } | null {
  const pricing = asRecord(record.pricing);
  const uk = asRecord(pricing?.uk);
  const ukAmount = asNumber(uk?.otrPrice) ?? asNumber(uk?.listPrice);
  if (ukAmount != null) return { amount: ukAmount, source: uk ?? {} };

  const spec = asRecord(record.specifications);
  const specPrices = asRecord(spec?.prices);
  const specCurrency = (asString(specPrices?.currency) ?? '').toUpperCase();
  const specAmount = asNumber(specPrices?.amount);
  if (specCurrency === 'GBP' && specAmount != null) {
    return { amount: specAmount, source: specPrices ?? {} };
  }

  const currency = (asString(record.currency) ?? '').toUpperCase();
  const market = (asString(record.market) ?? '').toLowerCase();
  const top = asNumber(record.exShowroomPrice);
  if (top != null && (currency === 'GBP' || market === 'united kingdom' || market === 'uk')) {
    return { amount: top, source: record };
  }
  return null;
}

export type VehiclePricingMigration = {
  vehicle: VehicleRecord;
  prices: NormalizedVehiclePrice[];
  indiaAvailability: IndiaAvailability;
  flags: {
    ukPricePreserved: boolean;
    indiaPriceFound: boolean;
    suspiciousPrice: boolean;
    currencyMismatch: boolean;
    missingSourceUrl: boolean;
    missingVerificationDate: boolean;
    missingManufacturerImage: boolean;
    requiresManualVerification: boolean;
  };
};

export function migrateVehiclePricingRecord(input: VehicleRecord): VehiclePricingMigration {
  const vehicle: VehicleRecord = structuredClone(input);
  const gbp = gbpAmount(vehicle);
  const spec = asRecord(vehicle.specifications);
  const specPrices = asRecord(spec?.prices);
  const sourceUrl =
    asString(specPrices?.sourceUrl) ?? asString(asRecord(asRecord(vehicle.pricing)?.uk)?.sourceUrl);
  const verifiedDate =
    asString(specPrices?.verifiedDate) ??
    asString(asRecord(asRecord(vehicle.pricing)?.uk)?.verifiedDate);
  const sourceType = sourceTypeFor(sourceUrl);
  const verified = Boolean(sourceUrl && verifiedDate && sourceType === 'MANUFACTURER');

  const uk: NormalizedVehiclePrice = {
    countryCode: 'GB',
    currencyCode: 'GBP',
    market: 'United Kingdom',
    priceType: 'OTR',
    amount: gbp?.amount ?? null,
    priceMin: null,
    priceMax: null,
    city: null,
    state: null,
    available: gbp?.amount != null,
    sourceName:
      asString(specPrices?.sourceName) ??
      asString(asRecord(asRecord(vehicle.pricing)?.uk)?.sourceName),
    sourceType,
    sourceUrl,
    verified,
    verifiedDate: verified ? verifiedDate : null,
  };

  const existingIndia = asRecord(asRecord(vehicle.pricing)?.india);
  const indiaCurrency = (asString(existingIndia?.currency) ?? 'INR').toUpperCase();
  let indiaAmount = asNumber(existingIndia?.exShowroomPrice);
  let currencyMismatch = false;
  if (indiaAmount != null && (indiaCurrency !== 'INR' || indiaAmount === gbp?.amount)) {
    indiaAmount = null;
    currencyMismatch = true;
  }
  const statedAvailability = asString(vehicle.indiaAvailability)?.toUpperCase();
  const indiaAvailability: IndiaAvailability = (INDIA_AVAILABILITY as readonly string[]).includes(
    statedAvailability ?? '',
  )
    ? (statedAvailability as IndiaAvailability)
    : 'UNVERIFIED';
  const indiaAvailable =
    indiaAvailability === 'EXACT_VARIANT' &&
    indiaAmount != null &&
    Boolean(existingIndia?.verified);

  const india: NormalizedVehiclePrice = {
    countryCode: 'IN',
    currencyCode: 'INR',
    market: 'India',
    priceType: 'EX_SHOWROOM',
    amount: indiaAvailable ? indiaAmount : null,
    priceMin: indiaAvailable ? asNumber(existingIndia?.priceMin) : null,
    priceMax: indiaAvailable ? asNumber(existingIndia?.priceMax) : null,
    city: asString(existingIndia?.city),
    state: asString(existingIndia?.state),
    available: indiaAvailable,
    sourceName: indiaAvailable ? asString(existingIndia?.sourceName) : null,
    sourceType: indiaAvailable
      ? ((asString(existingIndia?.sourceType)?.toUpperCase() as
          'MANUFACTURER' | 'SECONDARY' | null) ?? null)
      : null,
    sourceUrl: indiaAvailable ? asString(existingIndia?.sourceUrl) : null,
    verified: indiaAvailable,
    verifiedDate: indiaAvailable ? asString(existingIndia?.verifiedDate) : null,
  };

  vehicle.pricing = {
    primaryMarket: 'IN',
    india: {
      available: india.available,
      currency: 'INR',
      exShowroomPrice: india.amount,
      priceMin: india.priceMin,
      priceMax: india.priceMax,
      priceType: 'EX_SHOWROOM',
      city: india.city,
      state: india.state,
      sourceName: india.sourceName,
      sourceType: india.sourceType,
      sourceUrl: india.sourceUrl,
      verified: india.verified,
      verifiedDate: india.verifiedDate,
    },
    uk: {
      available: uk.available,
      currency: 'GBP',
      otrPrice: uk.amount,
      listPrice: uk.amount,
      priceType: 'OTR',
      sourceName: uk.sourceName,
      sourceType: uk.sourceType,
      sourceUrl: uk.sourceUrl,
      verified: uk.verified,
      verifiedDate: uk.verifiedDate,
    },
  };
  vehicle.primaryMarket = 'IN';
  vehicle.indiaAvailability = indiaAvailability;
  vehicle.availableInIndia = vehicle.availableInIndia === true;
  if (gbp) vehicle.exShowroomPrice = null;
  if (spec && gbp && asNumber(spec.exShowroomPrice) === gbp.amount) {
    spec.exShowroomPrice = null;
    vehicle.specifications = spec;
  }

  const images = Array.isArray(spec?.images) ? spec.images : [];
  let hasAsset = false;
  const normalizedImages = images.map((item) => {
    const image = asRecord(item);
    if (!image) return item;
    const url = asString(image.url);
    if (url && isImageAsset(url)) {
      hasAsset = true;
      return image;
    }
    if (url) {
      return { ...image, url: null, sourceUrl: asString(image.sourceUrl) ?? url };
    }
    return image;
  });
  if (spec) {
    spec.images = normalizedImages;
    vehicle.specifications = spec;
  }
  vehicle.images = hasAsset ? normalizedImages.filter((item) => asString(asRecord(item)?.url)) : [];

  const dataSources = Array.isArray(vehicle.dataSources) ? [...vehicle.dataSources] : [];
  if (
    uk.sourceUrl &&
    !dataSources.some(
      (item) => asRecord(item)?.sourceUrl === uk.sourceUrl && asRecord(item)?.type === 'PRICE',
    )
  ) {
    dataSources.push({
      type: 'PRICE',
      market: 'GB',
      sourceName: uk.sourceName,
      sourceUrl: uk.sourceUrl,
      verifiedDate: uk.verifiedDate,
    });
  }
  vehicle.dataSources = dataSources;

  const suspicious = uk.amount != null && (uk.amount < 1000 || uk.amount > 500_000);

  return {
    vehicle,
    prices: [india, uk],
    indiaAvailability,
    flags: {
      ukPricePreserved: uk.amount != null,
      indiaPriceFound: india.amount != null,
      suspiciousPrice: suspicious,
      currencyMismatch,
      missingSourceUrl: uk.amount != null && !uk.sourceUrl,
      missingVerificationDate: uk.amount != null && !uk.verifiedDate,
      missingManufacturerImage: !hasAsset,
      requiresManualVerification: indiaAvailability === 'UNVERIFIED' || !india.verified,
    },
  };
}

export type VehiclePricingAudit = {
  totalVehicles: number;
  indiaExactVariantAvailable: number;
  indiaModelOnlyAvailable: number;
  notAvailableInIndia: number;
  unverifiedIndiaAvailability: number;
  indiaPricesFound: number;
  ukPricesPreserved: number;
  missingPrices: number;
  manufacturerVerifiedPrices: number;
  secondarySourcePrices: number;
  unverifiedPrices: number;
  suspiciousPrices: string[];
  currencyMismatches: string[];
  duplicatePrices: string[];
  missingSourceUrls: string[];
  missingVerificationDates: string[];
  variantsWithoutExactIndiaMatches: string[];
  variantsWithModelOnlyIndiaMatches: string[];
  vehiclesWithoutManufacturerImages: string[];
  requiresManualVerification: string[];
};

export function auditMigratedVehicles(
  rows: Array<{ slug?: string; name?: string; migration: VehiclePricingMigration }>,
): VehiclePricingAudit {
  const slugs = new Map<string, number>();
  const audit: VehiclePricingAudit = {
    totalVehicles: rows.length,
    indiaExactVariantAvailable: 0,
    indiaModelOnlyAvailable: 0,
    notAvailableInIndia: 0,
    unverifiedIndiaAvailability: 0,
    indiaPricesFound: 0,
    ukPricesPreserved: 0,
    missingPrices: 0,
    manufacturerVerifiedPrices: 0,
    secondarySourcePrices: 0,
    unverifiedPrices: 0,
    suspiciousPrices: [],
    currencyMismatches: [],
    duplicatePrices: [],
    missingSourceUrls: [],
    missingVerificationDates: [],
    variantsWithoutExactIndiaMatches: [],
    variantsWithModelOnlyIndiaMatches: [],
    vehiclesWithoutManufacturerImages: [],
    requiresManualVerification: [],
  };
  for (const row of rows) {
    const label = row.slug || row.name || 'unknown';
    slugs.set(label, (slugs.get(label) ?? 0) + 1);
    const { migration } = row;
    if (migration.indiaAvailability === 'EXACT_VARIANT') audit.indiaExactVariantAvailable += 1;
    if (migration.indiaAvailability === 'MODEL_ONLY') {
      audit.indiaModelOnlyAvailable += 1;
      audit.variantsWithModelOnlyIndiaMatches.push(label);
    }
    if (migration.indiaAvailability === 'NOT_AVAILABLE') audit.notAvailableInIndia += 1;
    if (migration.indiaAvailability === 'UNVERIFIED') {
      audit.unverifiedIndiaAvailability += 1;
      audit.variantsWithoutExactIndiaMatches.push(label);
    }
    if (migration.flags.indiaPriceFound) audit.indiaPricesFound += 1;
    if (migration.flags.ukPricePreserved) audit.ukPricesPreserved += 1;
    const hasAmount = migration.prices.some((price) => price.amount != null);
    if (!hasAmount) audit.missingPrices += 1;
    for (const price of migration.prices) {
      if (price.amount == null) continue;
      if (price.verified && price.sourceType === 'MANUFACTURER')
        audit.manufacturerVerifiedPrices += 1;
      else if (price.sourceType === 'SECONDARY') audit.secondarySourcePrices += 1;
      else audit.unverifiedPrices += 1;
    }
    if (migration.flags.suspiciousPrice) audit.suspiciousPrices.push(label);
    if (migration.flags.currencyMismatch) audit.currencyMismatches.push(label);
    if (migration.flags.missingSourceUrl) audit.missingSourceUrls.push(label);
    if (migration.flags.missingVerificationDate) audit.missingVerificationDates.push(label);
    if (migration.flags.missingManufacturerImage)
      audit.vehiclesWithoutManufacturerImages.push(label);
    if (migration.flags.requiresManualVerification) audit.requiresManualVerification.push(label);
  }
  for (const [slug, count] of slugs) {
    if (count > 1) audit.duplicatePrices.push(slug);
  }
  return audit;
}
