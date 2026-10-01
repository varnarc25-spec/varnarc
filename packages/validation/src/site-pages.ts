import { SITE_PAGE_CATALOG } from './site-pages.catalog';

export type SitePageCatalogEntry = {
  path: string;
  title: string;
  slug: string;
};

/** Stable CMS slug for a public site path. Slashes become hyphens. */
export function sitePageSlugFromPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const clean = normalized.split('?')[0]?.replace(/\/$/, '') || '/';
  const pathname = clean === '' ? '/' : clean;
  const body = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replaceAll('/', '-');
  return `site-${body}`;
}

const catalogPaths = new Set<string>(SITE_PAGE_CATALOG.map((entry) => entry.path));

export function isSitePagePath(path: string): boolean {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const clean = normalized.split('?')[0]?.replace(/\/$/, '') || '/';
  return catalogPaths.has(clean === '' ? '/' : clean);
}

export const SITE_PAGES: SitePageCatalogEntry[] = SITE_PAGE_CATALOG.map((entry) => ({
  path: entry.path,
  title: entry.title,
  slug: entry.slug,
}));
