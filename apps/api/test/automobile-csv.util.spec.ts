import { describe, expect, it } from 'vitest';
import {
  detectAutomobileCsvEntity,
  manufacturerImportData,
  parseCsv,
  parseVehicleDetailsJson,
  slugify,
} from '../src/modules/automobile/automobile-csv.util';

describe('automobile-csv.util', () => {
  it('parses quoted commas', () => {
    const rows = parseCsv('name,model\n"Swift, VXI",Swift');
    expect(rows).toEqual([{ name: 'Swift, VXI', model: 'Swift' }]);
  });

  it('detects entity from filename and headers', () => {
    expect(detectAutomobileCsvEntity('automobile_manufacturers.csv', ['name', 'slug'])).toBe(
      'manufacturers',
    );
    expect(detectAutomobileCsvEntity('acura-specifications.csv', ['make', 'model'])).toBe('specs');
    expect(detectAutomobileCsvEntity('photos.csv', ['vehicleSlug', 'imageUrl'])).toBe(
      'vehicle-images',
    );
    expect(detectAutomobileCsvEntity('links.csv', ['vehicleSlug', 'reviewSlug'])).toBe(
      'vehicle-reviews',
    );
  });

  it('maps manufacturer India columns onto existing rows', () => {
    const data = manufacturerImportData({
      name: 'Hyundai',
      slug: 'hyundai',
      country: 'South Korea',
      website: 'https://www.hyundai.com/in',
      status: 'PUBLISHED',
      featured: 'True',
      availableInIndia: 'True',
      indiaAvailabilityStatus: 'OFFICIALLY_AVAILABLE',
      indiaWebsite: 'https://www.hyundai.com/in/en',
      indiaVerifiedDate: '2026-09-28',
      indiaVerificationNote: 'Official/current India retail presence verified for 2026.',
    });
    expect(data).toMatchObject({
      name: 'Hyundai',
      slug: 'hyundai',
      featured: true,
      availableInIndia: true,
      indiaAvailabilityStatus: 'OFFICIALLY_AVAILABLE',
      indiaWebsite: 'https://www.hyundai.com/in/en',
      indiaVerifiedAt: new Date('2026-09-28T00:00:00.000Z'),
    });
  });

  it('leaves India fields untouched when the CSV has no India columns', () => {
    const data = manufacturerImportData({
      name: 'Hyundai',
      slug: 'hyundai',
      status: 'PUBLISHED',
    });
    expect(data).not.toHaveProperty('availableInIndia');
    expect(data).not.toHaveProperty('featured');
    expect(data).not.toHaveProperty('indiaAvailabilityStatus');
    expect(data).not.toHaveProperty('tagline');
  });

  it('slugifies names', () => {
    expect(slugify('Maruti Suzuki Swift VXI')).toBe('maruti-suzuki-swift-vxi');
  });

  it('maps vehicle-details JSON into import rows', () => {
    const rows = parseVehicleDetailsJson(
      JSON.stringify({
        success: true,
        data: [
          {
            originalName: 'HYUNDAI Tucson 1.6L T-GDI',
            name: '1.6L T-GDI',
            slug: 'hyundai-tucson-16l',
            modelYear: 2018,
            fuelType: 'Petrol',
            'model.name': 'Tucson',
            'model.brand.name': 'Hyundai',
            'model.brand.slug': 'hyundai',
            'engine.maxPowerBhp': 177,
          },
        ],
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'HYUNDAI Tucson 1.6L T-GDI',
      model: 'Tucson',
      manufacturer: 'Hyundai',
      manufacturerSlug: 'hyundai',
      horsepower: '177',
      status: 'DRAFT',
    });
  });

  it('maps complete vehicle JSON with a nested manufacturer', () => {
    const rows = parseVehicleDetailsJson(
      JSON.stringify({
        success: true,
        data: [
          {
            name: 'LEXUS RX RX 450h+ Premium Plus',
            slug: 'lexus-rx-rx-450h',
            model: '450h+ Premium Plus',
            variant: 'MY26',
            status: 'VERIFIED',
            fuelType: 'Hybrid',
            exShowroomPrice: 72345,
            market: 'United Kingdom',
            currency: 'GBP',
            availableInIndia: true,
            manufacturer: { name: 'Lexus', slug: 'lexus' },
          },
        ],
      }),
    );
    expect(rows[0]).toMatchObject({
      name: 'LEXUS RX RX 450h+ Premium Plus',
      model: '450h+ Premium Plus',
      variant: 'MY26',
      manufacturer: 'Lexus',
      manufacturerSlug: 'lexus',
      slug: 'lexus-rx-rx-450h',
      fuelType: 'Hybrid',
      exShowroomPrice: '',
      availableInIndia: 'true',
      indiaAvailability: 'UNVERIFIED',
      status: '',
    });
  });

  it('keeps a verified India ex-showroom price and does not treat it as a UK price', () => {
    const rows = parseVehicleDetailsJson(
      JSON.stringify({
        success: true,
        data: [
          {
            name: 'Aston Martin Vantage S',
            slug: 'aston-martin-vantage-s',
            model: 'Vantage',
            variant: 'S',
            status: 'PUBLISHED',
            currency: 'INR',
            exShowroomPrice: 31500000,
            indiaAvailability: 'AVAILABLE',
            availableInIndia: true,
            indiaVerifiedDate: '2026-09-29',
            indiaPricingSourceUrl: 'https://www.autocarindia.com/car-news/aston-martin-prices',
            pricing: {
              india: {
                currency: 'INR',
                exShowroomPrice: 31500000,
                verified: true,
                verifiedDate: '2026-09-29',
                sourceUrl: 'https://www.autocarindia.com/car-news/aston-martin-prices',
              },
            },
            manufacturer: { name: 'Aston Martin', slug: 'aston-martin' },
          },
          {
            name: 'Aston Martin DB9',
            slug: 'aston-martin-db9',
            model: 'DB9',
            variant: 'Coupe',
            status: 'PUBLISHED',
            indiaAvailability: 'NOT_AVAILABLE',
            availableInIndia: false,
            manufacturer: { name: 'Aston Martin', slug: 'aston-martin' },
          },
        ],
      }),
    );
    expect(rows[0]).toMatchObject({
      exShowroomPrice: '31500000',
      availableInIndia: 'true',
      indiaAvailability: 'EXACT_VARIANT',
    });
    const prices = JSON.parse(rows[0]?.marketPricingJson ?? '[]') as Array<{
      countryCode: string;
      amount: number;
      currencyCode: string;
    }>;
    expect(prices).toEqual([
      expect.objectContaining({ countryCode: 'IN', currencyCode: 'INR', amount: 31500000 }),
    ]);
    expect(rows[1]).toMatchObject({
      exShowroomPrice: '',
      availableInIndia: 'false',
      indiaAvailability: 'NOT_AVAILABLE',
      marketPricingJson: '',
    });
  });
});
