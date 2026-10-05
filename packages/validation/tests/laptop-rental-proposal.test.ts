import { describe, expect, it } from 'vitest';
import {
  buildLaptopRentalDocument,
  formatProposalInr,
  laptopRentalDefaults,
  laptopRentalProposalSchema,
  DEFAULT_RENTAL_DISCOUNTS,
  discountPercentForMonths,
  discountedMonthlyRate,
  quoteLaptopRental,
  quoteLaptopSelection,
  rateForCommitment,
  updateLaptopRentalProposalSchema,
  volumeDiscountPercent,
} from '../src/laptop-rental-proposal';

const sample = {
  ...laptopRentalDefaults('2026-10-04'),
  customerCompanyName: 'Northwind Systems',
  issuerName: 'Varnarc Technologies Pvt Ltd',
  issuerAddress: 'Indiranagar\nBengaluru 560038',
  issuerPhone: '+91 80 4000 1000',
  issuerEmail: 'rentals@varnarc.example',
  issuerGstin: '29AAAAA0000A1Z5',
};

describe('quoteLaptopRental', () => {
  it('matches the 10-laptop 6-month sample', () => {
    expect(quoteLaptopRental(sample)).toEqual({
      monthlyTotal: 40000,
      commitmentMonthly: 36000,
      gstAmount: 6480,
      monthlyWithGst: 42480,
      termBeforeGst: 216000,
      depositTotal: 250000,
      discountAmount: 0,
    });
  });

  it('rounds paise on fractional rates', () => {
    expect(
      quoteLaptopRental({
        quantity: 2,
        monthlyRate: 100.5,
        commitmentMonths: 3,
        commitmentRate: 100.5,
        gstPercent: 18,
        depositPerLaptop: 10.1,
      }),
    ).toEqual({
      monthlyTotal: 201,
      commitmentMonthly: 201,
      gstAmount: 36.18,
      monthlyWithGst: 237.18,
      termBeforeGst: 603,
      depositTotal: 20.2,
      discountAmount: 0,
    });
  });
});

describe('quoteLaptopSelection', () => {
  it('sums each laptop and applies 5% when the quantity is above 10', () => {
    expect(volumeDiscountPercent(10)).toBe(0);
    expect(volumeDiscountPercent(11)).toBe(5);
    expect(
      rateForCommitment({
        months: 6,
        monthlyRate: 6000,
        commitmentMonths: 12,
        commitmentRate: 4500,
      }),
    ).toBe(6000);
    expect(
      rateForCommitment({
        months: 12,
        monthlyRate: 6000,
        commitmentMonths: 12,
        commitmentRate: 4500,
      }),
    ).toBe(4500);
    const quote = quoteLaptopSelection({
      commitmentMonths: 12,
      discountPercent: 5,
      lines: [
        {
          monthlyRate: 4000,
          commitmentRate: 2000,
          depositPerLaptop: 5000,
          quantity: 6,
          gstPercent: 18,
        },
        {
          monthlyRate: 6000,
          commitmentRate: 3000,
          depositPerLaptop: 5000,
          quantity: 5,
          gstPercent: 18,
        },
      ],
    });
    expect(quote.quantity).toBe(11);
    expect(quote.commitmentBefore).toBe(27000);
    expect(quote.commitmentMonthly).toBe(25650);
    expect(quote.discountAmount).toBe(1350);
    expect(quote.depositTotal).toBe(55000);
    expect(quote.gstAmount).toBe(4617);
  });
});

describe('discountPercentForMonths', () => {
  it('uses the highest saved tier at or below the commitment length', () => {
    expect(discountPercentForMonths(2, DEFAULT_RENTAL_DISCOUNTS)).toBe(0);
    expect(discountPercentForMonths(3, DEFAULT_RENTAL_DISCOUNTS)).toBe(5);
    expect(discountPercentForMonths(5, DEFAULT_RENTAL_DISCOUNTS)).toBe(5);
    expect(discountPercentForMonths(6, DEFAULT_RENTAL_DISCOUNTS)).toBe(10);
    expect(discountPercentForMonths(9, DEFAULT_RENTAL_DISCOUNTS)).toBe(15);
    expect(discountPercentForMonths(12, DEFAULT_RENTAL_DISCOUNTS)).toBe(20);
    expect(discountPercentForMonths(18, DEFAULT_RENTAL_DISCOUNTS)).toBe(20);
  });

  it('prices each term from the one-month rate', () => {
    expect(discountedMonthlyRate(6000, 5)).toBe(5700);
    expect(discountedMonthlyRate(6000, 10)).toBe(5400);
    expect(discountedMonthlyRate(6000, 15)).toBe(5100);
    expect(discountedMonthlyRate(6000, 20)).toBe(4800);
    expect(discountedMonthlyRate(null, 20)).toBeNull();
  });
});

describe('formatProposalInr', () => {
  it('uses Indian grouping', () => {
    expect(formatProposalInr(40000)).toBe('₹40,000');
    expect(formatProposalInr(216000)).toBe('₹2,16,000');
    expect(formatProposalInr(250000)).toBe('₹2,50,000');
    expect(formatProposalInr(6480)).toBe('₹6,480');
    expect(formatProposalInr(237.18)).toBe('₹237.18');
  });
});

describe('buildLaptopRentalDocument', () => {
  const document = buildLaptopRentalDocument({
    ...sample,
    proposalNumber: 'LRP-2026-0001',
    status: 'DRAFT',
    customerSignatoryName: null,
    customerSignatoryDesignation: null,
    issuerSignatoryName: null,
    issuerSignatoryDesignation: null,
    issuerAddress: sample.issuerAddress,
    issuerPhone: sample.issuerPhone,
    issuerEmail: sample.issuerEmail,
    issuerGstin: sample.issuerGstin,
  });

  it('uses the sample wording and totals', () => {
    expect(document.kicker).toBe('LAPTOP RENTAL PROPOSAL');
    expect(document.headline).toBe('Corporate Laptop Rental – 10 Laptops');
    expect(document.dateLabel).toBe('04 October 2026');
    expect(document.intro[0]).toBe(
      'We are pleased to submit this proposal for providing 10 Intel Core i5 business laptops on a rental basis.',
    );
    expect(document.plans.map((plan) => plan.name)).toEqual([
      'Monthly Rental',
      '3-Month Rental',
      '6-Month Rental',
      '9-Month Rental',
      '12-Month Rental',
    ]);
    expect(document.plans.map((plan) => plan.monthly)).toEqual([
      '₹40,000',
      '₹38,000',
      '₹36,000',
      '₹34,000',
      '₹32,000',
    ]);
    expect(document.plans.map((plan) => plan.perLaptop)).toEqual([
      '₹4,000',
      '₹3,800',
      '₹3,600',
      '₹3,400',
      '₹3,200',
    ]);
    expect(document.recommended[2]).toEqual({ label: 'GST @ 18%:', amount: '₹6,480 per month' });
    expect(document.recommended[3]?.label).toBe('Total monthly invoice including GST: ₹42,480');
    expect(document.recommended[4]?.label).toBe('Total rental for 6 months before GST: ₹2,16,000');
    expect(document.depositRows[2]).toEqual({
      label: 'Total refundable security deposit',
      value: '₹2,50,000',
      emphasis: true,
    });
    expect(document.services[0]).toBe('Delivery of laptops to the agreed Bengaluru location');
    expect(document.paymentTerms[2]?.map((part) => part.text).join('')).toBe(
      'Security deposit: ₹2,50,000 refundable.',
    );
    expect(document.fileName).toBe('laptop-rental-proposal-LRP-2026-0001-northwind-systems.pdf');
  });
});

describe('laptopRentalProposalSchema', () => {
  it('accepts the sample proposal', () => {
    const parsed = laptopRentalProposalSchema.parse(sample);
    expect(parsed.quantity).toBe(10);
    expect(parsed.issuerGstin).toBe('29AAAAA0000A1Z5');
    expect(parsed.customerSignatoryName).toBeNull();
  });

  it('rejects a proposal without a customer', () => {
    const result = laptopRentalProposalSchema.safeParse({ ...sample, customerCompanyName: ' ' });
    expect(result.success).toBe(false);
  });

  it('keeps the status when a proposal is updated', () => {
    const parsed = updateLaptopRentalProposalSchema.parse({ ...sample, status: 'SENT' });
    expect(parsed.status).toBe('SENT');
    expect(parsed.customerCompanyName).toBe('Northwind Systems');
  });
});
