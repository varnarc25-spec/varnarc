import { describe, expect, it } from 'vitest';
import {
  addCalendarMonths,
  createLaptopRentalUnitSchema,
  contractUnitCount,
  refundableDeposit,
  rentalCloseReview,
  rentalInvoicePeriods,
  rentalMonthInvoice,
  slaDueAt,
  withheldDeposit,
} from '../src/laptop-rental-service';

describe('laptop rental service', () => {
  it('builds a 6-month term and the sample monthly invoice', () => {
    expect(addCalendarMonths('2026-10-05', 6)).toBe('2027-04-05');
    expect(addCalendarMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(rentalInvoicePeriods('2026-10-05', 6)).toEqual([
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
      '2027-03',
    ]);
    expect(rentalMonthInvoice(3600, 10, 18)).toEqual({
      rentalAmount: 36000,
      gstAmount: 6480,
      totalAmount: 42480,
    });
  });

  it('sets the support deadline from the SLA hours', () => {
    const due = slaDueAt(new Date('2026-10-05T09:00:00.000Z'), 48);
    expect(due.toISOString()).toBe('2026-10-07T09:00:00.000Z');
  });

  it('keeps the contracted fleet at the proposal quantity', () => {
    expect(contractUnitCount([{ replacesUnitId: null }, { replacesUnitId: 'unit-1' }])).toBe(1);
  });

  it('refunds the deposit after deducted damage', () => {
    const withheld = withheldDeposit([
      { status: 'DEDUCTED', amount: 8000 },
      { status: 'PAID', amount: 2000 },
      { status: 'WAIVED', amount: 500 },
    ]);
    expect(withheld).toBe(8000);
    expect(refundableDeposit(250000, withheld)).toBe(242000);
  });

  it('blocks closing while a laptop is still out or the deposit is open', () => {
    const review = rentalCloseReview({
      units: [{ status: 'DELIVERED' }],
      cases: [],
      charges: [],
      invoices: [{ status: 'PAID' }],
      depositReceived: 250000,
      depositRefundedOn: null,
    });
    expect(review.canClose).toBe(false);
    expect(review.blockers.join(' ')).toMatch(/still out/);
    expect(review.blockers.join(' ')).toMatch(/deposit refund/);
  });

  it('accepts laptop details and drops blank specification fields', () => {
    const parsed = createLaptopRentalUnitSchema.parse({
      assetTag: 'LT-010',
      serialNumber: 'SN-1001',
      brand: 'Dell',
      model: 'Latitude 5440',
      processor: 'Intel Core i5',
      ram: '16 GB',
      storage: '',
      display: '14 inch',
      operatingSystem: 'Windows 11 Pro',
    });
    expect(parsed.model).toBe('Latitude 5440');
    expect(parsed.storage).toBeNull();
  });
});
