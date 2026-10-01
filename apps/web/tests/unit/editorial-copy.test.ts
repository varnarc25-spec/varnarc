import { describe, expect, it } from 'vitest';
import {
  aiCategoryCopy,
  calculatorGuideCopy,
  isTemplatedCalculatorGuide,
  isTemplatedReviewCopy,
  isWeakIndiaAutomobile,
  reviewEditorialCopy,
} from '@/lib/editorial-copy';

describe('editorial copy fallbacks', () => {
  it('replaces review roundup templates', () => {
    expect(isTemplatedReviewCopy('Editorial roundup and buying advice for car tyres.')).toBe(true);
    expect(reviewEditorialCopy('car-tyres', 'Best Car Tyres').summary).toMatch(/monsoon/i);
  });

  it('replaces calculator guide templates', () => {
    expect(isTemplatedCalculatorGuide('Learn how to use the EMI Calculator')).toBe(true);
    expect(calculatorGuideCopy('guide-home-loan-emi', 'Home').excerpt).toMatch(/FOIR/i);
  });

  it('gives unique AI category intros', () => {
    expect(aiCategoryCopy('tutoring', 'Tutoring').intro).toMatch(/syllabus/i);
    expect(aiCategoryCopy('customer-support', 'Support').description).toMatch(/Helpdesk/i);
  });

  it('flags weak India auto listings', () => {
    expect(
      isWeakIndiaAutomobile({ slug: 'genesis-gv70-22d-2021-2199', name: 'Genesis GV70' }),
    ).toBe(true);
    expect(isWeakIndiaAutomobile({ slug: 'swift', name: 'Maruti Swift' })).toBe(false);
  });
});
