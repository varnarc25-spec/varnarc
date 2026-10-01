/** Re-export Schema.org JSON-LD builders from @varnarc/validation (compat shim). */
import {
  breadcrumbJsonLd as breadcrumbJsonLdCore,
  jsonLdAbsoluteUrl,
  type JsonLdBreadcrumbItem,
} from '@varnarc/validation';
import { getPublicSiteUrlSync } from '@/lib/public-site-url';

/** Always emit https:// item URLs — Search Console rejects "/" as BreadcrumbList id. */
export function breadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  const site = getPublicSiteUrlSync();
  return breadcrumbJsonLdCore(
    items.map((item) => ({
      name: item.name,
      url: jsonLdAbsoluteUrl(site, item.url?.trim() || '/'),
    })),
  );
}

export {
  articleJsonLd,
  assertValidJsonLdGraph,
  assertValidJsonLdNode,
  buildAggregateRatingJsonLd,
  faqJsonLd,
  filterVisibleFaqs,
  howToJsonLd,
  itemListJsonLd,
  jsonLdAbsoluteUrl,
  jsonLdGraphTypes,
  localBusinessJsonLd,
  organizationJsonLd,
  productJsonLd,
  reviewJsonLd,
  softwareApplicationJsonLd,
  webApplicationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
  type JsonLdAggregateRatingInput,
  type JsonLdBreadcrumbItem,
  type JsonLdFaqItem,
  type JsonLdHowToStep,
  type JsonLdListItem,
  type JsonLdObject,
} from '@varnarc/validation';
