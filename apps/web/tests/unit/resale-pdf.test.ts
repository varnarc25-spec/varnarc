import { describe, expect, it } from 'vitest';
import { calculateResaleValue } from '@varnarc/validation';
import {
  emptyResaleForm,
  toValuationInput,
  type ResaleFormState,
} from '@/components/automobile/resale/form';
import { drawResalePdf } from '@/components/automobile/resale/resale-pdf-draw';
import {
  buildResalePdfDocument,
  pdfPlain,
  resalePdfFileName,
} from '@/components/automobile/resale/resale-pdf-document';

function filledForm(overrides: Partial<ResaleFormState> = {}): ResaleFormState {
  return {
    ...emptyResaleForm(),
    manufacturerName: 'Maruti Suzuki',
    manufacturerSlug: 'maruti-suzuki',
    modelName: 'Swift',
    modelSlug: 'swift',
    variantName: 'VXI',
    registrationYear: '2022',
    registrationMonth: '3',
    fuel: 'petrol',
    transmission: 'manual',
    catalogPrice: 8_50_000,
    kilometres: '32000',
    owners: '1',
    stateSlug: 'telangana',
    citySlug: 'hyderabad',
    overall: 'good',
    serviceHistory: 'complete',
    accidentHistory: 'none',
    insurance: 'comprehensive',
    ...overrides,
  };
}

describe('resale pdf', () => {
  it('replaces characters Helvetica cannot draw', () => {
    expect(pdfPlain('₹29.56 lakh – ₹32.02 lakh')).toBe('Rs. 29.56 lakh - Rs. 32.02 lakh');
  });

  it('names the file from the vehicle', () => {
    expect(resalePdfFileName(filledForm())).toBe('varnarc-car-resale-maruti-suzuki-swift-vxi.pdf');
    expect(resalePdfFileName(emptyResaleForm())).toBe('varnarc-car-resale-estimate.pdf');
  });

  it('includes the estimate, adjustments and confidence', () => {
    const form = filledForm();
    const result = calculateResaleValue(
      toValuationInput(form, new Date('2026-10-06T00:00:00+05:30')),
    );
    const document = buildResalePdfDocument({
      result,
      form,
      generatedAt: new Date('2026-10-06T00:00:00+05:30'),
      shareUrl: 'https://varnarc.com/automobile/calculators/resale-value?make=maruti-suzuki',
    });

    expect(document.vehicle).toBe('Maruti Suzuki Swift VXI');
    expect(document.subtitle).toContain('Hyderabad');
    expect(document.subtitle).toContain('2026');
    expect(document.range).toContain('₹');
    expect(document.market).toContain('₹');
    expect(document.sections.map((section) => section.title)).toEqual([
      'Vehicle',
      'Valuation summary',
      'Valuation confidence',
      "What affected this car's value",
      'Estimated future value',
      'Vehicle value timeline',
    ]);
    const summary = document.sections.find((section) => section.title === 'Valuation summary');
    expect(summary?.rows.map((row) => row.label)).toContain('Kilometres driven');
    const adjustments = document.sections.find(
      (section) => section.title === "What affected this car's value",
    );
    expect(adjustments?.rows.at(-1)?.label).toBe('Estimated market value');
    expect(document.notes.some((note) => note.includes('varnarc.com'))).toBe(true);
    expect(document.sections.some((section) => section.title === 'Resale value score')).toBe(false);
  });

  it('includes a model resale score when one is returned', () => {
    const form = filledForm();
    const result = {
      ...calculateResaleValue(toValuationInput(form, new Date('2026-10-06T00:00:00+05:30'))),
      resaleValueScore: 7.4,
    };
    const document = buildResalePdfDocument({
      result,
      form,
      generatedAt: new Date('2026-10-06T00:00:00+05:30'),
      shareUrl: '',
    });
    const score = document.sections.find((section) => section.title === 'Resale value score');
    expect(score?.intro).toContain('7.4 / 10');
    expect(document.notes.some((note) => note.startsWith('Result link:'))).toBe(false);
  });

  it('draws a PDF that includes the estimate', async () => {
    const { jsPDF } = await import('jspdf');
    const form = filledForm();
    const result = calculateResaleValue(
      toValuationInput(form, new Date('2026-10-06T00:00:00+05:30')),
    );
    const document = buildResalePdfDocument({
      result,
      form,
      generatedAt: new Date('2026-10-06T00:00:00+05:30'),
      shareUrl: 'https://varnarc.com/automobile/calculators/resale-value',
    });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    drawResalePdf(pdf, document);
    const raw = pdf.output();
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(raw).toContain('Varnarc');
    expect(raw).toContain('Rs.');
    expect(raw.length).toBeGreaterThan(2000);
  });
});
