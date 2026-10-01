'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatInrCompact, parseInrAmount } from '@varnarc/validation';
import { trackAutomobileEvent } from '@/lib/automobile/analytics';
import { apiClientFetch } from '@/services/api-client';

type VehicleCard = {
  id: string;
  name: string;
  slug: string;
  bodyType?: string | null;
  fuelType?: string | null;
  exShowroomPrice?: unknown;
  manufacturer?: { name?: string | null; slug?: string | null } | null;
};

type Props = {
  bodyType: string;
  fuelLabel: string;
  price: number | null;
  manufacturerSlug: string;
  manufacturerName: string;
};

export function SimilarVehicleComparison({
  bodyType,
  fuelLabel,
  price,
  manufacturerSlug,
  manufacturerName,
}: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cars, setCars] = useState<VehicleCard[]>([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      try {
        const params = new URLSearchParams({ limit: '6' });
        if (bodyType) params.set('bodyType', bodyType);
        if (price && price > 0) {
          params.set('minPrice', String(Math.round(price * 0.7)));
          params.set('maxPrice', String(Math.round(price * 1.3)));
        }
        const { data } = await apiClientFetch<VehicleCard[]>(
          `/automobile/vehicles?${params.toString()}`,
        );
        const rows = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setCars(rows.slice(0, 3));
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [bodyType, price, reload]);

  const compareHref =
    cars.length >= 2
      ? `/automobile/compare?ids=${cars
          .slice(0, 2)
          .map((car) => car.id)
          .join(',')}`
      : '/automobile/compare';

  return (
    <section id="similar-cars" className="scroll-mt-24">
      <h3 className="text-base font-bold text-[#0b1f3a]">Compare resale value with similar cars</h3>
      <p className="mt-1 text-sm text-slate-600">
        Similar published vehicles from the Varnarc catalogue. Ex-showroom prices are shown only
        when the catalogue has them.
      </p>
      {status === 'loading' ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : null}
      {status === 'error' ? (
        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Similar cars could not be loaded.{' '}
          <button
            type="button"
            className="font-semibold text-[#ea580c]"
            onClick={() => setReload((value) => value + 1)}
          >
            Try again
          </button>
        </p>
      ) : null}
      {status === 'ready' && cars.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No close catalogue matches right now.{' '}
          {manufacturerSlug ? (
            <Link
              href={`/automobile/manufacturers/${manufacturerSlug}`}
              className="font-semibold text-[#ea580c]"
            >
              Browse {manufacturerName || 'this manufacturer'}
            </Link>
          ) : (
            <Link href="/automobile/vehicles" className="font-semibold text-[#ea580c]">
              Browse vehicles
            </Link>
          )}
        </p>
      ) : null}
      {status === 'ready' && cars.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {cars.map((car) => {
            const listed = parseInrAmount(car.exShowroomPrice);
            return (
              <li key={car.id} className="flex flex-col rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-[#0b1f3a]">{car.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {[car.bodyType, car.fuelType || fuelLabel].filter(Boolean).join(' · ') ||
                    'Published vehicle'}
                </p>
                {listed ? (
                  <p className="mt-2 text-sm text-slate-700">
                    Catalogue ex-showroom {formatInrCompact(listed)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Catalogue price not listed</p>
                )}
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/automobile/vehicles/${car.slug}`}
                    className="min-h-11 text-sm font-semibold text-[#ea580c]"
                    onClick={() =>
                      trackAutomobileEvent('resale_comparison_clicked', {
                        manufacturer: car.manufacturer?.slug,
                        model: car.slug,
                      })
                    }
                  >
                    View details
                  </Link>
                  <Link
                    href={compareHref}
                    className="min-h-11 text-sm font-semibold text-[#0b1f3a]"
                  >
                    Compare cars
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
