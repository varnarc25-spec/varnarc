import { describe, expect, it } from 'vitest';
import {
  calculateResaleValue,
  formatInrCompact,
  formatInrExact,
  mergeResaleConfigRows,
  parseResaleShare,
  resaleProgrammaticDraft,
  serializeResaleShare,
  vehicleAgeYears,
  type ResaleValuationInput,
} from '../src/resale-valuation';

function base(overrides: Partial<ResaleValuationInput> = {}): ResaleValuationInput {
  return {
    originalPrice: 12_10_000,
    priceSource: 'catalog',
    ageYears: 4,
    kilometres: 44_000,
    owners: 1,
    fuel: 'petrol',
    transmission: 'manual',
    segment: 'sedan',
    citySlug: 'bengaluru',
    stateSlug: 'karnataka',
    overallCondition: 'good',
    serviceHistory: 'complete',
    accidentHistory: 'none',
    variantIdentified: true,
    ...overrides,
  };
}

function assertSane(result: ReturnType<typeof calculateResaleValue>, original: number) {
  expect(Number.isFinite(result.marketValue)).toBe(true);
  expect(Number.isFinite(result.lowEstimate)).toBe(true);
  expect(Number.isFinite(result.highEstimate)).toBe(true);
  expect(result.marketValue).toBeGreaterThan(0);
  expect(result.lowEstimate).toBeGreaterThanOrEqual(0);
  expect(result.highEstimate).toBeGreaterThanOrEqual(result.marketValue);
  expect(result.marketValue).toBeGreaterThanOrEqual(result.lowEstimate);
  expect(result.valueRetentionPercentage).toBeLessThanOrEqual(100);
  expect(result.valueRetentionPercentage).toBeGreaterThanOrEqual(0);
  expect(result.depreciationAmount).toBeGreaterThanOrEqual(0);
  expect(result.marketValue).toBeLessThanOrEqual(original);
  expect(result.marketValue).toBeGreaterThanOrEqual(Math.round(original * 0.08));
  for (const value of Object.values(result.futureValues)) {
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThan(0);
    expect(value).not.toBe(Number.POSITIVE_INFINITY);
  }
  const summed =
    result.baseDepreciatedValue +
    result.adjustmentLines.reduce((sum, line) => sum + line.amount, 0);
  expect(summed).toBe(result.marketValue);
}

describe('calculateResaleValue', () => {
  it('depreciates a 1-year-old car by about 15–20%', () => {
    const input = base({
      ageYears: 1,
      kilometres: 11_000,
      originalPrice: 10_00_000,
      segment: 'sedan',
      fuel: 'petrol',
      overallCondition: 'good',
      serviceHistory: 'partial',
      accidentHistory: 'none',
      transmission: 'manual',
    });
    const result = calculateResaleValue(input);
    const lost = (input.originalPrice - result.marketValue) / input.originalPrice;
    expect(lost).toBeGreaterThanOrEqual(0.15);
    expect(lost).toBeLessThanOrEqual(0.2);
    assertSane(result, input.originalPrice);
  });

  it('values a 5-year-old car below a 1-year-old car', () => {
    const young = calculateResaleValue(base({ ageYears: 1, kilometres: 11_000 }));
    const mid = calculateResaleValue(base({ ageYears: 5, kilometres: 55_000 }));
    expect(mid.marketValue).toBeLessThan(young.marketValue);
    assertSane(mid, 12_10_000);
  });

  it('values a 10-year-old car below a 5-year-old car and above the floor', () => {
    const mid = calculateResaleValue(base({ ageYears: 5, kilometres: 55_000 }));
    const old = calculateResaleValue(base({ ageYears: 10, kilometres: 1_10_000 }));
    expect(old.marketValue).toBeLessThan(mid.marketValue);
    expect(old.marketValue).toBeGreaterThanOrEqual(Math.round(12_10_000 * 0.08));
    assertSane(old, 12_10_000);
  });

  it('reduces value for high mileage and lifts it slightly for very low mileage', () => {
    const normal = calculateResaleValue(base({ ageYears: 4, kilometres: 44_000 }));
    const high = calculateResaleValue(base({ ageYears: 4, kilometres: 1_20_000 }));
    const low = calculateResaleValue(base({ ageYears: 4, kilometres: 8_000 }));
    expect(high.marketValue).toBeLessThan(normal.marketValue);
    expect(low.marketValue).toBeGreaterThan(normal.marketValue);
    expect(high.adjustments.mileage).toBeLessThan(0);
    expect(low.adjustments.mileage).toBeGreaterThan(0);
  });

  it('deducts more for second and third owners', () => {
    const first = calculateResaleValue(base({ owners: 1 }));
    const second = calculateResaleValue(base({ owners: 2 }));
    const third = calculateResaleValue(base({ owners: 3 }));
    expect(second.marketValue).toBeLessThan(first.marketValue);
    expect(third.marketValue).toBeLessThan(second.marketValue);
    expect(second.adjustments.ownership).toBeLessThan(0);
  });

  it('ranks excellent above good and good above poor', () => {
    const excellent = calculateResaleValue(base({ overallCondition: 'excellent' }));
    const good = calculateResaleValue(base({ overallCondition: 'good' }));
    const poor = calculateResaleValue(base({ overallCondition: 'poor' }));
    expect(excellent.marketValue).toBeGreaterThan(good.marketValue);
    expect(good.marketValue).toBeGreaterThan(poor.marketValue);
  });

  it('applies a major-accident deduction and a missing-service deduction', () => {
    const clean = calculateResaleValue(
      base({ accidentHistory: 'none', serviceHistory: 'authorised' }),
    );
    const accident = calculateResaleValue(
      base({ accidentHistory: 'major', serviceHistory: 'authorised' }),
    );
    const missing = calculateResaleValue(base({ accidentHistory: 'none', serviceHistory: 'none' }));
    expect(accident.marketValue).toBeLessThan(clean.marketValue);
    expect(accident.adjustments.accidentHistory).toBeLessThan(0);
    expect(missing.marketValue).toBeLessThan(clean.marketValue);
    expect(missing.adjustments.serviceHistory).toBeLessThan(0);
  });

  it('uses different curves for petrol, diesel and EV', () => {
    const petrol = calculateResaleValue(base({ fuel: 'petrol', segment: 'sedan' }));
    const diesel = calculateResaleValue(base({ fuel: 'diesel', segment: 'sedan' }));
    const ev = calculateResaleValue(base({ fuel: 'electric', segment: 'ev', kilometres: 40_000 }));
    expect(diesel.marketValue).not.toBe(petrol.marketValue);
    expect(ev.marketValue).not.toBe(petrol.marketValue);
    expect(diesel.marketValue).toBeLessThan(petrol.marketValue);
  });

  it('still calculates when the variant price is entered manually', () => {
    const manual = calculateResaleValue(
      base({ priceSource: 'manual', variantIdentified: false, originalPrice: 9_50_000 }),
    );
    const catalog = calculateResaleValue(
      base({ priceSource: 'catalog', variantIdentified: true, originalPrice: 9_50_000 }),
    );
    assertSane(manual, 9_50_000);
    expect(manual.confidenceScore).toBeLessThan(catalog.confidenceScore);
    expect(manual.confidenceSuggestions).toContain('Add exact variant');
  });

  it('lowers a discontinued model and never returns NaN or a negative price', () => {
    const current = calculateResaleValue(base({ discontinued: false }));
    const discontinued = calculateResaleValue(base({ discontinued: true }));
    expect(discontinued.marketValue).toBeLessThan(current.marketValue);
    expect(discontinued.adjustments.discontinued).toBeLessThan(0);
    const wreck = calculateResaleValue(
      base({
        ageYears: 18,
        kilometres: 4_00_000,
        owners: 4,
        overallCondition: 'poor',
        accidentHistory: 'structural',
        serviceHistory: 'none',
        toggles: { floodDamage: true, chassisDamage: true },
        fuel: 'diesel',
      }),
    );
    assertSane(wreck, 12_10_000);
  });

  it('hides the resale score until the feature flag and a model score exist', () => {
    const hidden = calculateResaleValue(base({ modelId: 'model-1' }));
    expect(hidden.resaleValueScore).toBeNull();
    const shown = calculateResaleValue(base({ modelId: 'model-1' }), {
      ...mergeResaleConfigRows([
        { type: 'feature', key: 'enableResaleValueScore', value: 1 },
        { type: 'resale_score', key: 'score', value: 8.6, modelId: 'model-1' },
      ]),
    });
    expect(shown.resaleValueScore).toBe(8.6);
  });

  it('rejects a missing price', () => {
    expect(() => calculateResaleValue(base({ originalPrice: 0 }))).toThrow(/price/i);
  });
});

describe('vehicleAgeYears', () => {
  const now = new Date(2026, 9, 1);

  it('uses 1 July when only a year is provided', () => {
    const age = vehicleAgeYears({ year: 2022, now });
    expect(age).toBeGreaterThan(4);
    expect(age).toBeLessThan(4.4);
  });

  it('uses the 15th when a month is provided', () => {
    const age = vehicleAgeYears({ year: 2024, month: 1, now });
    expect(age).toBeGreaterThan(2.5);
    expect(age).toBeLessThan(2.9);
  });

  it('rejects a future registration date', () => {
    expect(() => vehicleAgeYears({ year: 2027, now })).toThrow(/future/i);
    expect(() => vehicleAgeYears({ year: 2026, month: 12, now })).toThrow(/future/i);
  });
});

describe('currency and share links', () => {
  it('formats Indian amounts', () => {
    expect(formatInrExact(12_50_000)).toBe('₹12,50,000');
    expect(formatInrCompact(7_55_000)).toBe('₹7.55 lakh');
    expect(formatInrCompact(42_50_000)).toBe('₹42.5 lakh');
    expect(formatInrCompact(1_25_00_000)).toBe('₹1.25 crore');
    expect(formatInrCompact(7_55_000)).not.toContain('$');
  });

  it('round-trips share parameters without personal fields', () => {
    const qs = serializeResaleShare({
      make: 'honda',
      model: 'city',
      variant: 'zx-cvt',
      year: '2022',
    });
    expect(qs).toContain('make=honda');
    expect(parseResaleShare(new URLSearchParams(qs.slice(1)))).toMatchObject({
      make: 'honda',
      model: 'city',
      variant: 'zx-cvt',
      year: '2022',
    });
  });

  it('does not publish programmatic paths yet', () => {
    const draft = resaleProgrammaticDraft({
      kind: 'model',
      manufacturerSlug: 'honda',
      modelSlug: 'city',
      manufacturerName: 'Honda',
      modelName: 'City',
    });
    expect(draft.path).toBeNull();
    expect(draft.ready).toBe(false);
  });
});
