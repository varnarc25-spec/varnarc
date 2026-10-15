import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentLayout } from '@/components/layout/content-layout';
import { ConstructionSeo } from '@/components/construction/construction-seo';
import { CementNationalView } from '@/components/construction/prices-hub/cement-national-view';
import { cn, cx } from '@/components/construction/styles';
import { fetchIndexablePriceLandings, fetchPricesHub } from '@/lib/construction/prices-hub/api';
import { constructionHubBreadcrumbs, resolveConstructionIndexing } from '@/lib/construction/seo';
import { isDockerBuild } from '@/lib/docker-build';
import {
  buildCementNationalSnapshot,
  getPriceHubMaterial,
  isPriceHubMaterialKey,
  PRICE_HUB_CITIES,
  PRICE_HUB_MATERIALS,
  PRICE_HUB_QUALIFICATION,
  PRICE_MATERIAL_SEO_PROFILES,
  type PriceHubMaterialKey,
} from '@varnarc/validation';

type Props = { params: Promise<{ material: string }> };

export async function generateStaticParams() {
  if (isDockerBuild()) return [];
  return PRICE_HUB_MATERIALS.map((material) => ({ material: material.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { material } = await params;
  if (!isPriceHubMaterialKey(material)) {
    return { robots: { index: false, follow: false } };
  }
  const meta = getPriceHubMaterial(material)!;
  const indexing = resolveConstructionIndexing({
    pathname: `/construction/prices/${material}`,
  });
  if (material === 'cement') {
    const snapshot = buildCementNationalSnapshot();
    const title = 'Cement Prices in India | Manufacturers and City Ranges | Varnarc';
    const description = `OPC 53 cement averages ₹${snapshot.opc53.average} per 50 kg bag across published brand listings (₹${snapshot.opc53.low}–₹${snapshot.opc53.high}). City bands across India run ₹${snapshot.citySummary.low}–₹${snapshot.citySummary.high}. Confirm with a local dealer.`;
    return {
      title,
      description,
      alternates: { canonical: indexing.canonicalUrl },
      robots: indexing.robots,
      openGraph: { title, description, url: indexing.canonicalUrl, type: 'article' },
    };
  }
  const title = `${meta.label} Prices in India | Varnarc`;
  const description = `Reference ${meta.label.toLowerCase()} prices by city. ${PRICE_HUB_QUALIFICATION}`;
  return {
    title,
    description,
    alternates: { canonical: indexing.canonicalUrl },
    robots: indexing.robots,
    openGraph: { title, description, url: indexing.canonicalUrl, type: 'article' },
  };
}

export const revalidate = 300;
export const dynamicParams = true;

export default async function MaterialNationalPricePage({ params }: Props) {
  const { material } = await params;
  if (!isPriceHubMaterialKey(material)) notFound();

  const meta = getPriceHubMaterial(material)!;
  const [hub, landings] = await Promise.all([
    fetchPricesHub({ material }),
    fetchIndexablePriceLandings(),
  ]);
  const observations = (hub?.latest ?? []).filter((row) => row.material?.hubKey === material);
  const indexableCitySlugs = new Set(
    landings.filter((pair) => pair.material === material).map((pair) => pair.city),
  );
  const path = `/construction/prices/${material}`;
  const profile = PRICE_MATERIAL_SEO_PROFILES[material as PriceHubMaterialKey];

  if (material === 'cement') {
    const snapshot = buildCementNationalSnapshot();
    return (
      <ContentLayout
        title="Cement prices in India"
        description="Manufacturer list, published website rates, and average 50 kg bag ranges across Indian cities."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Construction', href: '/construction' },
          { label: 'Prices', href: '/construction/prices' },
          { label: 'Cement' },
        ]}
      >
        <ConstructionSeo
          breadcrumbs={constructionHubBreadcrumbs([
            { name: 'Prices', path: '/construction/prices' },
            { name: 'Cement prices', path },
          ])}
          webPage={{
            name: 'Cement prices in India',
            description: profile.editorialIntro,
            path,
          }}
          faqs={snapshot.faqs}
          itemList={{
            name: 'Cement manufacturers in India',
            path,
            items: snapshot.manufacturers.map((row) => ({ name: row.name })),
          }}
          lastUpdated={`${snapshot.retrievedAt}T00:00:00.000Z`}
          lastUpdatedLabel="Price list retrieval"
        />
        <CementNationalView observations={observations} indexableCitySlugs={indexableCitySlugs} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title={`${meta.label} prices in India`}
      description={profile.editorialIntro}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Construction', href: '/construction' },
        { label: 'Prices', href: '/construction/prices' },
        { label: meta.label },
      ]}
    >
      <ConstructionSeo
        breadcrumbs={constructionHubBreadcrumbs([
          { name: 'Prices', path: '/construction/prices' },
          { name: `${meta.label} prices`, path },
        ])}
        webPage={{
          name: `${meta.label} prices in India`,
          description: profile.editorialIntro,
          path,
        }}
        itemList={
          indexableCitySlugs.size
            ? {
                name: `${meta.label} city price pages`,
                path,
                items: PRICE_HUB_CITIES.filter((city) => indexableCitySlugs.has(city.slug)).map(
                  (city) => ({
                    name: `${meta.label} in ${city.name}`,
                    path: `/construction/prices/${material}/${city.slug}`,
                  }),
                ),
              }
            : undefined
        }
      />
      <div className="space-y-8">
        <p className="text-sm leading-relaxed text-slate-700">{profile.editorialIntro}</p>
        <p className="text-xs text-slate-500">{PRICE_HUB_QUALIFICATION}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={meta.calculatorHref} className={cx.primaryBtn}>
            Open calculator
          </Link>
          <Link href="/construction/prices" className={cx.secondaryBtn}>
            All material prices
          </Link>
          <Link href="/construction/prices/cement" className={cx.secondaryBtn}>
            Cement prices
          </Link>
        </div>
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0b1f3a]">Cities</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PRICE_HUB_CITIES.map((city) => {
              const obs = observations.find((row) => row.location?.slug === city.slug);
              return (
                <li key={city.slug} className={cn(cx.card, 'p-4')}>
                  <p className="font-semibold text-[#0b1f3a]">{city.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {obs
                      ? `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: obs.currency, maximumFractionDigits: 0 }).format(obs.price)} / ${obs.unit} · ${obs.freshnessLabel}`
                      : 'No published observation for this city yet.'}
                  </p>
                  <Link
                    href={
                      indexableCitySlugs.has(city.slug)
                        ? `/construction/prices/${material}/${city.slug}`
                        : `/construction/prices?material=${material}&location=${city.slug}`
                    }
                    className={cn(cx.link, 'mt-2 inline-block')}
                  >
                    {indexableCitySlugs.has(city.slug)
                      ? `${meta.label} in ${city.name}`
                      : `Filter ${city.name} in the prices hub`}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </ContentLayout>
  );
}
