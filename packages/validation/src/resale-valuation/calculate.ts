import {
  DEFAULT_RESALE_SETTINGS,
  RESALE_ASSUMPTIONS_NOTE,
  RESALE_CONFIDENCE_NOTE,
} from './defaults';
import type {
  ResaleAdjustmentLine,
  ResaleConfidenceLevel,
  ResaleFuel,
  ResaleOwnerCount,
  ResaleTimelinePoint,
  ResaleValuationInput,
  ResaleValuationResult,
  ResaleValuationSettings,
} from './types';

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function roundRupee(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

function round1(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

/**
 * Vehicle age in years.
 * With a month: the 15th of that month.
 * Year only: 1 July of that year. If 1 July is still in the future, 1 January
 * of the registration year (current-year cars registered before July).
 */
export function vehicleAgeYears(input: {
  year: number;
  month?: number | null;
  now?: Date;
}): number {
  const now = input.now ?? new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hasMonth = input.month != null && input.month >= 1 && input.month <= 12;
  let registered = hasMonth
    ? new Date(input.year, (input.month ?? 1) - 1, 15)
    : new Date(input.year, 6, 1);
  if (!hasMonth && registered > today) {
    registered = new Date(input.year, 0, 1);
  }
  if (registered > today) {
    throw new Error('Registration date cannot be in the future.');
  }
  return Math.max(0, (today.getTime() - registered.getTime()) / MS_PER_YEAR);
}

function annualRate(yearIndex: number, settings: ResaleValuationSettings): number {
  if (yearIndex <= 0) return 0;
  const early = settings.schedule.early;
  if (yearIndex <= early.length) return early[yearIndex - 1] ?? settings.schedule.longTermFloor;
  const extra = yearIndex - early.length;
  return Math.max(
    settings.schedule.longTermFloor,
    settings.schedule.longTermStart - (extra - 1) * settings.schedule.longTermDecline,
  );
}

function depreciatedRaw(
  originalPrice: number,
  ageYears: number,
  curveMultiplier: number,
  settings: ResaleValuationSettings,
): number {
  if (!(originalPrice > 0)) return 0;
  if (!(ageYears > 0)) return originalPrice;
  const curve = clamp(curveMultiplier, 0.65, 1.55);
  let value = originalPrice;
  const full = Math.min(60, Math.floor(ageYears));
  const fraction = ageYears - Math.floor(ageYears);
  for (let year = 1; year <= full; year += 1) {
    const rate = clamp(
      annualRate(year, settings) * curve,
      settings.schedule.minAnnualRate,
      settings.schedule.maxAnnualRate,
    );
    value *= 1 - rate;
  }
  if (fraction > 0 && full < 60) {
    const rate = clamp(
      annualRate(full + 1, settings) * curve,
      settings.schedule.minAnnualRate,
      settings.schedule.maxAnnualRate,
    );
    value *= 1 - rate * Math.min(fraction, 0.999);
  }
  return value;
}

function expectedAnnualKm(fuel: ResaleFuel, settings: ResaleValuationSettings): number {
  const annual = settings.expectedKmPerYear[fuel] ?? settings.expectedKmPerYear.petrol;
  return Math.max(1_000, annual);
}

function mileagePercent(
  kilometres: number,
  ageYears: number,
  fuel: ResaleFuel,
  settings: ResaleValuationSettings,
): { percent: number; expectedKilometres: number } {
  if (!(ageYears > 0) || !(kilometres >= 0)) {
    return { percent: 0, expectedKilometres: 0 };
  }
  const expectedKilometres = expectedAnnualKm(fuel, settings) * Math.max(ageYears, 1 / 12);
  const ratio = expectedKilometres > 0 ? kilometres / expectedKilometres : 1;
  const band =
    settings.mileageBands.find((row) => ratio <= row.maxRatio) ??
    settings.mileageBands[settings.mileageBands.length - 1];
  const percent = clamp(band?.percent ?? 0, -settings.mileageCap, settings.mileageCap);
  return { percent, expectedKilometres };
}

function fuelCurve(input: ResaleValuationInput, settings: ResaleValuationSettings): number {
  if (input.segment === 'ev' && input.fuel === 'electric') return 1;
  if (input.segment === 'hybrid' && (input.fuel === 'hybrid' || input.fuel === 'plugin_hybrid')) {
    return 1;
  }
  return settings.fuelMultipliers[input.fuel] ?? 1;
}

function brandModelCurve(input: ResaleValuationInput, settings: ResaleValuationSettings): number {
  const byId = input.manufacturerId
    ? settings.brandMultipliersById[input.manufacturerId]
    : undefined;
  const bySlug = input.manufacturerSlug
    ? settings.brandMultipliersBySlug[input.manufacturerSlug]
    : undefined;
  const model = input.modelId ? settings.modelMultipliersById[input.modelId] : undefined;
  const brand = byId ?? bySlug ?? 1;
  return clamp(brand, 0.7, 1.4) * clamp(model ?? 1, 0.7, 1.4);
}

function confidenceFor(input: ResaleValuationInput): {
  score: number;
  level: ResaleConfidenceLevel;
  suggestions: string[];
} {
  let score = 35;
  if (input.priceSource === 'catalog') score += 22;
  else if (input.originalPrice > 0) score += 10;
  if (input.variantIdentified) score += 12;
  if (Number.isFinite(input.kilometres)) score += 8;
  if (input.citySlug && input.citySlug !== 'other') score += 8;
  else if (input.stateSlug) score += 3;
  if (input.overallCondition) score += 8;
  if (input.serviceHistory || input.toggles?.fullServiceHistory) score += 6;
  if (input.accidentHistory) score += 6;
  if (input.fuel !== 'unknown') score += 4;
  if (input.owners) score += 3;
  if (input.fuel === 'electric' && input.batteryHealthPercent != null) score += 4;
  score = clamp(Math.round(score), 0, 100);
  const level: ResaleConfidenceLevel = score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LIMITED';
  const suggestions: string[] = [];
  if (!input.variantIdentified) suggestions.push('Add exact variant');
  if (!input.overallCondition) suggestions.push('Add vehicle condition');
  if (!input.serviceHistory && !input.toggles?.fullServiceHistory) {
    suggestions.push('Add service history');
  }
  if (!input.accidentHistory) suggestions.push('Add accident history');
  if (!input.citySlug || input.citySlug === 'other') suggestions.push('Add city');
  return { score, level, suggestions };
}

function ownerLabel(owners: ResaleOwnerCount): string {
  if (owners === 2) return 'Second owner';
  if (owners === 3) return 'Third owner';
  if (owners === 4) return 'Fourth owner or more';
  return 'First owner';
}

type Point = {
  baseDepreciatedValue: number;
  lines: ResaleAdjustmentLine[];
  marketValue: number;
  expectedKilometres: number;
};

function pushLine(lines: ResaleAdjustmentLine[], key: string, label: string, amount: number) {
  const rounded = roundRupee(amount);
  if (rounded === 0) return;
  lines.push({ key, label, amount: rounded });
}

function evaluatePoint(input: ResaleValuationInput, settings: ResaleValuationSettings): Point {
  const price = input.originalPrice;
  const age = clamp(input.ageYears, 0, 60);
  const segmentMult = settings.segmentMultipliers[input.segment] ?? 1;
  const fuelMult = fuelCurve(input, settings);
  const brandMult = brandModelCurve(input, settings);
  const ageOnly = roundRupee(depreciatedRaw(price, age, 1, settings));
  const withSegment = roundRupee(depreciatedRaw(price, age, segmentMult, settings));
  const withFuel = roundRupee(depreciatedRaw(price, age, segmentMult * fuelMult, settings));
  const withBrand = roundRupee(
    depreciatedRaw(price, age, segmentMult * fuelMult * brandMult, settings),
  );
  const reference = withBrand;
  const lines: ResaleAdjustmentLine[] = [];
  pushLine(lines, 'segment', 'Segment adjustment', withSegment - ageOnly);
  pushLine(lines, 'fuel', 'Fuel type', withFuel - withSegment);
  pushLine(lines, 'model', 'Model adjustment', withBrand - withFuel);

  const mileage = mileagePercent(input.kilometres, age, input.fuel, settings);
  pushLine(lines, 'mileage', 'Mileage adjustment', reference * mileage.percent);

  const ownership = clamp(
    settings.ownershipPercent[input.owners] ?? 0,
    -settings.ownershipCap,
    settings.ownershipCap,
  );
  pushLine(lines, 'ownership', ownerLabel(input.owners), reference * ownership);

  const details = input.details ?? {};
  let conditionPct = input.overallCondition
    ? (settings.conditionOverall[input.overallCondition] ?? 0)
    : 0;
  let detailPct = 0;
  const detailKeys = [
    'exterior',
    'interior',
    'engine',
    'transmission',
    'electrical',
    'ac',
  ] as const;
  for (const key of detailKeys) {
    const rating = details[key];
    if (rating) detailPct += settings.conditionDetail[rating] ?? 0;
  }
  detailPct = clamp(detailPct, -settings.conditionDetailCap, settings.conditionDetailCap);
  conditionPct += detailPct;
  if (input.toggles?.originalPaint) conditionPct += settings.originalPaint;
  pushLine(lines, 'condition', 'Condition', reference * conditionPct);

  let tyrePct = 0;
  if (details.tyres) tyrePct += settings.conditionDetail[details.tyres] ?? 0;
  if (input.toggles?.recentTyres) tyrePct += settings.recentTyres;
  pushLine(lines, 'tyres', 'Tyre condition', reference * tyrePct);

  let servicePct = 0;
  if (input.serviceHistory) servicePct = settings.servicePercent[input.serviceHistory] ?? 0;
  else if (input.toggles?.fullServiceHistory) servicePct = settings.servicePercent.authorised;
  pushLine(lines, 'serviceHistory', 'Service history', reference * servicePct);

  let accidentPct = input.accidentHistory
    ? (settings.accidentPercent[input.accidentHistory] ?? 0)
    : 0;
  if (!input.accidentHistory && input.toggles?.majorAccident) {
    accidentPct += settings.majorAccidentToggle;
  }
  if (input.toggles?.floodDamage) accidentPct += settings.floodPercent;
  if (input.toggles?.chassisDamage && input.accidentHistory !== 'structural') {
    accidentPct += settings.chassisPercent;
  }
  accidentPct = Math.max(accidentPct, -settings.accidentCap);
  pushLine(lines, 'accidentHistory', 'Accident history', reference * accidentPct);

  const city = input.citySlug ? settings.cityAdjustments[input.citySlug] : undefined;
  const state = input.stateSlug ? settings.stateAdjustments[input.stateSlug] : undefined;
  const location = clamp(city ?? state ?? 0, -settings.locationCap, settings.locationCap);
  pushLine(lines, 'location', 'Location adjustment', reference * location);

  if (input.transmission === 'automatic') {
    pushLine(
      lines,
      'transmission',
      'Automatic transmission',
      reference * settings.transmissionAutomatic,
    );
  }

  let insurancePct = 0;
  if (input.insuranceStatus) insurancePct = settings.insurancePercent[input.insuranceStatus] ?? 0;
  else if (input.toggles?.validInsurance) insurancePct = settings.validInsuranceToggle;
  pushLine(lines, 'insurance', 'Insurance status', reference * insurancePct);

  if (input.rcStatus === 'expired') {
    pushLine(lines, 'registration', 'Registration status', reference * settings.rcExpiredPercent);
  }

  if (input.discontinued) {
    pushLine(lines, 'discontinued', 'Discontinued model', reference * settings.discontinuedPercent);
  }

  if (input.fuel === 'electric') {
    let batteryPct = 0;
    const health = input.batteryHealthPercent;
    if (health != null && Number.isFinite(health)) {
      if (health >= 90) batteryPct += settings.batteryExcellent;
      else if (health < 80 && health >= 70) batteryPct += settings.batteryFair;
      else if (health < 70) batteryPct += settings.batteryPoor;
    }
    if (input.batteryReplaced) batteryPct += settings.batteryReplaced;
    const warranty = input.batteryWarrantyYearsRemaining;
    if (warranty != null && Number.isFinite(warranty)) {
      if (warranty >= 5) batteryPct += settings.batteryWarrantyLong;
      else if (warranty <= 0) batteryPct += settings.batteryWarrantyExpired;
    }
    batteryPct = clamp(batteryPct, -settings.batteryCap, settings.batteryCap);
    pushLine(lines, 'battery', 'Battery', reference * batteryPct);
  }

  let market = ageOnly + lines.reduce((sum, line) => sum + line.amount, 0);
  const floor = roundRupee(price * settings.minRetention);
  const ceiling = roundRupee(price * settings.maxRetention);
  if (market < floor) {
    pushLine(lines, 'valueFloor', 'Minimum value floor', floor - market);
    market = floor;
  }
  if (market > ceiling) {
    pushLine(lines, 'valueCap', 'Maximum value cap', ceiling - market);
    market = ceiling;
  }
  market = Math.max(0, roundRupee(market));

  return {
    baseDepreciatedValue: ageOnly,
    lines,
    marketValue: market,
    expectedKilometres: roundRupee(mileage.expectedKilometres),
  };
}

function project(
  input: ResaleValuationInput,
  settings: ResaleValuationSettings,
  targetAge: number,
  mode: 'history' | 'future',
): number {
  if (targetAge <= 0) return roundRupee(input.originalPrice);
  const currentAge = Math.max(input.ageYears, 0);
  const annual = expectedAnnualKm(input.fuel, settings);
  let kilometres = input.kilometres;
  if (mode === 'history' && currentAge > 0.05) {
    kilometres = input.kilometres * (targetAge / currentAge);
  } else if (mode === 'future') {
    kilometres = input.kilometres + annual * Math.max(0, targetAge - currentAge);
  }
  return evaluatePoint(
    { ...input, ageYears: targetAge, kilometres: Math.max(0, kilometres) },
    settings,
  ).marketValue;
}

export class ResaleValuationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResaleValuationError';
  }
}

export function calculateResaleValue(
  input: ResaleValuationInput,
  settings: ResaleValuationSettings = DEFAULT_RESALE_SETTINGS,
): ResaleValuationResult {
  if (!Number.isFinite(input.originalPrice) || input.originalPrice <= 0) {
    throw new ResaleValuationError('Original vehicle price must be greater than zero.');
  }
  if (!Number.isFinite(input.ageYears) || input.ageYears < 0) {
    throw new ResaleValuationError('Vehicle age is not valid.');
  }
  if (!Number.isFinite(input.kilometres) || input.kilometres < 0) {
    throw new ResaleValuationError('Kilometres driven cannot be negative.');
  }

  const point = evaluatePoint(input, settings);
  const confidence = confidenceFor(input);
  const spread =
    confidence.level === 'HIGH'
      ? settings.spread.high
      : confidence.level === 'MEDIUM'
        ? settings.spread.medium
        : settings.spread.limited;
  let low = roundRupee(point.marketValue * (1 - spread));
  let high = roundRupee(point.marketValue * (1 + spread));
  low = Math.max(0, Math.min(low, point.marketValue));
  high = Math.max(high, point.marketValue);

  const year1 = project(input, settings, input.ageYears + 1, 'future');
  const year2 = project(input, settings, input.ageYears + 2, 'future');
  const year3 = project(input, settings, input.ageYears + 3, 'future');
  const year5 = project(input, settings, input.ageYears + 5, 'future');
  const depreciation12 = Math.max(0, point.marketValue - year1);

  const timeline: ResaleTimelinePoint[] = [
    { key: 'new', label: 'New', value: roundRupee(input.originalPrice) },
    {
      key: 'year1',
      label: 'Year 1',
      value: project(input, settings, 1, input.ageYears > 1 ? 'history' : 'future'),
    },
    {
      key: 'year2',
      label: 'Year 2',
      value: project(input, settings, 2, input.ageYears > 2 ? 'history' : 'future'),
    },
    {
      key: 'year3',
      label: 'Year 3',
      value: project(input, settings, 3, input.ageYears > 3 ? 'history' : 'future'),
    },
    { key: 'today', label: 'Today', value: point.marketValue },
    { key: 'future5', label: 'Future year 5', value: year5 },
  ];

  const retention = clamp((point.marketValue / input.originalPrice) * 100, 0, 100);
  const retentionRounded = round1(retention);
  const lostRounded = round1(100 - retentionRounded);

  const adjustments: Record<string, number> = {};
  for (const line of point.lines) adjustments[line.key] = line.amount;

  const score =
    settings.enableResaleValueScore && input.modelId
      ? settings.resaleScoresByModelId[input.modelId]
      : undefined;

  return {
    originalPrice: roundRupee(input.originalPrice),
    baseDepreciatedValue: point.baseDepreciatedValue,
    adjustments,
    adjustmentLines: point.lines,
    marketValue: point.marketValue,
    lowEstimate: low,
    highEstimate: high,
    depreciationAmount: Math.max(0, roundRupee(input.originalPrice) - point.marketValue),
    valueRetentionPercentage: retentionRounded,
    valueLostPercentage: lostRounded,
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    confidenceNote: RESALE_CONFIDENCE_NOTE,
    confidenceSuggestions: confidence.suggestions,
    futureValues: {
      today: point.marketValue,
      year1,
      year2,
      year3,
      year5,
    },
    timeline,
    next12Months: {
      value: year1,
      depreciation: depreciation12,
      perMonth: roundRupee(depreciation12 / 12),
    },
    vehicleAgeYears: input.ageYears,
    ageApproximate: Boolean(input.ageApproximate),
    kilometres: roundRupee(input.kilometres),
    expectedKilometres: point.expectedKilometres,
    owners: input.owners,
    resaleValueScore:
      score != null && Number.isFinite(Number(score)) ? clamp(Number(score), 0, 10) : null,
    discontinued: Boolean(input.discontinued),
    assumptionsNote: RESALE_ASSUMPTIONS_NOTE,
  };
}

export const resaleValueService = {
  calculate: calculateResaleValue,
  vehicleAgeYears,
};
