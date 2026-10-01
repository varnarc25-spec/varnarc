import { describe, expect, it } from 'vitest';
import {
  expandPublicMenuLabel,
  footerQuickLinks,
  publicMenuLinks,
  splitPrimaryNav,
} from '@/lib/public-menu-links';

describe('publicMenuLinks', () => {
  it('returns null when the CMS menu is missing so the header does not revive static links', () => {
    expect(publicMenuLinks(null)).toBeNull();
    expect(publicMenuLinks(undefined)).toBeNull();
  });

  it('omits items that are disabled or missing isActive', () => {
    expect(
      publicMenuLinks({
        items: [
          { label: 'Home', href: '/', sortOrder: 1, isActive: true },
          { label: 'Solar', href: '/solar', sortOrder: 2, isActive: false },
          { label: 'Tags', href: '/tags', sortOrder: 3 },
        ],
      }),
    ).toEqual([{ label: 'Home', href: '/' }]);
  });

  it('treats a CMS menu with every item disabled as an empty list, not a missing menu', () => {
    expect(
      publicMenuLinks({
        items: [{ label: 'Solar', href: '/solar', sortOrder: 1, isActive: false }],
      }),
    ).toEqual([]);
  });

  it('maps CMS Blog /blog links to /articles and labels them Articles', () => {
    expect(
      publicMenuLinks({
        items: [
          { label: 'Home', href: '/', sortOrder: 1, isActive: true },
          { label: 'Blog', href: '/blog', sortOrder: 2, isActive: true },
        ],
      }),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Articles', href: '/articles' },
    ]);
  });

  it('expands truncated Directory labels', () => {
    expect(expandPublicMenuLabel('D', '/directory')).toBe('Directory');
  });

  it('puts overflow items in More', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Finance', href: '/finance' },
      { label: 'Construction', href: '/construction' },
      { label: 'Automobile', href: '/automobile' },
      { label: 'Calculators', href: '/calculators' },
      { label: 'Articles', href: '/articles' },
      { label: 'Directory', href: '/directory' },
      { label: 'Solar', href: '/solar' },
      { label: 'AI', href: '/ai-tools' },
    ];
    const split = splitPrimaryNav(items);
    expect(split.primary.map((i) => i.href)).toEqual([
      '/',
      '/finance',
      '/construction',
      '/automobile',
      '/calculators',
      '/articles',
      '/directory',
    ]);
    expect(split.more.map((i) => i.href)).toEqual(['/solar', '/ai-tools']);
  });

  it('keeps legal CMS links and drops Blog/Reviews already in other footer columns', () => {
    expect(
      footerQuickLinks(
        [
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/articles' },
          { label: 'Reviews', href: '/reviews' },
          { label: 'Privacy', href: '/privacy' },
        ],
        [{ label: 'About Us', href: '/about' }],
      ),
    ).toEqual([
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
    ]);
  });
});
