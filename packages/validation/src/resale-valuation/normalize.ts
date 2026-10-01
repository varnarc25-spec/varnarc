import type { ResaleFuel, ResaleSegment, ResaleTransmission } from './types';

export function normalizeResaleFuel(value: string | null | undefined): ResaleFuel {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return 'unknown';
  if (v.includes('plug')) return 'plugin_hybrid';
  if (v.includes('hybrid')) return 'hybrid';
  if (v.includes('electric') || v === 'ev') return 'electric';
  if (v.includes('diesel')) return 'diesel';
  if (v.includes('cng')) return 'cng';
  if (v.includes('lpg')) return 'lpg';
  if (v.includes('petrol') || v.includes('gasoline') || v.includes('gas')) return 'petrol';
  return 'unknown';
}

export function normalizeResaleTransmission(value: string | null | undefined): ResaleTransmission {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return 'unknown';
  if (v.includes('single')) return 'single_speed';
  if (v.includes('manual') && !v.includes('auto')) return 'manual';
  return 'automatic';
}

export function normalizeResaleSegment(
  bodyType: string | null | undefined,
  fuel: ResaleFuel,
  category?: string | null,
): ResaleSegment {
  const categoryText = (category ?? '').toLowerCase();
  if (categoryText.includes('commercial')) return 'commercial';
  const body = (bodyType ?? '').toLowerCase();
  if (body.includes('luxury')) return 'luxury';
  if (body.includes('sport') || body.includes('coupe') || body.includes('convertible')) {
    return 'sports';
  }
  if (fuel === 'electric') return 'ev';
  if (fuel === 'hybrid' || fuel === 'plugin_hybrid') return 'hybrid';
  if (body.includes('hatch')) return 'hatchback';
  if (body.includes('sedan')) return 'sedan';
  if (body.includes('suv') || body.includes('crossover')) return 'suv';
  if (body.includes('muv') || body.includes('mpv') || body.includes('minivan')) return 'muv';
  if (body.includes('pickup')) return 'pickup';
  return 'unknown';
}
