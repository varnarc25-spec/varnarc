export type ListingImage = {
  imageUrl?: string | null;
  altText?: string | null;
};

const PRESENTATION_SUFFIXES = [
  /\s+\d{4}\s+india\s+range$/i,
  /\s+india\s+range$/i,
  /\s+global\s+\d{4}$/i,
  /\s+\d{4}\s+global$/i,
  /\s+\d{4}$/i,
];

/** Drop internal catalogue suffixes from a label. Does not change stored data. */
export function stripListingSuffixes(value: string): string {
  let text = value.replace(/\s+/g, ' ').trim();
  let previous = '';
  while (text && text !== previous) {
    previous = text;
    for (const pattern of PRESENTATION_SUFFIXES) {
      text = text.replace(pattern, '').trim();
    }
  }
  return text;
}

export function getDisplayVehicleName(input: {
  name?: string | null;
  model?: string | null;
  manufacturerName?: string | null;
}): string {
  const manufacturer = input.manufacturerName?.trim() ?? '';
  const model = stripListingSuffixes(input.model?.trim() ?? '');
  if (manufacturer && model) {
    if (model.toLowerCase().startsWith(manufacturer.toLowerCase())) return model;
    return stripListingSuffixes(`${manufacturer} ${model}`);
  }
  const fallback = stripListingSuffixes(input.name?.trim() || model || manufacturer);
  return fallback || 'Vehicle';
}

export function getVariantLabel(variant?: string | null): string | null {
  const cleaned = stripListingSuffixes(variant?.trim() ?? '');
  if (!cleaned || /^india range$/i.test(cleaned) || /^global$/i.test(cleaned)) return null;
  return cleaned;
}

export function getAvailabilityBadge(input: {
  launchStatus?: string | null;
  marketStatus?: string | null;
  currentIndiaModel?: boolean | null;
}): 'Current' | 'New' | 'Upcoming' | null {
  const status = `${input.marketStatus ?? ''} ${input.launchStatus ?? ''}`.trim().toUpperCase();
  if (!status && input.currentIndiaModel) return 'Current';
  if (/\b(UPCOMING|EXPECTED|RUMOURED|RUMORED)\b/.test(status)) return 'Upcoming';
  if (/\b(NEW|JUST_LAUNCHED|LAUNCHED|CONFIRMED)\b/.test(status)) return 'New';
  if (/\b(CURRENT|ON_SALE|ONSALE)\b/.test(status) || input.currentIndiaModel) return 'Current';
  return null;
}

export function getPrimaryVehicleImages(input: {
  imageUrl?: string | null;
  images?: ListingImage[] | null;
}): ListingImage[] {
  const gallery = (input.images ?? []).filter((image) => image.imageUrl?.trim());
  const frontIndex = gallery.findIndex((image) =>
    /front|three[-\s]?quarter|3\/4/i.test(image.altText ?? ''),
  );
  const ordered =
    frontIndex > 0
      ? [gallery[frontIndex]!, ...gallery.filter((_, index) => index !== frontIndex)]
      : gallery;
  if (ordered.length) return ordered;
  if (input.imageUrl?.trim()) return [{ imageUrl: input.imageUrl }];
  return [];
}

export function getVehicleImageAlt(input: { name: string; year?: number | null }): string {
  const year = input.year ? ` ${input.year}` : '';
  return `${input.name}${year} front three-quarter view`;
}

function toAmount(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function trimScale(value: number): string {
  return value.toFixed(2).replace(/\.00$/, '');
}

type PriceUnit = 'rupee' | 'lakh' | 'crore';

function priceParts(amount: number): { figure: string; unit: PriceUnit } {
  if (amount >= 10_000_000) return { figure: trimScale(amount / 10_000_000), unit: 'crore' };
  if (amount >= 100_000) return { figure: trimScale(amount / 100_000), unit: 'lakh' };
  return {
    figure: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(amount)),
    unit: 'rupee',
  };
}

/** Indian ex-showroom display. 477000 → ₹4.77 lakh. Does not invent a price. */
export function formatListingIndianPrice(
  amount: number | string | null | undefined,
): string | null {
  const value = toAmount(amount);
  if (value == null) return null;
  const parts = priceParts(value);
  if (parts.unit === 'rupee') return `₹${parts.figure}`;
  return `₹${parts.figure} ${parts.unit}`;
}

export function formatListingPrice(input: {
  min?: number | string | null;
  max?: number | string | null;
  priceType?: string | null;
}): { amount: string; caption: string | null } {
  const min = toAmount(input.min);
  const max = toAmount(input.max);
  const low = min ?? max;
  const high = max ?? min;
  if (low == null || high == null) return { amount: 'Price on request', caption: null };

  const same = Math.abs(low - high) < 1;
  const exShowroom = !input.priceType || /ex[_\s-]?showroom/i.test(input.priceType);
  if (same) {
    const formatted = formatListingIndianPrice(low);
    return {
      amount: formatted ? `${formatted}*` : 'Price on request',
      caption: exShowroom ? 'Starting ex-showroom' : null,
    };
  }

  const a = priceParts(Math.min(low, high));
  const b = priceParts(Math.max(low, high));
  const amount =
    a.unit === b.unit && a.unit !== 'rupee'
      ? `₹${a.figure} – ₹${b.figure} ${a.unit}`
      : `${formatListingIndianPrice(Math.min(low, high))} – ${formatListingIndianPrice(Math.max(low, high))}`;
  return { amount, caption: exShowroom ? 'Ex-showroom' : null };
}

export function formatListingMileage(
  min: number | string | null | undefined,
  max?: number | string | null,
): string | null {
  const values = [min, max]
    .map((value) => (value == null || value === '' ? null : Number(value)))
    .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
  if (!values.length) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const unit = high <= 20 ? 'L/100km' : 'km/l';
  const figure = (value: number) => trimScale(value);
  if (low === high) return `${figure(low)} ${unit}`;
  return `${figure(low)}–${figure(high)} ${unit}`;
}

export function formatListingSeats(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  const low = min ?? max;
  const high = max ?? min;
  if (low == null || high == null || low <= 0) return null;
  if (low === high) return `${low} Seats`;
  return `${Math.min(low, high)}–${Math.max(low, high)} Seats`;
}

export function formatListingYear(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  const low = min ?? max;
  const high = max ?? min;
  if (low == null || high == null) return null;
  if (low === high) return String(low);
  return `${Math.min(low, high)}–${Math.max(low, high)}`;
}
