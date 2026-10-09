'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@varnarc/ui';
import { MediaPicker } from '@/components/media-picker';

const inputClass =
  'h-10 w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export type CatalogColor = { id: string; name: string; hex?: string | null };

export type BrochureDetails = {
  sourceName?: string;
  sourceUrl?: string;
  groups?: Array<{ title: string; rows: Array<{ label: string; value: string }> }>;
  features?: Array<{ name: string; value: string }>;
};

const EMPTY_SPEC_GROUPS: NonNullable<BrochureDetails['groups']> = [
  {
    title: 'Dimensions',
    rows: [
      { label: 'Overall length', value: '' },
      { label: 'Overall width', value: '' },
      { label: 'Overall height (unladen)', value: '' },
      { label: 'Wheelbase', value: '' },
      { label: 'Turning radius', value: '' },
      { label: 'Seating capacity', value: '' },
    ],
  },
  {
    title: 'Engine',
    rows: [
      { label: 'Engine type', value: '' },
      { label: 'Fuel type', value: '' },
      { label: 'Piston displacement', value: '' },
      { label: 'Maximum power', value: '' },
      { label: 'Maximum torque', value: '' },
      { label: 'Emission standard', value: '' },
      { label: 'Fuel tank capacity', value: '' },
    ],
  },
  { title: 'Transmission', rows: [{ label: 'Transmission type', value: '' }] },
  {
    title: 'Suspension',
    rows: [
      { label: 'Front', value: '' },
      { label: 'Rear', value: '' },
    ],
  },
  { title: 'Tyres', rows: [{ label: 'Tyre size', value: '' }] },
  {
    title: 'Brakes',
    rows: [
      { label: 'Front', value: '' },
      { label: 'Rear', value: '' },
    ],
  },
  {
    title: 'Mileage',
    rows: [
      { label: 'Claimed mileage', value: '' },
      { label: 'Test basis', value: '' },
    ],
  },
  { title: 'Warranty', rows: [{ label: 'Warranty', value: '' }] },
];

function specSheet(brochure?: BrochureDetails | null): BrochureDetails {
  if (brochure?.groups?.length) {
    return {
      sourceName: brochure.sourceName ?? '',
      sourceUrl: brochure.sourceUrl ?? '',
      groups: brochure.groups,
      features: brochure.features ?? [],
    };
  }
  return {
    sourceName: '',
    sourceUrl: '',
    groups: EMPTY_SPEC_GROUPS.map((group) => ({
      title: group.title,
      rows: group.rows.map((row) => ({ ...row })),
    })),
    features: [],
  };
}

function filledBrochure(brochure: BrochureDetails): BrochureDetails | null {
  const groups = (brochure.groups ?? [])
    .map((group) => ({
      title: group.title.trim(),
      rows: group.rows
        .filter((row) => row.label.trim() && row.value.trim())
        .map((row) => ({ label: row.label.trim(), value: row.value.trim() })),
    }))
    .filter((group) => group.title && group.rows.length);
  const features = (brochure.features ?? [])
    .filter((feature) => feature.name.trim())
    .map((feature) => ({
      name: feature.name.trim(),
      value: feature.value.trim() || 'Yes',
    }));
  if (!groups.length && !features.length) return null;
  return {
    ...(brochure.sourceName?.trim() ? { sourceName: brochure.sourceName.trim() } : {}),
    ...(brochure.sourceUrl?.trim() ? { sourceUrl: brochure.sourceUrl.trim() } : {}),
    groups,
    features,
  };
}

function specificationsWithBrochure(existing: unknown, brochure: BrochureDetails) {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  const filled = filledBrochure(brochure);
  if (!filled) {
    delete base.brochure;
    return Object.keys(base).length ? base : undefined;
  }
  return { ...base, brochure: filled };
}

function BrochureSpecEditor({
  brochure,
  onChange,
}: {
  brochure: BrochureDetails;
  onChange: (next: BrochureDetails) => void;
}) {
  const groups = brochure.groups ?? [];
  const features = brochure.features ?? [];

  function updateRow(groupIndex: number, rowIndex: number, value: string) {
    onChange({
      ...brochure,
      groups: groups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              rows: group.rows.map((row, rowAt) => (rowAt === rowIndex ? { ...row, value } : row)),
            }
          : group,
      ),
    });
  }

  function updateFeature(featureIndex: number, value: string) {
    onChange({
      ...brochure,
      features: features.map((feature, index) =>
        index === featureIndex ? { ...feature, value } : feature,
      ),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--varnarc-border)] p-3 md:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
          Technical specifications
        </p>
        {brochure.sourceUrl ? (
          <a
            href={brochure.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--varnarc-brand)] hover:underline"
          >
            {brochure.sourceName || 'Official brochure'}
          </a>
        ) : null}
      </div>
      {groups.map((group, groupIndex) => (
        <div key={`${group.title}-${groupIndex}`}>
          <p className="mb-2 text-sm font-medium">{group.title}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.rows.map((row, rowIndex) => (
              <label key={`${group.title}-${row.label}-${rowIndex}`} className="block">
                <span className="mb-1 block text-xs text-[var(--varnarc-muted)]">{row.label}</span>
                <input
                  className={inputClass}
                  value={row.value}
                  placeholder={row.label}
                  onChange={(event) => updateRow(groupIndex, rowIndex, event.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      {features.length ? (
        <div>
          <p className="mb-2 text-sm font-medium">Features on this variant</p>
          <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
            {features.map((feature, featureIndex) => (
              <label key={`${feature.name}-${featureIndex}`} className="block">
                <span className="mb-1 block text-xs text-[var(--varnarc-muted)]">
                  {feature.name}
                </span>
                <input
                  className={inputClass}
                  value={feature.value}
                  onChange={(event) => updateFeature(featureIndex, event.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function swatch(hex?: string | null) {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#d1d5db';
}

function VehicleColorPicker({
  catalog,
  selectedIds,
  onSelectedChange,
  onCatalogChange,
}: {
  catalog: CatalogColor[];
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  onCatalogChange: (colors: CatalogColor[]) => void;
}) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#d1d5db');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function addColor() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/automobile/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, hex }),
      });
      const json = (await res.json()) as {
        data?: CatalogColor;
        error?: { message?: string };
      };
      if (!res.ok || !json.data?.id) {
        throw new Error(json.error?.message || 'Could not add color');
      }
      const saved = json.data;
      const nextCatalog = catalog.some((color) => color.id === saved.id)
        ? catalog.map((color) => (color.id === saved.id ? { ...color, ...saved } : color))
        : [...catalog, saved].sort((a, b) => a.name.localeCompare(b.name));
      onCatalogChange(nextCatalog);
      if (!selectedIds.includes(saved.id)) onSelectedChange([...selectedIds, saved.id]);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add color');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="md:col-span-2 lg:col-span-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
          Available colors
        </p>
        <Link
          href="/automobile/colors"
          className="text-xs text-[var(--varnarc-brand)] hover:underline"
        >
          Manage all colors
        </Link>
      </div>
      {catalog.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {catalog.map((color) => {
            const selected = selectedIds.includes(color.id);
            return (
              <button
                key={color.id}
                type="button"
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                  selected
                    ? 'border-[var(--varnarc-brand)] bg-[var(--varnarc-brand)]/10'
                    : 'border-[var(--varnarc-border)]'
                }`}
                onClick={() =>
                  onSelectedChange(
                    selected
                      ? selectedIds.filter((id) => id !== color.id)
                      : [...selectedIds, color.id],
                  )
                }
              >
                <span
                  className="h-4 w-4 rounded-full border border-slate-200"
                  style={{ backgroundColor: swatch(color.hex) }}
                  aria-hidden
                />
                {color.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mb-3 text-sm text-[var(--varnarc-muted)]">No colors in the catalogue yet.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          aria-label="New color swatch"
          className="h-10 w-12 cursor-pointer rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-1"
          value={swatch(hex)}
          onChange={(event) => setHex(event.target.value)}
        />
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Add a color, for example Pearl White"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="button"
          className="text-sm text-[var(--varnarc-brand)] hover:underline disabled:opacity-60"
          disabled={adding || !name.trim()}
          onClick={() => void addColor()}
        >
          {adding ? 'Adding…' : 'Add color'}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ManufacturerField({
  manufacturerId,
  manufacturers,
  onChange,
}: {
  manufacturerId: string;
  manufacturers: Array<{ id: string; name: string }>;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <select
        className={inputClass}
        value={manufacturerId}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Manufacturer"
      >
        <option value="">Select manufacturer</option>
        {manufacturers.map((manufacturer) => (
          <option key={manufacturer.id} value={manufacturer.id}>
            {manufacturer.name}
          </option>
        ))}
      </select>
      <div className="mt-1 flex flex-wrap gap-3 text-xs">
        <Link
          href="/automobile/manufacturers"
          className="text-[var(--varnarc-brand)] hover:underline"
        >
          Manufacturer page
        </Link>
        {manufacturerId ? (
          <Link
            href={`/automobile/manufacturers/${manufacturerId}`}
            className="text-[var(--varnarc-brand)] hover:underline"
          >
            Edit this manufacturer
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function sortManufacturersByName<T extends { name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function AutomobileFormShell({
  title,
  message,
  children,
}: {
  title: string;
  message: string | null;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
      {message ? <p className="mt-3 text-sm text-[var(--varnarc-subtle)]">{message}</p> : null}
    </div>
  );
}

function FormActions({
  loading,
  disabled,
  onSave,
  onCancel,
  label = 'Create',
  loadingLabel = 'Saving…',
}: {
  loading: boolean;
  disabled: boolean;
  onSave: () => void;
  onCancel?: () => void;
  label?: string;
  loadingLabel?: string;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <Button type="button" disabled={loading || disabled} onClick={onSave}>
        {loading ? loadingLabel : label}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

export function AutomobilePublishButton({
  entity,
  id,
  status,
}: {
  entity: 'manufacturers' | 'vehicles';
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === 'PUBLISHED') return null;

  async function publish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/automobile/${entity}/${id}/publish`, { method: 'POST' });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Publish failed');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={() => void publish()}
    >
      {loading ? 'Publishing…' : 'Publish'}
    </Button>
  );
}

export function AutomobileDuplicateButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function duplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/automobile/vehicles/${id}/duplicate`, { method: 'POST' });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Duplicate failed');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Duplicate failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={() => void duplicate()}
    >
      {loading ? 'Duplicating…' : 'Duplicate'}
    </Button>
  );
}

type GalleryItem = {
  mediaId?: string | null;
  imageUrl?: string | null;
  previewUrl?: string | null;
};

function AutomobileGalleryEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  return (
    <div className="md:col-span-2 lg:col-span-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
        Gallery (library, file, or URL)
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div
            key={`${item.mediaId ?? item.imageUrl ?? index}`}
            className="relative rounded border p-2"
          >
            {item.previewUrl || item.imageUrl ? (
              <img
                src={item.previewUrl || item.imageUrl || ''}
                alt=""
                className="h-16 w-16 rounded object-cover"
              />
            ) : null}
            <button
              type="button"
              className="mt-1 block text-xs text-red-600"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <MediaPicker
        value={null}
        onChange={(mediaId, previewUrl) => {
          if (!mediaId && !previewUrl) return;
          onChange([
            ...items,
            { mediaId, imageUrl: previewUrl ?? null, previewUrl: previewUrl ?? null },
          ]);
        }}
      />
    </div>
  );
}

export function AutomobileVehicleReviewLinker({
  vehicleId,
  initialReviewIds,
}: {
  vehicleId: string;
  initialReviewIds: string[];
}) {
  const router = useRouter();
  const [options, setOptions] = useState<
    Array<{ id: string; title: string; slug: string; product?: { name?: string | null } }>
  >([]);
  const [selected, setSelected] = useState<string[]>(initialReviewIds);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/automobile/review-options');
      const json = (await res.json()) as { data?: typeof options };
      if (Array.isArray(json.data)) setOptions(json.data);
    })();
  }, []);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/automobile/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewIds: selected }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setMessage('Review links saved');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="Linked reviews" message={message}>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded border border-[var(--varnarc-border)] p-3">
        {options.map((review) => (
          <label key={review.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(review.id)}
              onChange={(e) => {
                setSelected((prev) =>
                  e.target.checked ? [...prev, review.id] : prev.filter((id) => id !== review.id),
                );
              }}
            />
            <span>
              {review.title}
              {review.product?.name ? (
                <span className="ml-1 text-xs text-[var(--varnarc-subtle)]">
                  ({review.product.name})
                </span>
              ) : null}
            </span>
          </label>
        ))}
        {!options.length ? (
          <p className="text-sm text-[var(--varnarc-subtle)]">No published reviews found.</p>
        ) : null}
      </div>
      <FormActions
        loading={loading}
        disabled={false}
        onSave={() => void save()}
        label="Save review links"
        loadingLabel="Saving…"
      />
    </AutomobileFormShell>
  );
}

export function AutomobileManufacturerForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || slugify(name),
          country: country || undefined,
          website: website || undefined,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setName('');
      setSlug('');
      setCountry('');
      setWebsite('');
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="New manufacturer" message={message}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          className={inputClass}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Website URL"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <FormActions loading={loading} disabled={!name} onSave={() => void save()} />
    </AutomobileFormShell>
  );
}

export function AutomobileManufacturerEditForm({
  id,
  initial,
}: {
  id: string;
  initial: {
    name: string;
    slug: string;
    country?: string | null;
    foundedYear?: number | null;
    website?: string | null;
    tagline?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    logoMediaId?: string | null;
    featured?: boolean;
    availableInIndia?: boolean;
    indiaAvailabilityStatus?: string | null;
    indiaWebsite?: string | null;
    indiaVerifiedDate?: string | null;
    indiaVerificationNote?: string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [country, setCountry] = useState(initial.country ?? '');
  const [foundedYear, setFoundedYear] = useState(
    initial.foundedYear != null ? String(initial.foundedYear) : '',
  );
  const [website, setWebsite] = useState(initial.website ?? '');
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [logoMediaId, setLogoMediaId] = useState<string | null>(initial.logoMediaId ?? null);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? '');
  const [featured, setFeatured] = useState(Boolean(initial.featured));
  const [availableInIndia, setAvailableInIndia] = useState(Boolean(initial.availableInIndia));
  const [indiaAvailabilityStatus, setIndiaAvailabilityStatus] = useState(
    initial.indiaAvailabilityStatus ?? '',
  );
  const [indiaWebsite, setIndiaWebsite] = useState(initial.indiaWebsite ?? '');
  const [indiaVerifiedDate, setIndiaVerifiedDate] = useState(initial.indiaVerifiedDate ?? '');
  const [indiaVerificationNote, setIndiaVerificationNote] = useState(
    initial.indiaVerificationNote ?? '',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/automobile/manufacturers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          country: country || undefined,
          foundedYear: foundedYear ? Number(foundedYear) : null,
          website: website || undefined,
          tagline: tagline || null,
          description: description || undefined,
          logoMediaId,
          logoUrl: logoUrl || undefined,
          featured,
          availableInIndia,
          indiaAvailabilityStatus: indiaAvailabilityStatus || null,
          indiaWebsite: indiaWebsite || null,
          indiaVerifiedDate: indiaVerifiedDate || null,
          indiaVerificationNote: indiaVerificationNote || null,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setMessage('Saved');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="Edit manufacturer" message={message}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className={inputClass}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Founded year"
          inputMode="numeric"
          value={foundedYear}
          onChange={(e) => setFoundedYear(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Website URL"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <input
          className={`${inputClass} md:col-span-2`}
          placeholder="Slogan"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
            Logo
          </p>
          <MediaPicker
            value={logoMediaId}
            previewUrl={logoUrl}
            onChange={(mediaId, previewUrl) => {
              setLogoMediaId(mediaId);
              setLogoUrl(previewUrl ?? '');
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableInIndia}
            onChange={(e) => setAvailableInIndia(e.target.checked)}
          />
          Available in India
        </label>
        <input
          className={inputClass}
          placeholder="India availability status"
          value={indiaAvailabilityStatus}
          onChange={(e) => setIndiaAvailabilityStatus(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="India website URL"
          value={indiaWebsite}
          onChange={(e) => setIndiaWebsite(e.target.value)}
        />
        <input
          className={inputClass}
          type="date"
          value={indiaVerifiedDate}
          onChange={(e) => setIndiaVerifiedDate(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-20 py-2 md:col-span-2`}
          placeholder="India verification note"
          value={indiaVerificationNote}
          onChange={(e) => setIndiaVerificationNote(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-24 py-2 md:col-span-2`}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <FormActions
        loading={loading}
        disabled={!name}
        onSave={() => void save()}
        label="Save changes"
        loadingLabel="Saving…"
      />
    </AutomobileFormShell>
  );
}

export function AutomobileVehicleForm({
  manufacturers,
  colors,
}: {
  manufacturers: Array<{ id: string; name: string }>;
  colors: CatalogColor[];
}) {
  const manufacturersSorted = sortManufacturersByName(manufacturers);
  const router = useRouter();
  const [manufacturerId, setManufacturerId] = useState(manufacturersSorted[0]?.id ?? '');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [torque, setTorque] = useState('');
  const [mileage, setMileage] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [warranty, setWarranty] = useState('');
  const [brochure, setBrochure] = useState<BrochureDetails>(() => specSheet(null));
  const [exShowroomPrice, setExShowroomPrice] = useState('');
  const [estimatedOnRoadPrice, setEstimatedOnRoadPrice] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [catalog, setCatalog] = useState<CatalogColor[]>(colors);
  const [colorIds, setColorIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturerId,
          name,
          slug: slugify(name),
          model,
          variant: variant || undefined,
          fuelType: fuelType || undefined,
          transmission: transmission || undefined,
          engineCapacity: engineCapacity || undefined,
          horsepower: horsepower ? Number(horsepower) : undefined,
          torque: torque ? Number(torque) : undefined,
          mileage: mileage ? Number(mileage) : undefined,
          seatingCapacity: seatingCapacity ? Number(seatingCapacity) : undefined,
          warranty: warranty || undefined,
          specifications: specificationsWithBrochure(undefined, brochure),
          exShowroomPrice: exShowroomPrice ? Number(exShowroomPrice) : undefined,
          estimatedOnRoadPrice: estimatedOnRoadPrice ? Number(estimatedOnRoadPrice) : undefined,
          affiliateUrl: affiliateUrl || undefined,
          featured,
          sponsored,
          colorIds,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setName('');
      setModel('');
      setVariant('');
      setTransmission('');
      setEngineCapacity('');
      setHorsepower('');
      setTorque('');
      setMileage('');
      setSeatingCapacity('');
      setWarranty('');
      setBrochure(specSheet(null));
      setExShowroomPrice('');
      setEstimatedOnRoadPrice('');
      setAffiliateUrl('');
      setFeatured(false);
      setSponsored(false);
      setColorIds([]);
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-6">
        <Button type="button" onClick={() => setOpen(true)}>
          Add vehicle
        </Button>
      </div>
    );
  }

  return (
    <AutomobileFormShell title="New vehicle" message={message}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ManufacturerField
          manufacturerId={manufacturerId}
          manufacturers={manufacturersSorted}
          onChange={setManufacturerId}
        />
        <input
          className={inputClass}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Variant"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Fuel type"
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Transmission"
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Engine capacity"
          value={engineCapacity}
          onChange={(e) => setEngineCapacity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Power (hp)"
          value={horsepower}
          onChange={(e) => setHorsepower(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Torque (Nm)"
          value={torque}
          onChange={(e) => setTorque(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Mileage"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Seating"
          value={seatingCapacity}
          onChange={(e) => setSeatingCapacity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Warranty"
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
        />
        <BrochureSpecEditor brochure={brochure} onChange={setBrochure} />
        <input
          className={inputClass}
          placeholder="India ex-showroom in rupees (not GBP)"
          value={exShowroomPrice}
          onChange={(e) => setExShowroomPrice(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="On-road price (₹)"
          value={estimatedOnRoadPrice}
          onChange={(e) => setEstimatedOnRoadPrice(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Affiliate URL"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sponsored}
            onChange={(e) => setSponsored(e.target.checked)}
          />
          Sponsored
        </label>
        <VehicleColorPicker
          catalog={catalog}
          selectedIds={colorIds}
          onSelectedChange={setColorIds}
          onCatalogChange={setCatalog}
        />
      </div>
      <FormActions
        loading={loading}
        disabled={!name || !model || !manufacturerId}
        onSave={() => void save()}
        onCancel={() => setOpen(false)}
      />
    </AutomobileFormShell>
  );
}

export function AutomobileVehicleEditForm({
  id,
  manufacturers,
  colors,
  initial,
}: {
  id: string;
  manufacturers: Array<{ id: string; name: string }>;
  colors: CatalogColor[];
  initial: {
    manufacturerId?: string | null;
    name: string;
    model: string;
    variant?: string | null;
    fuelType?: string | null;
    category?: string | null;
    imageUrl?: string | null;
    imageMediaId?: string | null;
    brochureUrl?: string | null;
    brochureMediaId?: string | null;
    galleryItems?: GalleryItem[];
    reviewIds?: string[];
    exShowroomPrice?: number | string | null;
    estimatedOnRoadPrice?: number | string | null;
    affiliateUrl?: string | null;
    description?: string | null;
    featured?: boolean;
    sponsored?: boolean;
    availableInIndia?: boolean;
    colorIds?: string[];
    transmission?: string | null;
    engineCapacity?: string | null;
    horsepower?: number | string | null;
    torque?: number | string | null;
    mileage?: number | string | null;
    seatingCapacity?: number | string | null;
    warranty?: string | null;
    brochure?: BrochureDetails | null;
    specifications?: unknown;
  };
}) {
  const manufacturersSorted = sortManufacturersByName(manufacturers);
  const router = useRouter();
  const [manufacturerId, setManufacturerId] = useState(initial.manufacturerId ?? '');
  const [name, setName] = useState(initial.name);
  const [model, setModel] = useState(initial.model);
  const [variant, setVariant] = useState(initial.variant ?? '');
  const [fuelType, setFuelType] = useState(initial.fuelType ?? '');
  const [transmission, setTransmission] = useState(initial.transmission ?? '');
  const [engineCapacity, setEngineCapacity] = useState(initial.engineCapacity ?? '');
  const [horsepower, setHorsepower] = useState(
    initial.horsepower != null ? String(initial.horsepower) : '',
  );
  const [torque, setTorque] = useState(initial.torque != null ? String(initial.torque) : '');
  const [mileage, setMileage] = useState(initial.mileage != null ? String(initial.mileage) : '');
  const [seatingCapacity, setSeatingCapacity] = useState(
    initial.seatingCapacity != null ? String(initial.seatingCapacity) : '',
  );
  const [warranty, setWarranty] = useState(initial.warranty ?? '');
  const [brochure, setBrochure] = useState<BrochureDetails>(() => specSheet(initial.brochure));
  const [category, setCategory] = useState(initial.category ?? '');
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? '');
  const [imageMediaId, setImageMediaId] = useState<string | null>(initial.imageMediaId ?? null);
  const [brochureUrl, setBrochureUrl] = useState(initial.brochureUrl ?? '');
  const [brochureMediaId, setBrochureMediaId] = useState<string | null>(
    initial.brochureMediaId ?? null,
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initial.galleryItems ?? []);
  const [exShowroomPrice, setExShowroomPrice] = useState(
    initial.exShowroomPrice != null ? String(initial.exShowroomPrice) : '',
  );
  const [estimatedOnRoadPrice, setEstimatedOnRoadPrice] = useState(
    initial.estimatedOnRoadPrice != null ? String(initial.estimatedOnRoadPrice) : '',
  );
  const [affiliateUrl, setAffiliateUrl] = useState(initial.affiliateUrl ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [featured, setFeatured] = useState(Boolean(initial.featured));
  const [sponsored, setSponsored] = useState(Boolean(initial.sponsored));
  const [availableInIndia, setAvailableInIndia] = useState(Boolean(initial.availableInIndia));
  const [catalog, setCatalog] = useState<CatalogColor[]>(colors);
  const [colorIds, setColorIds] = useState<string[]>(initial.colorIds ?? []);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const galleryImages = galleryItems.map((item, index) => ({
        mediaId: item.mediaId,
        imageUrl: item.imageUrl,
        displayOrder: index,
      }));
      const res = await fetch(`/api/admin/automobile/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturerId: manufacturerId || undefined,
          name,
          model,
          variant: variant || '',
          fuelType: fuelType || undefined,
          transmission: transmission || null,
          engineCapacity: engineCapacity || null,
          horsepower: horsepower ? Number(horsepower) : null,
          torque: torque ? Number(torque) : null,
          mileage: mileage ? Number(mileage) : null,
          seatingCapacity: seatingCapacity ? Number(seatingCapacity) : null,
          warranty: warranty || null,
          specifications: specificationsWithBrochure(initial.specifications, brochure),
          category: category || undefined,
          imageUrl: imageUrl || '',
          brochureUrl: brochureUrl || '',
          brochureMediaId,
          galleryImages,
          exShowroomPrice: exShowroomPrice ? Number(exShowroomPrice) : undefined,
          estimatedOnRoadPrice: estimatedOnRoadPrice ? Number(estimatedOnRoadPrice) : undefined,
          affiliateUrl: affiliateUrl || undefined,
          description: description || undefined,
          featured,
          sponsored,
          availableInIndia,
          colorIds,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setMessage('Saved');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="Edit vehicle" message={message}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ManufacturerField
          manufacturerId={manufacturerId}
          manufacturers={manufacturersSorted}
          onChange={setManufacturerId}
        />
        <input
          className={inputClass}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Variant"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Fuel type"
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Transmission"
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Engine capacity"
          value={engineCapacity}
          onChange={(e) => setEngineCapacity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Power (hp)"
          value={horsepower}
          onChange={(e) => setHorsepower(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Torque (Nm)"
          value={torque}
          onChange={(e) => setTorque(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Mileage"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Seating"
          value={seatingCapacity}
          onChange={(e) => setSeatingCapacity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Warranty"
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
        />
        <BrochureSpecEditor brochure={brochure} onChange={setBrochure} />
        <VehicleColorPicker
          catalog={catalog}
          selectedIds={colorIds}
          onSelectedChange={setColorIds}
          onCatalogChange={setCatalog}
        />
        <input
          className={inputClass}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="India ex-showroom in rupees (not GBP)"
          value={exShowroomPrice}
          onChange={(e) => setExShowroomPrice(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="On-road price (₹)"
          value={estimatedOnRoadPrice}
          onChange={(e) => setEstimatedOnRoadPrice(e.target.value)}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
            Primary image
          </p>
          <MediaPicker
            value={imageMediaId}
            previewUrl={imageUrl}
            label="Primary image"
            onChange={(mediaId, previewUrl) => {
              setImageMediaId(mediaId);
              setImageUrl(previewUrl ?? '');
            }}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--varnarc-subtle)]">
            Brochure PDF/image
          </p>
          <MediaPicker
            value={brochureMediaId}
            previewUrl={brochureUrl}
            label="Brochure"
            accept="image/*,.pdf,application/pdf"
            onChange={(mediaId, previewUrl) => {
              setBrochureMediaId(mediaId);
              setBrochureUrl(previewUrl ?? '');
            }}
          />
        </div>
        <AutomobileGalleryEditor items={galleryItems} onChange={setGalleryItems} />
        <input
          className={inputClass}
          placeholder="Affiliate URL"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sponsored}
            onChange={(e) => setSponsored(e.target.checked)}
          />
          Sponsored
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableInIndia}
            onChange={(e) => setAvailableInIndia(e.target.checked)}
          />
          Available in India
        </label>
        <textarea
          className={`${inputClass} min-h-24 py-2 md:col-span-2 lg:col-span-3`}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <FormActions
        loading={loading}
        disabled={!name || !model}
        onSave={() => void save()}
        label="Save changes"
        loadingLabel="Saving…"
      />
    </AutomobileFormShell>
  );
}

export function AutomobileMaintenanceForm({
  vehicles,
}: {
  vehicles: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [serviceInterval, setServiceInterval] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          title,
          serviceInterval,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
          notes: notes || undefined,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setTitle('');
      setServiceInterval('');
      setEstimatedCost('');
      setNotes('');
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="New maintenance schedule" message={message}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <select
          className={inputClass}
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Service interval (e.g. 10,000 km / 12 months)"
          value={serviceInterval}
          onChange={(e) => setServiceInterval(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Estimated cost (₹)"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-20 py-2 md:col-span-2`}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <FormActions
        loading={loading}
        disabled={!vehicleId || !title || !serviceInterval}
        onSave={() => void save()}
      />
    </AutomobileFormShell>
  );
}

export function AutomobileFaqForm() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setQuestion('');
      setAnswer('');
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="New FAQ" message={message}>
      <div className="grid gap-3">
        <input
          className={inputClass}
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-24 py-2`}
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <FormActions loading={loading} disabled={!question || !answer} onSave={() => void save()} />
    </AutomobileFormShell>
  );
}

export function AutomobileGuideForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          summary: summary || undefined,
          body: body || undefined,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setTitle('');
      setSlug('');
      setSummary('');
      setBody('');
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="New guide" message={message}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className={inputClass}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-20 py-2 md:col-span-2`}
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-32 py-2 md:col-span-2`}
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <FormActions loading={loading} disabled={!title} onSave={() => void save()} />
    </AutomobileFormShell>
  );
}

export function AutomobileComparisonForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ids, setIds] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vehicles',
          title,
          ids: ids
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      setTitle('');
      setIds('');
      setMessage('Created');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AutomobileFormShell title="New comparison" message={message}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className={inputClass}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Vehicle IDs (comma-separated)"
          value={ids}
          onChange={(e) => setIds(e.target.value)}
        />
      </div>
      <FormActions loading={loading} disabled={!title || !ids} onSave={() => void save()} />
    </AutomobileFormShell>
  );
}

export function AutomobileVersionHistory({
  entity,
  entityId,
}: {
  entity: string;
  entityId: string;
}) {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      action: string;
      createdAt: string;
      user?: { email?: string | null } | null;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/automobile/history/${entity}/${entityId}`);
        const json = (await res.json()) as {
          data?: Array<{
            id: string;
            action: string;
            createdAt: string;
            user?: { email?: string | null } | null;
          }>;
          error?: { message?: string };
        };
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load history');
        setRows(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      }
    })();
  }, [entity, entityId]);

  return (
    <div className="mt-6 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
      <h3 className="mb-2 text-sm font-semibold">Version history</h3>
      {error ? <p className="text-sm text-[var(--varnarc-subtle)]">{error}</p> : null}
      {!error && !rows.length ? (
        <p className="text-sm text-[var(--varnarc-subtle)]">No audited changes yet.</p>
      ) : null}
      {rows.length ? (
        <ul className="space-y-1 text-sm text-[var(--varnarc-subtle)]">
          {rows.map((row) => (
            <li key={row.id}>
              {row.action} · {new Date(row.createdAt).toLocaleString()}
              {row.user?.email ? ` · ${row.user.email}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
