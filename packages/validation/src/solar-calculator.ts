import { z } from 'zod';

/** Planning assumptions. These are not verified government tariffs or subsidies. */
export const SOLAR_ILLUSTRATIVE_DEFAULTS = {
  label: 'Illustrative planning assumption',
  annualYieldKwhPerKw: 1500,
  tariffPerKwh: 8,
  fixedMonthlyCharge: 0,
  costPerKw: 55000,
  selfConsumptionPercent: 70,
  /** Exported units are not paid at the retail tariff. */
  exportRatePerKwh: 0,
  degradationPercent: 0.7,
  maintenancePerKw: 800,
  tariffEscalationPercent: 3,
  lifetimeYears: 25,
  inverterReplacementYear: 12,
  /** Share of gross installation cost, illustrative only. */
  inverterReplacementShare: 0.12,
  rooftopSqftPerKw: 80,
  subsidyAmount: 0,
  subsidyEligible: false,
} as const;

export const SOLAR_SIZES_KW = [1, 2, 3, 4, 5, 6, 8, 10] as const;

export const solarLocationPayloadSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  annualYieldKwhPerKw: z.number().positive().max(3000),
});

export const solarTariffSlabSchema = z.object({
  uptoKwh: z.number().positive().nullable(),
  ratePerKwh: z.number().min(0).max(100),
});

export const solarTariffPayloadSchema = z.object({
  discom: z.string().min(1).max(160),
  consumerCategory: z.string().min(1).max(160),
  energyChargePerKwh: z.number().min(0).max(100),
  fixedMonthlyCharge: z.number().min(0).max(100000).default(0),
  slabs: z.array(solarTariffSlabSchema).max(12).optional(),
});

export const solarPricePayloadSchema = z.object({
  minKw: z.number().positive(),
  maxKw: z.number().positive(),
  costPerKw: z.number().positive().max(500000),
  installationType: z.string().min(1).max(80),
});

export const solarSubsidyPayloadSchema = z.object({
  schemeName: z.string().min(1).max(200),
  authority: z.string().min(1).max(200),
  eligibilityNotes: z.string().min(1).max(2000),
  minKw: z.number().min(0).default(0),
  maxKw: z.number().positive(),
  amountPerKw: z.number().min(0),
  maxBenefit: z.number().min(0),
});

export const solarDefaultsPayloadSchema = z.object({
  degradationPercent: z.number().min(0).max(5),
  maintenancePerKw: z.number().min(0),
  selfConsumptionPercent: z.number().min(0).max(100),
  exportRatePerKwh: z.number().min(0),
  tariffEscalationPercent: z.number().min(0).max(20),
  lifetimeYears: z.number().int().min(1).max(40),
  inverterReplacementYear: z.number().int().min(0).max(40),
  inverterReplacementShare: z.number().min(0).max(1),
  rooftopSqftPerKw: z.number().positive().max(400),
});

export const solarReferenceKindSchema = z.enum([
  'LOCATION',
  'TARIFF',
  'INSTALLATION_PRICE',
  'SUBSIDY',
  'DEFAULTS',
]);

export const solarReferenceWriteSchema = z.object({
  kind: solarReferenceKindSchema,
  status: z.enum(['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  title: z.string().min(1).max(200),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  payload: z.record(z.unknown()),
  sourceUrl: z.string().url().max(500).optional().nullable(),
  sourceLabel: z.string().max(200).optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export type SolarReferenceWrite = z.infer<typeof solarReferenceWriteSchema>;

export function assertSolarPayload(
  kind: z.infer<typeof solarReferenceKindSchema>,
  payload: unknown,
) {
  switch (kind) {
    case 'LOCATION':
      return solarLocationPayloadSchema.parse(payload);
    case 'TARIFF':
      return solarTariffPayloadSchema.parse(payload);
    case 'INSTALLATION_PRICE':
      return solarPricePayloadSchema.parse(payload);
    case 'SUBSIDY':
      return solarSubsidyPayloadSchema.parse(payload);
    case 'DEFAULTS':
      return solarDefaultsPayloadSchema.parse(payload);
    default:
      return payload;
  }
}

export const solarCalculateInputSchema = z.object({
  state: z.string().min(1).max(80),
  city: z.string().min(1).max(80),
  monthlyBill: z.number().min(0).max(10_000_000),
  systemKw: z.number().positive().max(100),
  monthlyKwh: z.number().min(0).max(100_000).optional(),
  tariffPerKwh: z.number().min(0).max(100).optional(),
  rooftopSqft: z.number().min(0).max(100_000).optional(),
  installationCost: z.number().min(0).max(100_000_000).optional(),
  selfConsumptionPercent: z.number().min(0).max(100).optional(),
  exportRatePerKwh: z.number().min(0).max(100).optional(),
  yieldKwhPerKwYear: z.number().positive().max(3000).optional(),
  degradationPercent: z.number().min(0).max(5).optional(),
  annualMaintenance: z.number().min(0).max(10_000_000).optional(),
  tariffEscalationPercent: z.number().min(0).max(20).optional(),
  financeEnabled: z.boolean().optional(),
  interestRatePercent: z.number().min(0).max(40).optional(),
  tenureYears: z.number().int().min(1).max(30).optional(),
  subsidyEligible: z.boolean().optional(),
  subsidyAmount: z.number().min(0).optional(),
  fixedMonthlyCharge: z.number().min(0).optional(),
});

export type SolarCalculateInput = z.infer<typeof solarCalculateInputSchema>;

export type SolarAssumptions = {
  annualYieldKwhPerKw: number;
  tariffPerKwh: number;
  fixedMonthlyCharge: number;
  costPerKw: number;
  selfConsumptionPercent: number;
  exportRatePerKwh: number;
  degradationPercent: number;
  maintenancePerKw: number;
  tariffEscalationPercent: number;
  lifetimeYears: number;
  inverterReplacementYear: number;
  inverterReplacementShare: number;
  rooftopSqftPerKw: number;
  subsidyEligible: boolean;
  subsidyAmount: number;
  usingPublishedLocation: boolean;
  usingPublishedTariff: boolean;
  usingPublishedPrice: boolean;
  usingPublishedSubsidy: boolean;
  warnings: string[];
};

export type SolarYear = {
  year: number;
  generationKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  tariffPerKwh: number;
  grossElectricitySavings: number;
  maintenance: number;
  replacement: number;
  financePayment: number;
  netOperatingSavings: number;
  netCashFlow: number;
  cumulativeNet: number;
};

export type SolarResult = {
  assumptions: SolarAssumptions;
  annualConsumptionKwh: number;
  annualGenerationKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  grossInstallationCost: number;
  subsidyApplied: number;
  netInstallationCost: number;
  monthlySavings: number;
  annualGrossSavings: number;
  annualNetOperatingSavings: number;
  paybackLabel: string;
  paybackYears: number | null;
  lifetimeGrossSavings: number;
  lifetimeNetBenefit: number;
  billBefore: number;
  billAfter: number;
  years: SolarYear[];
  rooftopSqft: number;
};

export type TariffSlab = { uptoKwh: number | null; ratePerKwh: number };

export function slabCost(
  monthlyKwh: number,
  slabs: TariffSlab[] | undefined,
  flatRate: number,
): number {
  const kwh = Math.max(0, monthlyKwh);
  if (!slabs?.length) return kwh * flatRate;
  const ordered = [...slabs].sort((a, b) => {
    if (a.uptoKwh == null) return 1;
    if (b.uptoKwh == null) return -1;
    return a.uptoKwh - b.uptoKwh;
  });
  let remaining = kwh;
  let prev = 0;
  let cost = 0;
  for (const slab of ordered) {
    const cap = slab.uptoKwh == null ? Number.POSITIVE_INFINITY : slab.uptoKwh;
    const width = Math.max(0, cap - prev);
    const used = Math.min(remaining, width);
    cost += used * slab.ratePerKwh;
    remaining -= used;
    prev = cap;
    if (remaining <= 0) break;
  }
  if (remaining > 0) cost += remaining * flatRate;
  return cost;
}

function annuityPayment(principal: number, annualRatePercent: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRatePercent / 100;
  if (r === 0) return principal / years;
  const factor = Math.pow(1 + r, years);
  return (principal * r * factor) / (factor - 1);
}

export function suggestSystemKw(annualConsumptionKwh: number, yieldKwhPerKw: number): number {
  if (annualConsumptionKwh <= 0 || yieldKwhPerKw <= 0) return 1;
  const raw = annualConsumptionKwh / yieldKwhPerKw;
  const stepped = Math.round(raw * 2) / 2;
  return Math.min(10, Math.max(1, stepped));
}

export function calculateSolar(
  raw: SolarCalculateInput,
  base?: Partial<SolarAssumptions>,
): SolarResult {
  const input = solarCalculateInputSchema.parse(raw);
  const d = SOLAR_ILLUSTRATIVE_DEFAULTS;
  const warnings: string[] = [];
  const assumptions: SolarAssumptions = {
    annualYieldKwhPerKw:
      input.yieldKwhPerKwYear ?? base?.annualYieldKwhPerKw ?? d.annualYieldKwhPerKw,
    tariffPerKwh: input.tariffPerKwh ?? base?.tariffPerKwh ?? d.tariffPerKwh,
    fixedMonthlyCharge:
      input.fixedMonthlyCharge ?? base?.fixedMonthlyCharge ?? d.fixedMonthlyCharge,
    costPerKw: base?.costPerKw ?? d.costPerKw,
    selfConsumptionPercent:
      input.selfConsumptionPercent ?? base?.selfConsumptionPercent ?? d.selfConsumptionPercent,
    exportRatePerKwh: input.exportRatePerKwh ?? base?.exportRatePerKwh ?? d.exportRatePerKwh,
    degradationPercent:
      input.degradationPercent ?? base?.degradationPercent ?? d.degradationPercent,
    maintenancePerKw: base?.maintenancePerKw ?? d.maintenancePerKw,
    tariffEscalationPercent:
      input.tariffEscalationPercent ?? base?.tariffEscalationPercent ?? d.tariffEscalationPercent,
    lifetimeYears: base?.lifetimeYears ?? d.lifetimeYears,
    inverterReplacementYear: base?.inverterReplacementYear ?? d.inverterReplacementYear,
    inverterReplacementShare: base?.inverterReplacementShare ?? d.inverterReplacementShare,
    rooftopSqftPerKw: base?.rooftopSqftPerKw ?? d.rooftopSqftPerKw,
    subsidyEligible: input.subsidyEligible ?? base?.subsidyEligible ?? false,
    subsidyAmount: input.subsidyAmount ?? base?.subsidyAmount ?? 0,
    usingPublishedLocation: base?.usingPublishedLocation ?? false,
    usingPublishedTariff: base?.usingPublishedTariff ?? false,
    usingPublishedPrice: base?.usingPublishedPrice ?? false,
    usingPublishedSubsidy: base?.usingPublishedSubsidy ?? false,
    warnings,
  };

  if (!assumptions.usingPublishedLocation) {
    warnings.push(
      'Annual solar yield is an illustrative planning figure, not a site-measured value.',
    );
  }
  if (!assumptions.usingPublishedTariff) {
    warnings.push(
      'Electricity tariff is an illustrative planning rate, not a DISCOM tariff order.',
    );
  }
  if (!assumptions.usingPublishedPrice) {
    warnings.push(
      'Installation cost per kW is an illustrative planning assumption, not a vendor quote.',
    );
  }
  if (!assumptions.subsidyEligible || assumptions.subsidyAmount <= 0) {
    warnings.push(
      'No subsidy is applied unless an eligible, published scheme matches this system.',
    );
  }
  warnings.push(
    'Exported electricity is valued at the export rate, which is not the retail tariff.',
  );

  const annualConsumptionKwh =
    input.monthlyKwh != null && input.monthlyKwh > 0
      ? input.monthlyKwh * 12
      : assumptions.tariffPerKwh > 0
        ? (input.monthlyBill / assumptions.tariffPerKwh) * 12
        : 0;

  const annualGenerationKwh = input.systemKw * assumptions.annualYieldKwhPerKw;
  const grossInstallationCost =
    input.installationCost != null && input.installationCost > 0
      ? input.installationCost
      : input.systemKw * assumptions.costPerKw;
  const subsidyApplied = assumptions.subsidyEligible
    ? Math.min(assumptions.subsidyAmount, grossInstallationCost)
    : 0;
  const netInstallationCost = Math.max(0, grossInstallationCost - subsidyApplied);
  const annualMaintenance =
    input.annualMaintenance ?? input.systemKw * assumptions.maintenancePerKw;
  const rooftopSqft =
    input.rooftopSqft && input.rooftopSqft > 0
      ? input.rooftopSqft
      : input.systemKw * assumptions.rooftopSqftPerKw;

  const financeYears = input.tenureYears ?? 10;
  const annualFinance = input.financeEnabled
    ? annuityPayment(netInstallationCost, input.interestRatePercent ?? 0, financeYears)
    : 0;

  const years: SolarYear[] = [];
  let cumulative = input.financeEnabled ? 0 : -netInstallationCost;
  let paybackYears: number | null = input.financeEnabled && netInstallationCost === 0 ? 0 : null;
  if (!input.financeEnabled && netInstallationCost === 0) paybackYears = 0;

  let lifetimeGross = 0;
  let firstYearNet = 0;

  for (let year = 1; year <= assumptions.lifetimeYears; year++) {
    const generationKwh =
      annualGenerationKwh * Math.pow(1 - assumptions.degradationPercent / 100, year - 1);
    const desiredSelf = generationKwh * (assumptions.selfConsumptionPercent / 100);
    const selfConsumedKwh = Math.min(desiredSelf, annualConsumptionKwh);
    const exportedKwh = Math.max(0, generationKwh - selfConsumedKwh);
    const importedKwh = Math.max(0, annualConsumptionKwh - selfConsumedKwh);
    const tariff =
      assumptions.tariffPerKwh * Math.pow(1 + assumptions.tariffEscalationPercent / 100, year - 1);
    const avoided = selfConsumedKwh * tariff;
    const exportCredit = exportedKwh * assumptions.exportRatePerKwh;
    const grossElectricitySavings = avoided + exportCredit;
    const replacement =
      assumptions.inverterReplacementYear === year
        ? grossInstallationCost * assumptions.inverterReplacementShare
        : 0;
    const financePayment = input.financeEnabled && year <= financeYears ? annualFinance : 0;
    const netOperatingSavings = grossElectricitySavings - annualMaintenance - replacement;
    const netCashFlow = netOperatingSavings - financePayment;
    const previous = cumulative;
    cumulative += netCashFlow;
    if (paybackYears == null && previous < 0 && cumulative >= 0 && netCashFlow > 0) {
      paybackYears = year - 1 + -previous / netCashFlow;
    }
    if (year === 1) firstYearNet = netOperatingSavings;
    lifetimeGross += grossElectricitySavings;
    years.push({
      year,
      generationKwh,
      selfConsumedKwh,
      exportedKwh,
      importedKwh,
      tariffPerKwh: tariff,
      grossElectricitySavings,
      maintenance: annualMaintenance,
      replacement,
      financePayment,
      netOperatingSavings,
      netCashFlow,
      cumulativeNet: cumulative,
    });
  }

  const lifetimeNetBenefit = cumulative;
  const paybackLabel =
    paybackYears == null
      ? `Not reached within ${assumptions.lifetimeYears} years.`
      : `${paybackYears.toFixed(1)} years`;

  const year1 = years[0];
  const billBefore = input.monthlyBill;
  const monthlySavings = (year1?.netOperatingSavings ?? 0) / 12;
  const billAfter = Math.max(0, billBefore - (year1 ? year1.grossElectricitySavings / 12 : 0));

  return {
    assumptions,
    annualConsumptionKwh,
    annualGenerationKwh,
    selfConsumedKwh: year1?.selfConsumedKwh ?? 0,
    exportedKwh: year1?.exportedKwh ?? 0,
    importedKwh: year1?.importedKwh ?? 0,
    grossInstallationCost,
    subsidyApplied,
    netInstallationCost,
    monthlySavings,
    annualGrossSavings: year1?.grossElectricitySavings ?? 0,
    annualNetOperatingSavings: firstYearNet,
    paybackLabel,
    paybackYears,
    lifetimeGrossSavings: lifetimeGross,
    lifetimeNetBenefit,
    billBefore,
    billAfter,
    years,
    rooftopSqft,
  };
}

export function compareSystemSizes(
  input: SolarCalculateInput,
  base?: Partial<SolarAssumptions>,
  sizes: readonly number[] = SOLAR_SIZES_KW,
) {
  return sizes.map((systemKw) => {
    const row = calculateSolar({ ...input, systemKw, installationCost: undefined }, base);
    return {
      systemKw,
      rooftopSqft: row.rooftopSqft,
      installationCost: row.grossInstallationCost,
      subsidy: row.subsidyApplied,
      annualGenerationKwh: row.annualGenerationKwh,
      annualSavings: row.annualNetOperatingSavings,
      paybackLabel: row.paybackLabel,
    };
  });
}
