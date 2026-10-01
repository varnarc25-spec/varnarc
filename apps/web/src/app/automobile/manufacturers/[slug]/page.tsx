import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { AutomobileSeo } from '@/components/automobile/automobile-seo';
import { AutomobileVehicleCard } from '@/components/automobile/vehicle-card';
import { fetchAutomobileManufacturerBySlug, fetchAutomobileVehicles } from '@/services/automobile';
import { automobileHubBreadcrumbs, buildAutomobileMetadata } from '@/lib/automobile/seo';
import { ApiError } from '@/services/api-client';
import { notFound } from 'next/navigation';
import { isWeakIndiaAutomobile } from '@/lib/editorial-copy';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchAutomobileManufacturerBySlug(slug);
    const weakIndia = isWeakIndiaAutomobile({
      slug,
      name: data.name,
      manufacturerSlug: data.slug,
      manufacturerName: data.name,
      country: data.country,
    });
    return buildAutomobileMetadata({
      entityType: 'automobile_manufacturer',
      entityId: data.id,
      path: `/automobile/manufacturers/${slug}`,
      title: data.seoTitle || `${data.name} Cars & Lineup | Varnarc`,
      description:
        data.seoDescription ||
        data.description ||
        `${data.name} vehicles and lineup in India. Specs appear when models are published.`,
      image: data.logoUrl,
      forceNoIndex: weakIndia,
    });
  } catch {
    return {
      title: 'Manufacturer',
      alternates: { canonical: `/automobile/manufacturers/${slug}` },
    };
  }
}

export default async function AutomobileManufacturerDetailPage({ params }: Props) {
  const { slug } = await params;
  let manufacturer: Awaited<ReturnType<typeof fetchAutomobileManufacturerBySlug>>['data'];

  try {
    const result = await fetchAutomobileManufacturerBySlug(slug);
    manufacturer = result.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    notFound();
  }

  const vehiclesRes = await fetchAutomobileVehicles({ manufacturerId: manufacturer.id, limit: 12 });
  const vehicles = manufacturer.vehicles?.length ? manufacturer.vehicles : vehiclesRes.data;
  const path = `/automobile/manufacturers/${slug}`;

  const about =
    manufacturer.description?.trim() ||
    `${manufacturer.name} is listed in the Varnarc automobile directory${
      manufacturer.country ? ` (${manufacturer.country})` : ''
    }. Vehicle specs appear here when models are published.`;

  return (
    <PageShell
      title={manufacturer.name}
      description={about}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobile', href: '/automobile' },
        { label: 'Manufacturers', href: '/automobile/manufacturers' },
        { label: manufacturer.name },
      ]}
    >
      <AutomobileSeo
        breadcrumbs={automobileHubBreadcrumbs([
          { name: 'Manufacturers', path: '/automobile/manufacturers' },
          { name: manufacturer.name, path },
        ])}
        organization={{
          name: manufacturer.name,
          description: manufacturer.description,
          path,
          url: manufacturer.website,
          logo: manufacturer.logoUrl,
        }}
        itemList={
          vehicles.length
            ? {
                name: `${manufacturer.name} vehicles`,
                path,
                items: vehicles.slice(0, 20).map((v) => ({
                  name: v.name,
                  path: `/automobile/vehicles/${v.slug}`,
                })),
              }
            : undefined
        }
      />

      {manufacturer.website ? (
        <p className="mb-6">
          <a
            href={manufacturer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#ea580c] hover:underline"
          >
            Visit website →
          </a>
        </p>
      ) : null}

      {manufacturer.logoUrl ? (
        <img
          src={manufacturer.logoUrl}
          alt=""
          className="mb-4 h-14 w-14 rounded-xl bg-white object-contain"
        />
      ) : null}

      {manufacturer.tagline ? (
        <p className="mb-3 text-base font-medium text-slate-800">{manufacturer.tagline}</p>
      ) : null}

      {manufacturer.country || manufacturer.foundedYear ? (
        <p className="mb-4 text-sm text-slate-600">
          {[
            manufacturer.country ? `Country: ${manufacturer.country}` : null,
            manufacturer.foundedYear ? `Founded ${manufacturer.foundedYear}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : null}

      {manufacturer.availableInIndia || manufacturer.indiaAvailabilityStatus ? (
        <p className="mb-4 text-sm text-slate-700">
          {manufacturer.availableInIndia
            ? 'Available in India.'
            : manufacturer.indiaAvailabilityStatus === 'NO_CURRENT_RETAIL_RANGE_VERIFIED'
              ? 'No current India new-car range verified.'
              : manufacturer.indiaAvailabilityStatus === 'DUPLICATE_OR_NON_CANONICAL'
                ? 'Listed as a duplicate or non-canonical brand.'
                : manufacturer.indiaAvailabilityStatus === 'PREBOOKING_CLOSED_DELIVERIES_2027'
                  ? 'Pre-booking is closed. Deliveries are expected in 2027.'
                  : 'Not officially available in India.'}
          {manufacturer.indiaVerificationNote ? ` ${manufacturer.indiaVerificationNote}` : ''}
        </p>
      ) : null}

      {manufacturer.indiaWebsite ? (
        <p className="mb-6">
          <a
            href={manufacturer.indiaWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#ea580c] hover:underline"
          >
            India website →
          </a>
        </p>
      ) : null}

      {manufacturer.description ? (
        <section className="mb-10">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{manufacturer.description}</p>
        </section>
      ) : (
        <section className="mb-10">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{about}</p>
        </section>
      )}

      {vehicles.length ? (
        <section className="mb-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-[#0b1f3a]">Vehicles</h2>
            <Link
              href={`/automobile/vehicles?manufacturerId=${manufacturer.id}`}
              className="text-sm text-[#ea580c] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <AutomobileVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                href={`/automobile/vehicles/${vehicle.slug}`}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">Lineup coming soon</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            We do not have published {manufacturer.name} models on Varnarc yet. Check the{' '}
            <Link
              href="/automobile/vehicles"
              className="font-medium text-[#ea580c] hover:underline"
            >
              vehicle catalogue
            </Link>
            , browse{' '}
            <Link
              href="/automobile/manufacturers"
              className="font-medium text-[#ea580c] hover:underline"
            >
              other manufacturers
            </Link>
            , or use the{' '}
            <Link
              href="/automobile/calculators/on-road-price"
              className="font-medium text-[#ea580c] hover:underline"
            >
              on-road price calculator
            </Link>{' '}
            when you have a model in mind.
          </p>
        </section>
      )}
    </PageShell>
  );
}
