import type { PrismaClient } from '@prisma/client';

/** Draft rows only. Nothing here is a verified tariff, price, or subsidy. */
export async function seedSolarReferences(prisma: PrismaClient) {
  const existing = await prisma.solarReference.count();
  if (existing > 0) return;

  const now = new Date();
  await prisma.solarReference.createMany({
    data: [
      {
        kind: 'DEFAULTS',
        status: 'DRAFT',
        title: 'Illustrative national planning defaults',
        payload: {
          degradationPercent: 0.7,
          maintenancePerKw: 800,
          selfConsumptionPercent: 70,
          exportRatePerKwh: 0,
          tariffEscalationPercent: 3,
          lifetimeYears: 25,
          inverterReplacementYear: 12,
          inverterReplacementShare: 0.12,
          rooftopSqftPerKw: 80,
        },
        sourceLabel: 'Varnarc planning assumption — not an official dataset',
        createdAt: now,
        updatedAt: now,
      },
      {
        kind: 'LOCATION',
        status: 'DRAFT',
        title: 'Illustrative yield — Bengaluru',
        state: 'Karnataka',
        city: 'Bengaluru',
        payload: { annualYieldKwhPerKw: 1500 },
        sourceLabel: 'Illustrative planning yield, pending a cited irradiance source',
        createdAt: now,
        updatedAt: now,
      },
      {
        kind: 'TARIFF',
        status: 'DRAFT',
        title: 'Illustrative residential energy charge',
        state: 'Karnataka',
        payload: {
          discom: 'Unspecified',
          consumerCategory: 'Domestic',
          energyChargePerKwh: 8,
          fixedMonthlyCharge: 0,
        },
        sourceLabel: 'Illustrative rate — replace with a DISCOM tariff order before publishing',
        createdAt: now,
        updatedAt: now,
      },
      {
        kind: 'INSTALLATION_PRICE',
        status: 'DRAFT',
        title: 'Illustrative rooftop cost per kW',
        payload: {
          minKw: 1,
          maxKw: 10,
          costPerKw: 55000,
          installationType: 'On-grid rooftop',
        },
        sourceLabel: 'Illustrative planning cost — not a vendor or benchmark quote',
        createdAt: now,
        updatedAt: now,
      },
      {
        kind: 'SUBSIDY',
        status: 'DRAFT',
        title: 'Subsidy placeholder — do not publish without an official source',
        payload: {
          schemeName: 'Unverified scheme placeholder',
          authority: 'Not verified',
          eligibilityNotes:
            'Do not publish until eligibility, capacity bands, and benefit caps are copied from an official notification.',
          minKw: 0,
          maxKw: 3,
          amountPerKw: 0,
          maxBenefit: 0,
        },
        sourceLabel: 'Placeholder only. Official scheme pages should be linked before publish.',
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}
