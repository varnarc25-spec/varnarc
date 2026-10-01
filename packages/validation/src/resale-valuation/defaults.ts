import type { ResaleValuationSettings } from './types';

/**
 * Fallback depreciation assumptions for India when a model has no verified
 * used-market transactions. These are configurable defaults, not guaranteed rates.
 *
 * Age curve is applied to the remaining value each year:
 * year 1 ~18% (within 15–20), year 2 ~12.5% (within 10–15),
 * year 3 ~10% (within 8–12), years 4–5 ~8.5% (within 7–10),
 * then a declining annual rate.
 */
export const DEFAULT_RESALE_SETTINGS: ResaleValuationSettings = {
  schedule: {
    early: [0.18, 0.125, 0.1, 0.085, 0.085],
    longTermStart: 0.07,
    longTermDecline: 0.005,
    longTermFloor: 0.04,
    minAnnualRate: 0.02,
    maxAnnualRate: 0.35,
  },
  segmentMultipliers: {
    hatchback: 0.92,
    sedan: 1,
    suv: 0.86,
    muv: 0.94,
    luxury: 1.22,
    sports: 1.18,
    ev: 1.12,
    hybrid: 1.04,
    pickup: 0.9,
    commercial: 1.08,
    unknown: 1,
  },
  fuelMultipliers: {
    petrol: 1,
    diesel: 1.04,
    cng: 1.05,
    lpg: 1.06,
    electric: 1.08,
    hybrid: 1.02,
    plugin_hybrid: 1.06,
    unknown: 1,
  },
  brandMultipliersById: {},
  brandMultipliersBySlug: {},
  modelMultipliersById: {},
  expectedKmPerYear: {
    petrol: 11_000,
    diesel: 13_500,
    cng: 14_000,
    lpg: 12_000,
    electric: 10_000,
    hybrid: 12_000,
    plugin_hybrid: 12_000,
    unknown: 11_000,
  },
  mileageBands: [
    { maxRatio: 0.55, percent: 0.025 },
    { maxRatio: 0.8, percent: 0.012 },
    { maxRatio: 1.2, percent: 0 },
    { maxRatio: 1.6, percent: -0.02 },
    { maxRatio: 2.2, percent: -0.045 },
    { maxRatio: Number.POSITIVE_INFINITY, percent: -0.07 },
  ],
  mileageCap: 0.08,
  ownershipPercent: {
    1: 0,
    2: -0.025,
    3: -0.05,
    4: -0.075,
  },
  ownershipCap: 0.08,
  conditionOverall: {
    excellent: 0.04,
    very_good: 0.02,
    good: 0,
    fair: -0.05,
    poor: -0.12,
  },
  conditionDetail: {
    excellent: 0.006,
    good: 0,
    average: -0.004,
    poor: -0.012,
  },
  conditionDetailCap: 0.04,
  originalPaint: 0.01,
  recentTyres: 0.005,
  servicePercent: {
    authorised: 0.02,
    complete: 0.012,
    partial: 0,
    none: -0.025,
  },
  accidentPercent: {
    none: 0,
    minor: -0.015,
    major: -0.06,
    structural: -0.12,
  },
  floodPercent: -0.08,
  chassisPercent: -0.1,
  majorAccidentToggle: -0.06,
  accidentCap: 0.2,
  insurancePercent: {
    comprehensive: 0.004,
    third_party: 0,
    expired: -0.008,
  },
  validInsuranceToggle: 0.004,
  rcExpiredPercent: -0.015,
  transmissionAutomatic: 0.012,
  discontinuedPercent: -0.03,
  cityAdjustments: {},
  stateAdjustments: {},
  locationCap: 0.05,
  batteryExcellent: 0.015,
  batteryFair: -0.02,
  batteryPoor: -0.05,
  batteryReplaced: 0.015,
  batteryWarrantyLong: 0.01,
  batteryWarrantyExpired: -0.01,
  batteryCap: 0.08,
  minRetention: 0.08,
  maxRetention: 1,
  spread: { high: 0.04, medium: 0.07, limited: 0.12 },
  enableResaleValueScore: false,
  resaleScoresByModelId: {},
};

export const RESALE_ASSUMPTIONS_NOTE =
  'Illustrative estimate using Varnarc’s fallback depreciation model when verified used-market transactions for this variant are not available. It is not a dealer, exchange or private-sale quotation.';

export const RESALE_CONFIDENCE_NOTE =
  'Valuation confidence reflects the completeness of the information provided.';
