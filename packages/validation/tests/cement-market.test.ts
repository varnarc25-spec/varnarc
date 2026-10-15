import { describe, expect, it } from 'vitest';

import {
  CEMENT_MANUFACTURERS,
  CEMENT_WEB_QUOTES,
  buildCementNationalSnapshot,
  summarizeCementQuotes,
} from '../src/prices-hub';

describe('buildCementNationalSnapshot', () => {
  const snapshot = buildCementNationalSnapshot();

  it('averages the published OPC 53 brand list', () => {
    expect(snapshot.opc53.count).toBe(14);
    expect(snapshot.opc53.low).toBe(360);
    expect(snapshot.opc53.high).toBe(450);
    expect(snapshot.opc53.average).toBe(411);
  });

  it('averages India city bands from the published lows and highs', () => {
    expect(snapshot.cities).toHaveLength(10);
    expect(snapshot.citySummary.low).toBe(365);
    expect(snapshot.citySummary.high).toBe(415);
    expect(snapshot.citySummary.average).toBe(389);
    expect(snapshot.cities[0]?.citySlug).toBe('lucknow');
    expect(snapshot.cities.find((city) => city.citySlug === 'hyderabad')?.hubPath).toBe(
      '/construction/prices/cement/hyderabad',
    );
    expect(snapshot.cities.find((city) => city.citySlug === 'jaipur')?.hubPath).toBeNull();
  });

  it('keeps white cement out of the grey bag span and lists every manufacturer', () => {
    expect(snapshot.greyBagSpan.low).toBe(260);
    expect(snapshot.greyBagSpan.high).toBe(460);
    expect(snapshot.manufacturers).toHaveLength(CEMENT_MANUFACTURERS.length);
    expect(snapshot.manufacturers.find((row) => row.slug === 'ultratech')?.opc53.low).toBe(450);
    const birla = snapshot.manufacturers.find((row) => row.slug === 'birla');
    expect(birla?.opc53.low).toBe(420);
    expect(birla?.opc53.high).toBe(460);
    expect(CEMENT_WEB_QUOTES.some((quote) => quote.grade === 'White' && quote.price === 1200)).toBe(
      true,
    );
  });

  it('keeps quote ids unique', () => {
    const ids = CEMENT_WEB_QUOTES.map((quote) => quote.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not invent a midpoint when a quote has no numbers', () => {
    expect(summarizeCementQuotes([{ price: null, minPrice: null, maxPrice: null }])).toEqual({
      count: 0,
      average: null,
      low: null,
      high: null,
    });
  });
});
