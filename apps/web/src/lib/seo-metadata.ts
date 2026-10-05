import type { Metadata } from 'next';
import { isSitePagePath, sitePageSlugFromPath } from '@varnarc/validation';
import { apiPublicFetch } from '@/services/api-client';
import { brandTitleOnce } from '@/lib/seo-defaults';
import { getPublicSiteUrlSync } from '@/lib/public-site-url';

export type SeoOverride = {
  title?: string | null;
  description?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  twitterCard?: string | null;
  schemaType?: string | null;
  language?: string | null;
};

const HERO_IMAGE_WIDTH_MIN = 80;
const HERO_IMAGE_WIDTH_MAX = 800;

/** Pixel width saved on a site page. Values outside 80–800 are ignored. */
export function readHeroImageWidth(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const value = (metadata as { heroImageWidth?: unknown }).heroImageWidth;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const width = Math.round(value);
  if (width < HERO_IMAGE_WIDTH_MIN || width > HERO_IMAGE_WIDTH_MAX) return null;
  return width;
}

export type SeoMetadataInput = {
  entityType: string;
  entityId?: string;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  canonicalUrl?: string | null;
};

export async function fetchSeoOverride(
  entityType: string,
  entityId: string,
): Promise<SeoOverride | null> {
  try {
    const { data } = await apiPublicFetch<SeoOverride | null>(
      `/seo/meta/${entityType}/${entityId}`,
      { next: { revalidate: 120 } },
    );
    return data;
  } catch {
    return null;
  }
}

type SitePageRecord = {
  seo?: SeoOverride | null;
  metadata?: unknown;
};

async function fetchSitePageRecord(path: string): Promise<SitePageRecord | null> {
  const pathname = path.startsWith('/') ? path : `/${path}`;
  const clean = pathname.split('?')[0]?.replace(/\/$/, '') || '/';
  const normalized = clean === '' ? '/' : clean;
  if (!isSitePagePath(normalized)) return null;
  try {
    const { data } = await apiPublicFetch<SitePageRecord>(
      `/pages/slug/${sitePageSlugFromPath(normalized)}`,
      { next: { revalidate: 120 } },
    );
    return data ?? null;
  } catch {
    return null;
  }
}

/** SEO saved in Admin → Pages for a built-in site route. */
export async function fetchSitePageSeo(path: string): Promise<SeoOverride | null> {
  const page = await fetchSitePageRecord(path);
  return page?.seo ?? null;
}

export async function fetchSiteHeroImageWidth(path: string): Promise<number | null> {
  const page = await fetchSitePageRecord(path);
  return readHeroImageWidth(page?.metadata);
}

function prefer(primary?: string | null, fallback?: string | null) {
  const first = primary?.trim();
  if (first) return first;
  const second = fallback?.trim();
  return second || null;
}

function parseRobots(robots?: string | null): Metadata['robots'] | undefined {
  if (!robots?.trim()) return undefined;
  const value = robots.toLowerCase();
  return {
    index: !value.includes('noindex'),
    follow: !value.includes('nofollow'),
  };
}

/** Merge entity defaults with centralized seo_metadata overrides. */
export async function buildSeoMetadata(input: SeoMetadataInput): Promise<Metadata> {
  const baseUrl = getPublicSiteUrlSync();
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const [entityOverride, siteOverride] = await Promise.all([
    input.entityId != null ? fetchSeoOverride(input.entityType, input.entityId) : null,
    fetchSitePageSeo(path),
  ]);
  const override: SeoOverride | null =
    entityOverride || siteOverride
      ? {
          title: prefer(entityOverride?.title, siteOverride?.title),
          description: prefer(entityOverride?.description, siteOverride?.description),
          metaKeywords: prefer(entityOverride?.metaKeywords, siteOverride?.metaKeywords),
          canonicalUrl: prefer(entityOverride?.canonicalUrl, siteOverride?.canonicalUrl),
          ogImage: prefer(entityOverride?.ogImage, siteOverride?.ogImage),
          robots: entityOverride?.robots || siteOverride?.robots,
          twitterCard: entityOverride?.twitterCard || siteOverride?.twitterCard,
          language: entityOverride?.language || siteOverride?.language,
        }
      : null;

  const rawTitle = override?.title?.trim() || input.title;
  const title = brandTitleOnce(rawTitle);
  const description = override?.description?.trim() || input.description?.trim() || undefined;
  const canonical =
    override?.canonicalUrl?.trim() ||
    input.canonicalUrl?.trim() ||
    (path.startsWith('http') ? path : `${baseUrl}${path}`);
  const ogImage = override?.ogImage?.trim() || input.image?.trim() || undefined;
  const twitterCard =
    override?.twitterCard === 'summary_large_image' ? 'summary_large_image' : 'summary';

  return {
    title: { absolute: title },
    description,
    keywords: override?.metaKeywords?.trim() || undefined,
    alternates: {
      canonical: canonical.startsWith('http') ? canonical : path,
    },
    robots: parseRobots(override?.robots),
    openGraph: {
      title,
      description,
      url: canonical.startsWith('http') ? canonical : `${baseUrl}${path}`,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: override?.language ?? undefined,
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
