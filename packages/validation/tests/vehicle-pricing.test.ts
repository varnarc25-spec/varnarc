import { describe, expect, it } from 'vitest';
import {
  auditMigratedVehicles,
  currencyMatchesMarket,
  formatIndianVehiclePrice,
  migrateVehiclePricingRecord,
  vehiclePriceInputSchema,
} from '../src/vehicle-pricing';

describe('formatIndianVehiclePrice', () => {
  it('formats rupees, lakhs, and crores', () => {
    expect(formatIndianVehiclePrice(95000)).toBe('₹95,000');
    expect(formatIndianVehiclePrice(499000)).toBe('₹4.99 Lakh');
    expect(formatIndianVehiclePrice(1499000)).toBe('₹14.99 Lakh');
    expect(formatIndianVehiclePrice(10500000)).toBe('₹1.05 Crore');
    expect(formatIndianVehiclePrice(25000000)).toBe('₹2.50 Crore');
  });
});

describe('migrateVehiclePricingRecord', () => {
  it('moves a GBP ex-showroom figure into UK pricing and leaves India empty', () => {
    const result = migrateVehiclePricingRecord({
      slug: 'kia-ev6-gt-line-s',
      name: 'Kia EV6 GT-Line S',
      exShowroomPrice: 27245,
      market: 'United Kingdom',
      currency: 'GBP',
      availableInIndia: true,
      specifications: {
        prices: {
          currency: 'GBP',
          amount: 27245,
          sourceUrl: 'https://www.kia.com/uk/price-list.pdf',
          verifiedDate: '2026-09-25',
        },
        exShowroomPrice: 27245,
        images: [{ url: 'https://www.kia.com/uk/ev6', type: 'manufacturer_gallery' }],
      },
    });
    expect(result.vehicle.exShowroomPrice).toBeNull();
    expect(result.vehicle.availableInIndia).toBe(true);
    expect(result.indiaAvailability).toBe('UNVERIFIED');
    const pricing = result.vehicle.pricing as {
      india: { exShowroomPrice: null; currency: string };
      uk: { otrPrice: number; currency: string };
    };
    expect(pricing.india.exShowroomPrice).toBeNull();
    expect(pricing.india.currency).toBe('INR');
    expect(pricing.uk.otrPrice).toBe(27245);
    expect(pricing.uk.currency).toBe('GBP');
    expect((result.vehicle.specifications as { exShowroomPrice: null }).exShowroomPrice).toBeNull();
    expect(result.flags.ukPricePreserved).toBe(true);
    expect(result.flags.indiaPriceFound).toBe(false);
    expect(result.flags.missingManufacturerImage).toBe(true);
  });
});

describe('vehicle price validation', () => {
  it('rejects a GBP currency on the India market', () => {
    expect(currencyMatchesMarket('IN', 'GBP')).toBe(false);
    const parsed = vehiclePriceInputSchema.safeParse({
      countryCode: 'IN',
      currencyCode: 'GBP',
      priceType: 'EX_SHOWROOM',
      amount: 27245,
      available: true,
      verified: false,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('auditMigratedVehicles', () => {
  it('counts unverified India rows separately from confirmed availability', () => {
    const migration = migrateVehiclePricingRecord({
      slug: 'volvo-ex30',
      exShowroomPrice: 40000,
      currency: 'GBP',
      market: 'United Kingdom',
    });
    const audit = auditMigratedVehicles([{ slug: 'volvo-ex30', migration }]);
    expect(audit.totalVehicles).toBe(1);
    expect(audit.ukPricesPreserved).toBe(1);
    expect(audit.indiaPricesFound).toBe(0);
    expect(audit.indiaExactVariantAvailable).toBe(0);
    expect(audit.unverifiedIndiaAvailability).toBe(1);
    expect(audit.requiresManualVerification).toEqual(['volvo-ex30']);
  });
});
