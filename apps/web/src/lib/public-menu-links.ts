type PublicMenu = {
  items: Array<{
    label: string;
    href: string | null;
    sortOrder: number;
    isActive?: boolean;
  }>;
};

export type PublicMenuLink = { label: string; href: string };

/** CMS still stores Blog as `/blog`; the live listing lives at `/articles`. */
export function canonicalPublicHref(href: string): string {
  try {
    const url = href.startsWith('http://') || href.startsWith('https://') ? new URL(href) : null;
    const path = (url ? url.pathname : (href.split('?')[0] ?? href)).replace(/\/+$/, '') || '/';
    if (path === '/blog') {
      return '/articles';
    }
    if (path.startsWith('/blog/')) {
      return `/articles${path.slice('/blog'.length)}`;
    }
    return href;
  } catch {
    return href;
  }
}

export function publicMenuPath(href: string): string {
  try {
    const url = href.startsWith('http://') || href.startsWith('https://') ? new URL(href) : null;
    return (url ? url.pathname : (href.split('?')[0] ?? href)).replace(/\/+$/, '') || '/';
  } catch {
    return href;
  }
}

/** CMS sometimes stores truncated labels (Directory → "D"). */
export function expandPublicMenuLabel(label: string, href: string): string {
  const path = publicMenuPath(href);
  const trimmed = label.trim();
  if (path === '/articles' && /^blog$/i.test(trimmed)) return 'Articles';
  if (path === '/directory' && /^d(ir\.?)?$/i.test(trimmed)) return 'Directory';
  if (path === '/calculators' && /^c(alc\.?)?$/i.test(trimmed)) return 'Calculators';
  return trimmed;
}

const PRIMARY_NAV_PATHS = [
  '/',
  '/finance',
  '/construction',
  '/automobile',
  '/calculators',
  '/articles',
  '/directory',
];

export function splitPrimaryNav(items: PublicMenuLink[]): {
  primary: PublicMenuLink[];
  more: PublicMenuLink[];
} {
  if (items.length <= 7) {
    return { primary: items, more: [] };
  }
  const byPath = new Map(items.map((item) => [publicMenuPath(item.href), item]));
  const primary: PublicMenuLink[] = [];
  const used = new Set<string>();
  for (const path of PRIMARY_NAV_PATHS) {
    const item = byPath.get(path);
    if (!item) continue;
    primary.push(item);
    used.add(path);
  }
  const rest = items.filter((item) => !used.has(publicMenuPath(item.href)));
  while (primary.length < 7 && rest.length) {
    const next = rest.shift()!;
    primary.push(next);
    used.add(publicMenuPath(next.href));
  }
  return { primary, more: rest };
}

const FOOTER_CONTENT_PATHS = new Set([
  '/articles',
  '/compare',
  '/compare/products',
  '/reviews',
  '/directory',
  '/calculators',
  '/finance',
  '/construction',
  '/automobile',
  '/solar',
]);

/** Keep CMS footer for legal/about; drop links already shown in other footer columns. */
export function footerQuickLinks(
  cmsLinks: PublicMenuLink[] | null | undefined,
  defaults: PublicMenuLink[],
): PublicMenuLink[] {
  const source = cmsLinks?.length ? cmsLinks : defaults;
  const seen = new Set<string>();
  const out: PublicMenuLink[] = [];
  for (const item of source) {
    const path = publicMenuPath(item.href);
    if (FOOTER_CONTENT_PATHS.has(path)) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    out.push({ label: expandPublicMenuLabel(item.label, item.href), href: item.href });
  }
  return out.length ? out : defaults;
}

export function publicMenuLinks(menu: PublicMenu | null | undefined) {
  if (!menu) return null;
  return menu.items
    .filter((item) => Boolean(item.href) && item.isActive === true)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => {
      const href = canonicalPublicHref(item.href!);
      return { label: expandPublicMenuLabel(item.label, href), href };
    });
}
