import { DEFAULT_RESALE_SETTINGS } from './defaults';
import type {
  ResaleAccidentHistory,
  ResaleConfigRow,
  ResaleDetailCondition,
  ResaleFuel,
  ResaleInsuranceStatus,
  ResaleOverallCondition,
  ResaleOwnerCount,
  ResaleSegment,
  ResaleServiceHistory,
  ResaleValuationSettings,
} from './types';
import { RESALE_FUELS, RESALE_SEGMENTS } from './types';

function num(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function clampRow(value: number, row: ResaleConfigRow): number {
  const min = num(row.minValue);
  const max = num(row.maxValue);
  let next = value;
  if (min != null) next = Math.max(min, next);
  if (max != null) next = Math.min(max, next);
  return next;
}

function isFuel(value: string): value is ResaleFuel {
  return (RESALE_FUELS as readonly string[]).includes(value);
}

function isSegment(value: string): value is ResaleSegment {
  return (RESALE_SEGMENTS as readonly string[]).includes(value);
}

/** Apply active admin rows on top of the fallback settings. Unknown rows are ignored. */
export function mergeResaleConfigRows(
  rows: ResaleConfigRow[],
  base: ResaleValuationSettings = DEFAULT_RESALE_SETTINGS,
): ResaleValuationSettings {
  const settings: ResaleValuationSettings = {
    ...base,
    schedule: { ...base.schedule, early: [...base.schedule.early] },
    segmentMultipliers: { ...base.segmentMultipliers },
    fuelMultipliers: { ...base.fuelMultipliers },
    brandMultipliersById: { ...base.brandMultipliersById },
    brandMultipliersBySlug: { ...base.brandMultipliersBySlug },
    modelMultipliersById: { ...base.modelMultipliersById },
    expectedKmPerYear: { ...base.expectedKmPerYear },
    mileageBands: base.mileageBands.map((band) => ({ ...band })),
    ownershipPercent: { ...base.ownershipPercent },
    conditionOverall: { ...base.conditionOverall },
    conditionDetail: { ...base.conditionDetail },
    servicePercent: { ...base.servicePercent },
    accidentPercent: { ...base.accidentPercent },
    insurancePercent: { ...base.insurancePercent },
    cityAdjustments: { ...base.cityAdjustments },
    stateAdjustments: { ...base.stateAdjustments },
    spread: { ...base.spread },
    resaleScoresByModelId: { ...base.resaleScoresByModelId },
  };

  for (const row of rows) {
    const value = num(row.value);
    if (value == null) continue;
    const applied = clampRow(value, row);
    const key = row.key.trim();
    const type = row.type.trim();

    if (type === 'depreciation_schedule' && /^year[1-5]$/.test(key)) {
      const index = Number(key.slice(4)) - 1;
      settings.schedule.early[index] = applied;
    } else if (type === 'depreciation_schedule' && key === 'longTermStart') {
      settings.schedule.longTermStart = applied;
    } else if (type === 'depreciation_schedule' && key === 'longTermDecline') {
      settings.schedule.longTermDecline = applied;
    } else if (type === 'depreciation_schedule' && key === 'longTermFloor') {
      settings.schedule.longTermFloor = applied;
    } else if (type === 'segment') {
      const segment = (row.segment || key).trim();
      if (isSegment(segment)) settings.segmentMultipliers[segment] = applied;
    } else if (type === 'fuel') {
      const fuel = (row.fuelType || key).trim();
      if (isFuel(fuel)) settings.fuelMultipliers[fuel] = applied;
    } else if (type === 'brand' && row.manufacturerId) {
      settings.brandMultipliersById[row.manufacturerId] = applied;
    } else if (type === 'brand_slug' && key) {
      settings.brandMultipliersBySlug[key] = applied;
    } else if (type === 'model' && row.modelId) {
      settings.modelMultipliersById[row.modelId] = applied;
    } else if (type === 'expected_km') {
      const fuel = (row.fuelType || key).trim();
      if (isFuel(fuel)) settings.expectedKmPerYear[fuel] = applied;
    } else if (type === 'mileage_band') {
      const maxRatio = Number(key);
      if (Number.isFinite(maxRatio)) {
        const existing = settings.mileageBands.find((band) => band.maxRatio === maxRatio);
        if (existing) existing.percent = applied;
        else settings.mileageBands.push({ maxRatio, percent: applied });
        settings.mileageBands.sort((a, b) => a.maxRatio - b.maxRatio);
      }
    } else if (type === 'ownership' && ['1', '2', '3', '4'].includes(key)) {
      settings.ownershipPercent[Number(key) as ResaleOwnerCount] = applied;
    } else if (type === 'condition') {
      settings.conditionOverall[key as ResaleOverallCondition] = applied;
    } else if (type === 'condition_detail') {
      settings.conditionDetail[key as ResaleDetailCondition] = applied;
    } else if (type === 'service') {
      settings.servicePercent[key as ResaleServiceHistory] = applied;
    } else if (type === 'accident') {
      settings.accidentPercent[key as ResaleAccidentHistory] = applied;
    } else if (type === 'insurance') {
      settings.insurancePercent[key as ResaleInsuranceStatus] = applied;
    } else if (type === 'city' && key) {
      settings.cityAdjustments[key] = applied;
    } else if (type === 'state' && key) {
      settings.stateAdjustments[key] = applied;
    } else if (type === 'limit' && key === 'minRetention') {
      settings.minRetention = applied;
    } else if (type === 'limit' && key === 'maxRetention') {
      settings.maxRetention = applied;
    } else if (type === 'limit' && key === 'mileageCap') {
      settings.mileageCap = applied;
    } else if (type === 'limit' && key === 'ownershipCap') {
      settings.ownershipCap = applied;
    } else if (type === 'limit' && key === 'accidentCap') {
      settings.accidentCap = applied;
    } else if (type === 'limit' && key === 'locationCap') {
      settings.locationCap = applied;
    } else if (type === 'spread' && (key === 'high' || key === 'medium' || key === 'limited')) {
      settings.spread[key] = applied;
    } else if (type === 'transmission' && key === 'automatic') {
      settings.transmissionAutomatic = applied;
    } else if (type === 'discontinued') {
      settings.discontinuedPercent = applied;
    } else if (type === 'feature' && key === 'enableResaleValueScore') {
      settings.enableResaleValueScore = applied >= 1;
    } else if (type === 'resale_score' && row.modelId) {
      settings.resaleScoresByModelId[row.modelId] = applied;
    }
  }

  return settings;
}

export type ResaleProgrammaticSubject =
  | {
      kind: 'model';
      manufacturerSlug: string;
      modelSlug: string;
      manufacturerName: string;
      modelName: string;
    }
  | { kind: 'city'; citySlug: string; cityName: string };

/** Draft metadata for a future programmatic page. No route is published from this. */
export function resaleProgrammaticDraft(subject: ResaleProgrammaticSubject): {
  path: null;
  title: string;
  h1: string;
  ready: false;
  reason: string;
} {
  const h1 =
    subject.kind === 'model'
      ? `${subject.manufacturerName} ${subject.modelName} resale value`
      : `Car resale value in ${subject.cityName}`;
  return {
    path: null,
    title: h1,
    h1,
    ready: false,
    reason:
      'Programmatic resale pages stay unpublished until unique market data and copy exist for this subject.',
  };
}
