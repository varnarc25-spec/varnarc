import { describe, expect, it } from 'vitest';
import { crmCompanySchema, crmLaptopSchema } from '../src/crm';

describe('crm companies', () => {
  it('accepts a company with a GSTIN and blank optional fields', () => {
    const parsed = crmCompanySchema.parse({
      name: 'Northwind Systems',
      email: '',
      phone: '08040001234',
      gstin: '29aaaaa0000a1z5',
      website: '',
      notes: '',
    });
    expect(parsed.gstin).toBe('29AAAAA0000A1Z5');
    expect(parsed.email).toBeNull();
    expect(parsed.website).toBeNull();
  });

  it('rejects an incomplete GSTIN', () => {
    expect(() => crmCompanySchema.parse({ name: 'Northwind', gstin: '29AAAA' })).toThrow();
  });
});

describe('crm laptops', () => {
  it('stores a catalog model with one-month and 12-month rates', () => {
    const parsed = crmLaptopSchema.parse({
      name: 'Dell Latitude (2018) - i5',
      category: 'WINDOWS_LAPTOP',
      brand: 'Dell',
      model: 'Latitude',
      listedYear: 2018,
      generation: '8th',
      processor: 'Intel Core i5',
      ram: '',
      storage: '',
      display: '',
      operatingSystem: 'Windows 11 Pro',
      monthlyRate: 3500,
      commitmentMonths: 12,
      commitmentRate: 2489,
      gstPercent: 18,
      depositPerLaptop: 5000,
      availability: 'IN_STOCK',
    });
    expect(parsed.slug).toBeNull();
    expect(parsed.monthlyRate).toBe(3500);
    expect(parsed.commitmentRate).toBe(2489);
    expect(parsed.ram).toBeNull();
    expect(parsed.camera).toBe(false);
  });
});
