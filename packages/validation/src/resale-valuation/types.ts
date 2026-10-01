/** Fallback resale valuation types. Rates are planning assumptions, not market quotes. */

export const RESALE_FUELS = [
  'petrol',
  'diesel',
  'cng',
  'lpg',
  'electric',
  'hybrid',
  'plugin_hybrid',
  'unknown',
] as const;

export type ResaleFuel = (typeof RESALE_FUELS)[number];

export const RESALE_SEGMENTS = [
  'hatchback',
  'sedan',
  'suv',
  'muv',
  'luxury',
  'sports',
  'ev',
  'hybrid',
  'pickup',
  'commercial',
  'unknown',
] as const;

export type ResaleSegment = (typeof RESALE_SEGMENTS)[number];

export const RESALE_TRANSMISSIONS = ['manual', 'automatic', 'single_speed', 'unknown'] as const;

export type ResaleTransmission = (typeof RESALE_TRANSMISSIONS)[number];

export type ResaleOwnerCount = 1 | 2 | 3 | 4;

export type ResaleOverallCondition = 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';

export type ResaleDetailCondition = 'excellent' | 'good' | 'average' | 'poor';

export type ResaleServiceHistory = 'authorised' | 'complete' | 'partial' | 'none';

export type ResaleAccidentHistory = 'none' | 'minor' | 'major' | 'structural';

export type ResaleInsuranceStatus = 'comprehensive' | 'third_party' | 'expired';

export type ResaleRcStatus = 'valid' | 'expired';

export type ResaleDetailRatings = {
  exterior?: ResaleDetailCondition | null;
  interior?: ResaleDetailCondition | null;
  tyres?: ResaleDetailCondition | null;
  engine?: ResaleDetailCondition | null;
  transmission?: ResaleDetailCondition | null;
  electrical?: ResaleDetailCondition | null;
  ac?: ResaleDetailCondition | null;
};

export type ResaleConditionToggles = {
  fullServiceHistory?: boolean;
  originalPaint?: boolean;
  recentTyres?: boolean;
  validInsurance?: boolean;
  majorAccident?: boolean;
  floodDamage?: boolean;
  chassisDamage?: boolean;
};

export type ResaleValuationInput = {
  originalPrice: number;
  priceSource: 'catalog' | 'manual';
  /** Completed years and fraction. Use vehicleAgeYears() for calendar dates. */
  ageYears: number;
  /** True when age used the year-only 1 July approximation. */
  ageApproximate?: boolean;
  kilometres: number;
  owners: ResaleOwnerCount;
  fuel: ResaleFuel;
  transmission: ResaleTransmission;
  segment: ResaleSegment;
  citySlug?: string | null;
  stateSlug?: string | null;
  overallCondition?: ResaleOverallCondition | null;
  details?: ResaleDetailRatings | null;
  toggles?: ResaleConditionToggles | null;
  serviceHistory?: ResaleServiceHistory | null;
  accidentHistory?: ResaleAccidentHistory | null;
  insuranceStatus?: ResaleInsuranceStatus | null;
  rcStatus?: ResaleRcStatus | null;
  discontinued?: boolean;
  variantIdentified?: boolean;
  manufacturerId?: string | null;
  manufacturerSlug?: string | null;
  modelId?: string | null;
  variantId?: string | null;
  batteryHealthPercent?: number | null;
  batteryWarrantyYearsRemaining?: number | null;
  batteryReplaced?: boolean | null;
};

export type ResaleAdjustmentLine = {
  key: string;
  label: string;
  amount: number;
};

export type ResaleConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LIMITED';

export type ResaleTimelinePoint = {
  key: string;
  label: string;
  value: number;
};

export type ResaleValuationResult = {
  originalPrice: number;
  baseDepreciatedValue: number;
  adjustments: Record<string, number>;
  adjustmentLines: ResaleAdjustmentLine[];
  marketValue: number;
  lowEstimate: number;
  highEstimate: number;
  depreciationAmount: number;
  valueRetentionPercentage: number;
  valueLostPercentage: number;
  confidenceScore: number;
  confidenceLevel: ResaleConfidenceLevel;
  confidenceNote: string;
  confidenceSuggestions: string[];
  futureValues: {
    today: number;
    year1: number;
    year2: number;
    year3: number;
    year5: number;
  };
  timeline: ResaleTimelinePoint[];
  next12Months: {
    value: number;
    depreciation: number;
    perMonth: number;
  };
  vehicleAgeYears: number;
  ageApproximate: boolean;
  kilometres: number;
  expectedKilometres: number;
  owners: ResaleOwnerCount;
  resaleValueScore: number | null;
  discontinued: boolean;
  assumptionsNote: string;
};

export type ResaleConfigRow = {
  type: string;
  key: string;
  value: number | string;
  segment?: string | null;
  fuelType?: string | null;
  manufacturerId?: string | null;
  modelId?: string | null;
  variantId?: string | null;
  minValue?: number | string | null;
  maxValue?: number | string | null;
};

export type MileageBand = { maxRatio: number; percent: number };

export type ResaleValuationSettings = {
  schedule: {
    early: number[];
    longTermStart: number;
    longTermDecline: number;
    longTermFloor: number;
    minAnnualRate: number;
    maxAnnualRate: number;
  };
  segmentMultipliers: Record<ResaleSegment, number>;
  fuelMultipliers: Record<ResaleFuel, number>;
  brandMultipliersById: Record<string, number>;
  brandMultipliersBySlug: Record<string, number>;
  modelMultipliersById: Record<string, number>;
  expectedKmPerYear: Record<ResaleFuel, number>;
  mileageBands: MileageBand[];
  mileageCap: number;
  ownershipPercent: Record<ResaleOwnerCount, number>;
  ownershipCap: number;
  conditionOverall: Record<ResaleOverallCondition, number>;
  conditionDetail: Record<ResaleDetailCondition, number>;
  conditionDetailCap: number;
  originalPaint: number;
  recentTyres: number;
  servicePercent: Record<ResaleServiceHistory, number>;
  accidentPercent: Record<ResaleAccidentHistory, number>;
  floodPercent: number;
  chassisPercent: number;
  majorAccidentToggle: number;
  accidentCap: number;
  insurancePercent: Record<ResaleInsuranceStatus, number>;
  validInsuranceToggle: number;
  rcExpiredPercent: number;
  transmissionAutomatic: number;
  discontinuedPercent: number;
  cityAdjustments: Record<string, number>;
  stateAdjustments: Record<string, number>;
  locationCap: number;
  batteryExcellent: number;
  batteryFair: number;
  batteryPoor: number;
  batteryReplaced: number;
  batteryWarrantyLong: number;
  batteryWarrantyExpired: number;
  batteryCap: number;
  minRetention: number;
  maxRetention: number;
  spread: { high: number; medium: number; limited: number };
  /** Scores stay hidden until this is turned on and a model score exists. */
  enableResaleValueScore: boolean;
  resaleScoresByModelId: Record<string, number>;
};
