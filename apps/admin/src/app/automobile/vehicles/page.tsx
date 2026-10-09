import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import Link from 'next/link';
import { AutomobileCsvToolbar, AutomobileListSearch } from '@/components/automobile-admin-toolbar';
import { AutomobileVehicleForm, type CatalogColor } from '@/components/automobile-forms';
import { AutomobileVehiclesDataTable } from '@/components/automobile-vehicles-data-table';
import { apiServerFetch } from '@/lib/api';

type VehicleRow = {
  id: string;
  name: string;
  status: string;
  model?: string | null;
  modelYear?: number | null;
  fuelType?: string | null;
  exShowroomPrice?: number | string | null;
  sourceName?: string | null;
  availableInIndia?: boolean;
  manufacturer?: { name: string } | null;
};

type ManufacturerRow = { id: string; name: string };

const LIST_KEYS = [
  'search',
  'status',
  'fuelType',
  'category',
  'manufacturerId',
  'india',
  'year',
  'yearFrom',
  'yearTo',
  'sort',
  'bodyType',
  'transmission',
  'minSeats',
  'minPrice',
  'maxPrice',
  'page',
  'limit',
] as const;

type VehicleQuery = Partial<Record<(typeof LIST_KEYS)[number], string>>;

const SORTS = new Set(['featured', 'price_asc', 'price_desc', 'mileage', 'newest']);

function yearNumber(value?: string) {
  const n = Number(value);
  if (!value?.trim() || !Number.isInteger(n) || n < 1950 || n > 2100) return undefined;
  return n;
}

function listHref(params: VehicleQuery, overrides: Partial<VehicleQuery> = {}) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const key of LIST_KEYS) {
    const value = merged[key]?.trim();
    if (value) qs.set(key, value);
  }
  const encoded = qs.toString();
  return encoded ? `/automobile/vehicles?${encoded}` : '/automobile/vehicles';
}

export default async function AutomobileVehiclesAdminPage({
  searchParams,
}: {
  searchParams: Promise<VehicleQuery>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 25));
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.fuelType) qs.set('fuelType', params.fuelType);
  if (params.category) qs.set('category', params.category);
  if (params.manufacturerId) qs.set('manufacturerId', params.manufacturerId);
  if (params.india === 'yes') qs.set('availableInIndia', 'true');
  if (params.india === 'no') qs.set('availableInIndia', 'false');
  const currentYear = new Date().getFullYear();
  const exactYear = yearNumber(params.year);
  if (params.year === 'latest') {
    qs.set('modelYearFrom', String(currentYear - 1));
    if (!params.sort) qs.set('sort', 'newest');
  } else if (exactYear) {
    qs.set('modelYear', String(exactYear));
  } else {
    const from = yearNumber(params.yearFrom);
    const to = yearNumber(params.yearTo);
    if (from) qs.set('modelYearFrom', String(from));
    if (to) qs.set('modelYearTo', String(to));
  }
  if (params.sort && SORTS.has(params.sort)) qs.set('sort', params.sort);
  if (params.bodyType) qs.set('bodyType', params.bodyType);
  if (params.transmission) qs.set('transmission', params.transmission);
  const seats = Number(params.minSeats);
  if (params.minSeats && Number.isInteger(seats) && seats > 0) qs.set('minSeats', String(seats));
  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);
  if (params.minPrice && Number.isFinite(minPrice) && minPrice >= 0)
    qs.set('minPrice', String(minPrice));
  if (params.maxPrice && Number.isFinite(maxPrice) && maxPrice >= 0)
    qs.set('maxPrice', String(maxPrice));

  const [vehiclesResult, manufacturersResult, colorsResult] = await Promise.all([
    apiServerFetch<VehicleRow[]>(`/automobile/admin/vehicles?${qs.toString()}`, {
      signal: AbortSignal.timeout(20_000),
    }),
    apiServerFetch<ManufacturerRow[]>('/automobile/admin/manufacturers/options', {
      signal: AbortSignal.timeout(20_000),
    }),
    apiServerFetch<CatalogColor[]>('/automobile/admin/colors', {
      signal: AbortSignal.timeout(20_000),
    }),
  ]);
  const rows = Array.isArray(vehiclesResult.data) ? vehiclesResult.data : [];
  const manufacturers = Array.isArray(manufacturersResult.data) ? manufacturersResult.data : [];
  const colors = Array.isArray(colorsResult.data) ? colorsResult.data : [];
  const total = Number(vehiclesResult.meta?.total ?? rows.length);
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Filter and page the catalog on the server. India-only uses the available-in-India flag."
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/automobile/manufacturers"
              className="text-sm text-[var(--varnarc-brand)] hover:underline"
            >
              Manufacturers
            </Link>
            <a
              href={`/api/admin/automobile/vehicles/export?${qs.toString()}`}
              className="inline-flex h-9 items-center rounded-md border border-[var(--varnarc-border)] px-3 text-sm font-medium hover:bg-[var(--varnarc-muted)]"
            >
              Export JSON
            </a>
            <Badge>{total.toLocaleString('en-IN')} matching</Badge>
          </div>
        }
      />

      <AutomobileListSearch
        defaultValue={params.search}
        status={params.status}
        fuelType={params.fuelType}
        category={params.category}
        manufacturerId={params.manufacturerId}
        india={params.india}
        year={params.year}
        yearFrom={params.yearFrom}
        yearTo={params.yearTo}
        sort={params.sort}
        bodyType={params.bodyType}
        transmission={params.transmission}
        minSeats={params.minSeats}
        minPrice={params.minPrice}
        maxPrice={params.maxPrice}
        limit={String(limit)}
        manufacturers={manufacturers}
        showVehicleFilters
      />
      <AutomobileCsvToolbar entity="vehicles" />
      <AutomobileVehicleForm manufacturers={manufacturers} colors={colors} />

      {vehiclesResult.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load vehicles</CardTitle>
            <CardDescription>{vehiclesResult.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <AutomobileVehiclesDataTable rows={rows} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--varnarc-subtle)]">
            <span>
              Showing {from}–{to} of {total.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={listHref(params, { page: String(page - 1), limit: String(limit) })}
                  className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 leading-8"
                >
                  Previous
                </Link>
              ) : (
                <span className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 leading-8 opacity-40">
                  Previous
                </span>
              )}
              <span>
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link
                  href={listHref(params, { page: String(page + 1), limit: String(limit) })}
                  className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 leading-8"
                >
                  Next
                </Link>
              ) : (
                <span className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 leading-8 opacity-40">
                  Next
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
