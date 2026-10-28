import { describe, expect, it } from 'vitest';
import {
  calculateSolar,
  compareSystemSizes,
  slabCost,
  SOLAR_ILLUSTRATIVE_DEFAULTS,
  suggestSystemKw,
} from '../src/solar-calculator';

const baseInput = {
  state: 'Karnataka',
  city: 'Bengaluru',
  monthlyBill: 3000,
  systemKw: 3,
};

describe('solar calculator', () => {
  it('generates annual yield times capacity', () => {
    const result = calculateSolar(baseInput);
    expect(result.annualGenerationKwh).toBe(3 * SOLAR_ILLUSTRATIVE_DEFAULTS.annualYieldKwhPerKw);
  });

  it('does not pay the retail tariff on exports', () => {
    const result = calculateSolar({ ...baseInput, systemKw: 10, monthlyKwh: 100 });
    expect(result.exportedKwh).toBeGreaterThan(0);
    expect(result.annualGrossSavings).toBeCloseTo(
      result.selfConsumedKwh * SOLAR_ILLUSTRATIVE_DEFAULTS.tariffPerKwh,
      0,
    );
  });

  it('applies tariff slabs to a monthly quantity', () => {
    const cost = slabCost(
      150,
      [
        { uptoKwh: 100, ratePerKwh: 4 },
        { uptoKwh: null, ratePerKwh: 8 },
      ],
      8,
    );
    expect(cost).toBe(100 * 4 + 50 * 8);
  });

  it('applies subsidy only when eligible', () => {
    const without = calculateSolar(baseInput);
    const withSubsidy = calculateSolar({
      ...baseInput,
      subsidyEligible: true,
      subsidyAmount: 30000,
    });
    expect(without.subsidyApplied).toBe(0);
    expect(withSubsidy.netInstallationCost).toBe(without.grossInstallationCost - 30000);
  });

  it('finds payback inside the horizon for a modest system', () => {
    const result = calculateSolar(baseInput);
    expect(result.paybackYears).not.toBeNull();
    expect(result.paybackLabel).not.toContain('Not reached');
  });

  it('reports no payback when savings stay negative', () => {
    const result = calculateSolar({
      ...baseInput,
      systemKw: 1,
      monthlyKwh: 0,
      monthlyBill: 0,
      annualMaintenance: 100000,
      exportRatePerKwh: 0,
    });
    expect(result.paybackYears).toBeNull();
    expect(result.paybackLabel).toContain('Not reached');
  });

  it('reduces generation after degradation', () => {
    const result = calculateSolar(baseInput);
    expect(result.years[1]?.generationKwh).toBeLessThan(result.years[0]?.generationKwh ?? 0);
  });

  it('subtracts maintenance from net operating savings', () => {
    const result = calculateSolar(baseInput);
    expect(result.annualNetOperatingSavings).toBeLessThan(result.annualGrossSavings);
  });

  it('includes financing payments when enabled', () => {
    const result = calculateSolar({
      ...baseInput,
      financeEnabled: true,
      interestRatePercent: 10,
      tenureYears: 5,
    });
    expect(result.years[0]?.financePayment).toBeGreaterThan(0);
    expect(result.years[6]?.financePayment).toBe(0);
  });

  it('rejects a zero system size', () => {
    expect(() => calculateSolar({ ...baseInput, systemKw: 0 })).toThrow();
  });

  it('rejects a negative bill', () => {
    expect(() => calculateSolar({ ...baseInput, monthlyBill: -1 })).toThrow();
  });

  it('still calculates when the location has no published yield', () => {
    const result = calculateSolar({ ...baseInput, state: 'Other', city: 'Other' });
    expect(result.assumptions.usingPublishedLocation).toBe(false);
    expect(result.annualGenerationKwh).toBeGreaterThan(0);
  });

  it('suggests a bounded system size', () => {
    expect(suggestSystemKw(0, 1500)).toBe(1);
    expect(suggestSystemKw(20000, 1500)).toBe(10);
  });

  it('compares standard system sizes from the same assumptions', () => {
    const rows = compareSystemSizes(baseInput);
    expect(rows.map((row) => row.systemKw)).toEqual([1, 2, 3, 4, 5, 6, 8, 10]);
    expect(rows[1]?.annualGenerationKwh).toBeGreaterThan(rows[0]?.annualGenerationKwh ?? 0);
  });
});
