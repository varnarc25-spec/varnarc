import { describe, expect, it } from 'vitest';
import { articleListingDescription, financeProductDescription } from '@/lib/finance-product-seo';

describe('financeProductDescription', () => {
  it('uses CMS copy when present', () => {
    expect(
      financeProductDescription({
        name: 'Flexi Home',
        kind: 'loan',
        seoDescription: ' Bank copy ',
      }),
    ).toBe('Bank copy');
  });

  it('falls back when product meta is empty', () => {
    expect(
      financeProductDescription({
        name: 'Prime Card',
        kind: 'credit-card',
        bankName: 'HDFC',
      }),
    ).toContain('HDFC Prime Card');
  });
});

describe('articleListingDescription', () => {
  it('replaces templated calculator-guide excerpts', () => {
    expect(
      articleListingDescription(
        'EMI Calculator: Complete Guide',
        'Learn how to use the EMI Calculator and what the results mean for your finances.',
      ),
    ).toContain('EMI Calculator');
    expect(articleListingDescription('Unique excerpt title', 'A specific editorial lede.')).toBe(
      'A specific editorial lede.',
    );
  });
});
