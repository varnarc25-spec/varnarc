import { describe, expect, it } from 'vitest';
import { readHeroImageWidth } from '@/lib/seo-metadata';

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
