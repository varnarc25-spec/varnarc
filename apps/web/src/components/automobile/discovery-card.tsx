'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CarFront, Fuel, Settings2, Users } from 'lucide-react';
import type { AutomobileModelSummary } from '@/services/automobile';
import {
  formatListingMileage,
  formatListingPrice,
  formatListingSeats,
  formatListingYear,
  getAvailabilityBadge,
  getDisplayVehicleName,
  getPrimaryVehicleImages,
  getVariantLabel,
  getVehicleImageAlt,
} from '@/lib/automobile/listing-card';
import { AutomobileVehicleImage } from './vehicle-image';

function joinValues(values: Array<string | null | undefined>, separator = ' / ') {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))].join(separator);
}

export const AutomobileDiscoveryCard = memo(function AutomobileDiscoveryCard({
  model,
  selected,
  compareDisabled = false,
  onToggleCompare,
}: {
  model: AutomobileModelSummary;
  selected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const displayName = getDisplayVehicleName({
    name: model.name,
    model: model.model,
    manufacturerName: model.manufacturer?.name,
  });
  const variant = getVariantLabel(model.variant);
  const year = formatListingYear(model.minYear, model.maxYear);
  const status = getAvailabilityBadge({
    launchStatus: model.launchStatus,
    marketStatus: model.marketStatus,
    currentIndiaModel: model.currentIndiaModel,
  });
  const images = getPrimaryVehicleImages({ imageUrl: model.imageUrl, images: model.images });
  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex] ?? images[0];
  const imageAlt = getVehicleImageAlt({
    name: displayName,
    year: model.minYear === model.maxYear ? model.minYear : null,
  });
  const price = formatListingPrice({
    min: model.minPrice,
    max: model.maxPrice,
    priceType: model.priceType,
  });
  const specs = [
    model.fuels.length
      ? { key: 'fuel', label: 'Fuel', value: joinValues(model.fuels), icon: Fuel }
      : null,
    model.transmissions.length
      ? {
          key: 'transmission',
          label: 'Transmission',
          value: joinValues(model.transmissions),
          icon: Settings2,
        }
      : null,
    formatListingSeats(model.minSeats, model.maxSeats)
      ? {
          key: 'seats',
          label: 'Seats',
          value: formatListingSeats(model.minSeats, model.maxSeats)!,
          icon: Users,
        }
      : null,
    model.bodyTypes[0]
      ? { key: 'body', label: 'Body type', value: model.bodyTypes[0], icon: CarFront }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const mileage = formatListingMileage(model.minMileage, model.maxMileage);
  const safety =
    model.safetyRating != null && Number(model.safetyRating) > 0
      ? `${Number(model.safetyRating)}★`
      : null;
  const extras = [
    mileage ? `Mileage: ${mileage}` : null,
    model.rangeKm != null && Number(model.rangeKm) > 0
      ? `Range: ${Number(model.rangeKm)} km`
      : null,
    model.engineCapacity?.trim() ? `Engine: ${model.engineCapacity.trim()}` : null,
    safety ? `Safety: ${safety}` : null,
    model.variantCount > 1 ? `Variants: ${model.variantCount}` : null,
  ].filter(Boolean);
  const href = `/automobile/vehicles/${model.slug}`;
  const indiaNote =
    model.indiaAvailability === 'MODEL_ONLY' ? 'Available as a model in India' : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="relative">
        <Link
          href={href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f3a] focus-visible:ring-offset-2"
          aria-label={`View ${displayName}`}
        >
          <AutomobileVehicleImage
            src={activeImage?.imageUrl}
            alt={activeImage?.altText?.trim() || imageAlt}
            label={displayName}
            vehicleId={activeImage ? undefined : model.representativeId}
            attribution={model.imageAttribution}
          />
        </Link>
        {year ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-[#0b1f3a] shadow-sm">
            {year}
          </span>
        ) : null}
        {status ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#0b1f3a] px-2 py-0.5 text-xs font-semibold text-white">
            {status}
          </span>
        ) : null}
        {images.length > 1 ? (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={`${image.imageUrl}-${index}`}
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center"
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === imageIndex}
                onClick={() => setImageIndex(index)}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${index === imageIndex ? 'bg-[#0b1f3a]' : 'bg-white ring-1 ring-slate-400'}`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#0b1f3a]">
          <Link
            href={href}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f3a] focus-visible:ring-offset-2"
          >
            {displayName}
          </Link>
        </h3>
        {variant || indiaNote ? (
          <p className="mt-1 truncate text-xs text-slate-500">
            {[variant, indiaNote].filter(Boolean).join(' · ')}
          </p>
        ) : null}

        <p
          className={
            price.caption
              ? 'mt-2 text-[22px] font-semibold leading-tight text-[#ea580c]'
              : 'mt-2 text-base font-semibold text-slate-500'
          }
        >
          {price.amount}
        </p>
        {price.caption ? <p className="mt-0.5 text-xs text-slate-500">{price.caption}</p> : null}

        {specs.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
            {specs.map((spec) => (
              <li key={spec.key} className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <spec.icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span className="truncate">
                  <span className="sr-only">{spec.label}: </span>
                  {spec.value}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {extras.length ? (
          <p className="mt-3 truncate text-xs text-slate-500">{extras.join(' · ')}</p>
        ) : null}

        <div className="mt-auto pt-4">
          {onToggleCompare ? (
            <label className="mb-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md text-sm text-[#0b1f3a] focus-within:ring-2 focus-within:ring-[#ea580c] focus-within:ring-offset-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-[#0b1f3a] disabled:cursor-not-allowed"
                checked={Boolean(selected)}
                disabled={compareDisabled}
                aria-label={
                  selected
                    ? `Remove ${displayName} from compare`
                    : compareDisabled
                      ? `Compare list is full`
                      : `Compare ${displayName}`
                }
                onChange={() => onToggleCompare(model.representativeId)}
              />
              {selected ? 'Added to compare' : 'Compare'}
            </label>
          ) : null}
          <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
            <Link
              href={href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b1f3a] px-3 text-sm font-semibold text-white transition hover:bg-[#132c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f3a] focus-visible:ring-offset-2"
              aria-label={`View details for ${displayName}`}
            >
              View details
            </Link>
            <Link
              href={`/automobile/calculators/on-road-price?vehicle=${model.slug}`}
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-[#ea580c] px-3 text-sm font-semibold text-[#ea580c] transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2"
              aria-label={`On-road price for ${displayName}`}
            >
              On-road price
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});
