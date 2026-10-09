import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { AutomobileSeo } from '@/components/automobile/automobile-seo';
import {
  AffiliateCta,
  AffiliateLeadCapture,
  RelatedCalculators,
  VehicleOfferCards,
  VehicleReviewsBlock,
} from '@/components/automobile/vehicle-card';
import { VehicleDetailExperience } from '@/components/automobile/vehicle-detail-experience';
import {
  AUTOMOBILE_CALCULATOR_LINKS,
  fetchAutomobileReviews,
  fetchAutomobileVehicleBySlug,
  fetchAutomobileVehicleOffers,
} from '@/services/automobile';
import { automobileHubBreadcrumbs, buildAutomobileMetadata } from '@/lib/automobile/seo';
import { ApiError } from '@/services/api-client';
import { notFound } from 'next/navigation';
import {
  AUTOMOBILE_ONROAD_CITIES,
  INDIA_PRICE_DISCLAIMER,
  INTERNATIONAL_PRICE_DISCLAIMER,
  formatAutomobileMileage,
  formatIndianVehiclePrice,
  formatInternationalVehiclePrice,
} from '@varnarc/validation';
import { isWeakIndiaAutomobile } from '@/lib/editorial-copy';

type Props = { params: Promise<{ slug: string }> };

function indicativeEmi(amount: number) {
  const principal = amount * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 60;
  const factor = (1 + monthlyRate) ** months;
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

function formatEmi(amount: number | null) {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  const formatted = formatIndianVehiclePrice(indicativeEmi(amount));
  return formatted ? `${formatted} / month` : null;
}

type BrochureSpec = {
  sourceName?: string;
  sourceUrl?: string;
  groups?: Array<{ title: string; rows: Array<{ label: string; value: string }> }>;
  features?: Array<{ name: string; value: string }>;
};

function readBrochure(specifications: unknown): BrochureSpec | null {
  if (!specifications || typeof specifications !== 'object') return null;
  const brochure = (specifications as { brochure?: unknown }).brochure;
  if (!brochure || typeof brochure !== 'object') return null;
  return brochure as BrochureSpec;
}

function galleryImages(
  images: Array<{ imageUrl?: string | null; altText?: string | null }> | undefined,
  fallbackUrl: string | null | undefined,
  alt: string,
) {
  const photos = (images ?? [])
    .filter((image) => image.imageUrl)
    .map((image) => ({ src: image.imageUrl as string, alt: image.altText || alt }));
  if (!photos.length && fallbackUrl) photos.push({ src: fallbackUrl, alt });
  return photos;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchAutomobileVehicleBySlug(slug);
    const weakIndia = isWeakIndiaAutomobile({
      slug,
      name: data.name,
      manufacturerSlug: data.manufacturer?.slug,
      manufacturerName: data.manufacturer?.name,
    });
    return buildAutomobileMetadata({
      entityType: 'automobile_vehicle',
      entityId: data.id,
      path: `/automobile/vehicles/${slug}`,
      title: data.seoTitle || `${data.name} — Specs, Price & Ownership | Varnarc`,
      description:
        data.seoDescription ||
        data.description ||
        (weakIndia
          ? `${data.name} is listed from the global catalog. It may not be sold widely in India — treat specs as reference only.`
          : `Specs, indicative price and ownership tools for ${data.name}.`),
      image: data.imageUrl,
      forceNoIndex: weakIndia,
    });
  } catch {
    return { title: 'Vehicle', alternates: { canonical: `/automobile/vehicles/${slug}` } };
  }
}

export default async function AutomobileVehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  let vehicle: Awaited<ReturnType<typeof fetchAutomobileVehicleBySlug>>['data'];

  try {
    const result = await fetchAutomobileVehicleBySlug(slug);
    vehicle = result.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    notFound();
  }

  const [{ data: offers }, { data: reviews }] = await Promise.all([
    fetchAutomobileVehicleOffers(vehicle.id),
    fetchAutomobileReviews(vehicle.id),
  ]);

  const linkedReviews =
    reviews.length > 0
      ? reviews
      : (vehicle.reviewLinks ?? []).map((link) => link.review).filter(Boolean);

  const title = vehicle.seoTitle || vehicle.name;
  const description = vehicle.seoDescription || vehicle.description;
  const path = `/automobile/vehicles/${slug}`;

  const ratingValues = linkedReviews
    .map((r) => Number(r.rating))
    .filter((n) => Number.isFinite(n) && n > 0);
  const aggregateRating =
    ratingValues.length >= 1
      ? {
          ratingValue:
            Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10,
          reviewCount: ratingValues.length,
        }
      : null;

  const specs = [
    { label: 'Model', value: vehicle.model },
    { label: 'Variant', value: vehicle.variant },
    { label: 'Year', value: vehicle.modelYear },
    { label: 'Fuel', value: vehicle.fuelType },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Engine', value: vehicle.engineCapacity },
    {
      label: 'Power',
      value: vehicle.horsepower != null ? `${vehicle.horsepower} hp` : null,
    },
    {
      label: 'Torque',
      value: vehicle.torque != null ? `${vehicle.torque} Nm` : null,
    },
    { label: 'Mileage', value: formatAutomobileMileage(vehicle.mileage) },
    { label: 'Seating', value: vehicle.seatingCapacity },
    {
      label: 'Safety rating',
      value:
        vehicle.safetyRating != null && Number(vehicle.safetyRating) > 0
          ? `${vehicle.safetyRating}${vehicle.safetyAgency ? ` · ${vehicle.safetyAgency}` : ''}`
          : null,
    },
    { label: 'Warranty', value: vehicle.warranty },
  ].filter((row) => row.value != null && row.value !== '');

  const indiaPrice =
    vehicle.pricingView?.currentPrice?.currency === 'INR' &&
    vehicle.pricingView.currentPrice.verified
      ? vehicle.pricingView.currentPrice.amount
      : null;
  const ukPrice = vehicle.pricingView?.otherMarkets?.find((price) => price.market === 'GB');
  const shownIndiaPrice = indiaPrice ?? (ukPrice ? null : vehicle.exShowroomPrice);
  const indiaAmount =
    shownIndiaPrice != null && (indiaPrice != null || !ukPrice) ? Number(shownIndiaPrice) : null;
  const availability = vehicle.pricingView?.indiaAvailability ?? vehicle.indiaAvailability ?? null;
  const brochure = readBrochure(vehicle.specifications);
  const brochureGroups = brochure?.groups ?? [];
  const safetyGroups = brochureGroups.filter((group) =>
    /safety|airbag|brake|ncap|adas/i.test(group.title),
  );
  const specGroups = brochureGroups.filter((group) => !safetyGroups.includes(group));
  const features = (brochure?.features ?? []).filter(
    (feature) => feature.value !== 'No' && feature.name,
  );

  const weakIndia = isWeakIndiaAutomobile({
    slug,
    name: vehicle.name,
    manufacturerSlug: vehicle.manufacturer?.slug,
    manufacturerName: vehicle.manufacturer?.name,
  });

  return (
    <PageShell
      title={title}
      description={description ?? undefined}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobile', href: '/automobile' },
        { label: 'Vehicles', href: '/automobile/vehicles' },
        { label: vehicle.name },
      ]}
    >
      <AutomobileSeo
        breadcrumbs={automobileHubBreadcrumbs([
          { name: 'Vehicles', path: '/automobile/vehicles' },
          { name: vehicle.name, path },
        ])}
        product={{
          name: vehicle.name,
          description: description,
          path,
          image: vehicle.imageUrl,
          brand: vehicle.manufacturer?.name,
          price:
            shownIndiaPrice != null && (indiaPrice != null || !ukPrice) ? shownIndiaPrice : null,
          priceCurrency: 'INR',
          aggregateRating,
        }}
      />

      {weakIndia ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          This listing is from the global catalog and may not be sold widely in India. Specs and
          prices are reference-only. Browse{' '}
          <Link href="/automobile/cars/under-10-lakh" className="font-medium underline">
            cars under ₹10 lakh
          </Link>{' '}
          or{' '}
          <Link href="/automobile/hatchback" className="font-medium underline">
            hatchbacks
          </Link>{' '}
          for India-market models.
        </p>
      ) : null}

      <VehicleDetailExperience
        name={vehicle.name}
        images={galleryImages(vehicle.images, vehicle.imageUrl, vehicle.name)}
        manufacturer={
          vehicle.manufacturer
            ? { name: vehicle.manufacturer.name, slug: vehicle.manufacturer.slug }
            : null
        }
        featured={Boolean(vehicle.featured)}
        sponsored={Boolean(vehicle.sponsored)}
        chips={[vehicle.fuelType, vehicle.transmission, vehicle.bodyType, vehicle.modelYear]
          .filter((value) => value != null && String(value).trim() !== '')
          .map(String)}
        priceLabel={
          indiaAmount != null && Number.isFinite(indiaAmount)
            ? formatIndianVehiclePrice(indiaAmount)
            : null
        }
        priceNote={
          indiaAmount != null && Number.isFinite(indiaAmount)
            ? INDIA_PRICE_DISCLAIMER
            : availability === 'MODEL_ONLY'
              ? 'This model is sold in India, but this exact variant is not.'
              : availability === 'NOT_AVAILABLE'
                ? 'Not officially available in India'
                : 'India price not verified'
        }
        onRoadLabel={
          vehicle.estimatedOnRoadPrice != null && indiaPrice != null
            ? formatIndianVehiclePrice(vehicle.estimatedOnRoadPrice)
            : null
        }
        emiLabel={formatEmi(indiaAmount)}
        ukLabel={
          ukPrice?.amount != null
            ? formatInternationalVehiclePrice(ukPrice.amount, ukPrice.currency)
            : null
        }
        ukNote={ukPrice?.amount != null ? INTERNATIONAL_PRICE_DISCLAIMER : null}
        highlights={specs.map((row) => ({ label: row.label, value: String(row.value) }))}
        specGroups={specGroups
          .map((group) => ({
            title: group.title,
            rows: group.rows.filter((row) => row.label && row.value),
          }))
          .filter((group) => group.rows.length > 0)}
        safetyRows={[
          ...(vehicle.safetyRating != null && Number(vehicle.safetyRating) > 0
            ? [
                {
                  label: 'Crash-test rating',
                  value: `${vehicle.safetyRating}${vehicle.safetyAgency ? ` · ${vehicle.safetyAgency}` : ''}`,
                },
              ]
            : []),
          ...safetyGroups.flatMap((group) =>
            group.rows
              .filter((row) => row.label && row.value)
              .map((row) => ({ label: row.label, value: row.value })),
          ),
        ]}
        features={features.map((feature) => ({
          label: feature.name,
          value: feature.value === 'Yes' ? 'Yes' : feature.value,
        }))}
        colors={(vehicle.availableColors ?? [])
          .filter((color) => color.name)
          .map((color) => ({ name: color.name as string, hex: color.hex ?? null }))}
        cities={AUTOMOBILE_ONROAD_CITIES.map((city) => ({
          name: city.name,
          href: `/automobile/vehicles/${slug}/on-road-price/${city.slug}`,
        }))}
        brochure={
          brochure?.sourceUrl
            ? {
                name: brochure.sourceName || 'Official brochure',
                url: brochure.sourceUrl,
              }
            : null
        }
        compareHref={`/automobile/compare?ids=${vehicle.id}`}
        emiHref="/automobile/calculators/car-loan"
        onRoadHref={`/automobile/vehicles/${slug}/on-road-price/bangalore`}
        maintenanceHref={`/automobile/maintenance?vehicleId=${vehicle.id}`}
        rating={
          aggregateRating
            ? { value: aggregateRating.ratingValue, count: aggregateRating.reviewCount }
            : null
        }
      />

      <div id="reviews" className="scroll-mt-28 lg:scroll-mt-40">
        <VehicleReviewsBlock reviews={linkedReviews} />
      </div>
      <VehicleOfferCards loans={offers.loans} insurance={offers.insurance} />

      <section className="mt-10 text-sm">
        <h2 className="font-extrabold text-[#0b1f3a]">Research next</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {vehicle.bodyType ? (
            <li>
              <Link
                className="text-[#ea580c] underline"
                href={`/automobile/${vehicle.bodyType.toLowerCase().includes('suv') ? 'suv' : vehicle.bodyType.toLowerCase().includes('hatch') ? 'hatchback' : 'sedan'}`}
              >
                Similar body type
              </Link>
            </li>
          ) : null}
          {vehicle.manufacturer ? (
            <li>
              <Link
                className="text-[#ea580c] underline"
                href={`/automobile/manufacturers/${vehicle.manufacturer.slug}`}
              >
                {vehicle.manufacturer.name} cars
              </Link>
            </li>
          ) : null}
          <li>
            <Link className="text-[#ea580c] underline" href="/automobile/calculators/fuel">
              Running cost
            </Link>
          </li>
        </ul>
      </section>

      {vehicle.affiliateUrl ? (
        <div className="mt-8">
          <AffiliateCta url={vehicle.affiliateUrl} entityId={vehicle.id} />
        </div>
      ) : null}

      <AffiliateLeadCapture entityId={vehicle.id} affiliateUrl={vehicle.affiliateUrl} />

      <RelatedCalculators links={AUTOMOBILE_CALCULATOR_LINKS} />
    </PageShell>
  );
}
