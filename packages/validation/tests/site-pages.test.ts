import { describe, expect, it } from 'vitest';
import { SITE_PAGE_CATALOG } from '../src/site-pages.catalog';
import { isSitePagePath, sitePageSlugFromPath, SITE_PAGES } from '../src/site-pages';

describe('site pages catalog', () => {
  it('covers the car resale calculator and the home page', () => {
    expect(isSitePagePath('/')).toBe(true);
    expect(isSitePagePath('/automobile/calculators/resale-value')).toBe(true);
    expect(isSitePagePath('/automobile/vehicles/city-sx')).toBe(false);
  });

  it('uses the same slug for every catalog path', () => {
    const slugs = new Set<string>();
    for (const entry of SITE_PAGE_CATALOG) {
      expect(entry.slug).toBe(sitePageSlugFromPath(entry.path));
      expect(entry.slug.length).toBeLessThanOrEqual(120);
      expect(entry.path.includes('[')).toBe(false);
      slugs.add(entry.slug);
    }
    expect(slugs.size).toBe(SITE_PAGE_CATALOG.length);
    expect(SITE_PAGES).toHaveLength(SITE_PAGE_CATALOG.length);
  });
});
