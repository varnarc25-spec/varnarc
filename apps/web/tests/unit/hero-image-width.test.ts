import { describe, expect, it } from 'vitest';
import { readHeroImageWidth, readOgImageAlt } from '@/lib/seo-metadata';

describe('readHeroImageWidth', () => {
  it('reads a pixel width stored on the page', () => {
    expect(
      readHeroImageWidth({
        kind: 'site',
        path: '/automobile/calculators/resale-value',
        heroImageWidth: 480,
      }),
    ).toBe(480);
  });

  it('ignores a blank or out-of-range width', () => {
    expect(readHeroImageWidth({ kind: 'site' })).toBeNull();
    expect(readHeroImageWidth({ heroImageWidth: 40 })).toBeNull();
    expect(readHeroImageWidth({ heroImageWidth: '480' })).toBeNull();
    expect(readHeroImageWidth(null)).toBeNull();
  });
});

describe('readOgImageAlt', () => {
  it('reads alt text stored with the page image', () => {
    expect(readOgImageAlt({ ogImageAlt: '  Used car illustration  ' })).toBe(
      'Used car illustration',
    );
  });

  it('ignores a blank or non-string alt', () => {
    expect(readOgImageAlt({ ogImageAlt: '   ' })).toBeNull();
    expect(readOgImageAlt({ ogImageAlt: 12 })).toBeNull();
    expect(readOgImageAlt(null)).toBeNull();
  });
});
