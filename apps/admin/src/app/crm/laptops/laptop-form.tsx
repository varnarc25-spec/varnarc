'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  CRM_LAPTOP_AVAILABILITY,
  CRM_LAPTOP_AVAILABILITY_LABELS,
  CRM_LAPTOP_CATEGORIES,
  CRM_LAPTOP_CATEGORY_LABELS,
  CRM_LAPTOP_STATUSES,
  CRM_LAPTOP_STATUS_LABELS,
  discountedMonthlyRate,
  formatProposalInr,
  type CrmLaptopAvailability,
  type RentalDiscountTier,
  type CrmLaptopCategory,
  type CrmLaptopStatus,
} from '@varnarc/validation';

const inputClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

export type LaptopValues = {
  name: string;
  category: CrmLaptopCategory;
  brand: string;
  model: string;
  listedYear: number | null;
  generation: string;
  processor: string;
  processorFull: string;
  ram: string;
  storage: string;
  display: string;
  graphics: string;
  camera: boolean;
  operatingSystem: string;
  modelNumber: string;
  ports: string;
  adapter: string;
  useCase: string;
  condition: string;
  notes: string;
  assetTag: string;
  serialNumber: string;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  taxesNote: string;
  availability: CrmLaptopAvailability;
  status: CrmLaptopStatus;
};

export function LaptopForm({
  laptopId,
  initial,
  submitLabel,
  discounts,
}: {
  laptopId?: string;
  initial: LaptopValues;
  submitLabel: string;
  discounts: RentalDiscountTier[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof LaptopValues>(key: K, value: LaptopValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const path = laptopId ? `/api/admin/crm/laptops/${laptopId}` : '/api/admin/crm/laptops';
    try {
      const res = await fetch(path, {
        method: laptopId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, commitmentRate: form.monthlyRate ?? 0 }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { id?: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.data?.id)
        throw new Error(json.error?.message ?? 'Could not save the laptop.');
      router.push('/crm/laptops');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the laptop.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2">
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
      <h3 className="text-sm font-medium sm:col-span-2">Product</h3>
      <Text label="Name" required value={form.name} onChange={(value) => set('name', value)} />
      <label className="text-sm">
        Category
        <select
          className={inputClass}
          value={form.category}
          onChange={(event) => set('category', event.target.value as CrmLaptopCategory)}
        >
          {CRM_LAPTOP_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CRM_LAPTOP_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>
      <Text label="Brand" required value={form.brand} onChange={(value) => set('brand', value)} />
      <Text label="Model" value={form.model} onChange={(value) => set('model', value)} />
      <label className="text-sm">
        Listed year
        <input
          className={inputClass}
          type="number"
          min={1990}
          max={2100}
          value={form.listedYear ?? ''}
          onChange={(event) =>
            set('listedYear', event.target.value === '' ? null : Number(event.target.value))
          }
        />
      </label>
      <Text
        label="Generation"
        value={form.generation}
        onChange={(value) => set('generation', value)}
      />
      <label className="text-sm">
        Availability
        <select
          className={inputClass}
          value={form.availability}
          onChange={(event) => set('availability', event.target.value as CrmLaptopAvailability)}
        >
          {CRM_LAPTOP_AVAILABILITY.map((availability) => (
            <option key={availability} value={availability}>
              {CRM_LAPTOP_AVAILABILITY_LABELS[availability]}
            </option>
          ))}
        </select>
      </label>

      <h3 className="text-sm font-medium sm:col-span-2">Specification</h3>
      <Text
        label="Processor"
        required
        value={form.processor}
        onChange={(value) => set('processor', value)}
      />
      <Text
        label="Processor (full)"
        value={form.processorFull}
        onChange={(value) => set('processorFull', value)}
      />
      <Text
        label="RAM"
        value={form.ram}
        onChange={(value) => set('ram', value)}
        hint="Separate options with a slash, such as 16GB / 32GB."
      />
      <Text
        label="Storage"
        value={form.storage}
        onChange={(value) => set('storage', value)}
        hint="Separate options with a slash, such as 512GB SSD / 1TB SSD."
      />
      <Text label="Screen" value={form.display} onChange={(value) => set('display', value)} />
      <Text label="Graphics" value={form.graphics} onChange={(value) => set('graphics', value)} />
      <Text
        label="Operating system"
        required
        value={form.operatingSystem}
        onChange={(value) => set('operatingSystem', value)}
      />
      <Text
        label="Model number"
        value={form.modelNumber}
        onChange={(value) => set('modelNumber', value)}
      />
      <Text label="Ports" value={form.ports} onChange={(value) => set('ports', value)} />
      <Text label="Adapter" value={form.adapter} onChange={(value) => set('adapter', value)} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={form.camera}
          onChange={(event) => set('camera', event.target.checked)}
        />
        Camera
      </label>
      <Text label="Use case" value={form.useCase} onChange={(value) => set('useCase', value)} />
      <Text
        label="Condition"
        value={form.condition}
        onChange={(value) => set('condition', value)}
      />

      <h3 className="text-sm font-medium sm:col-span-2">Pricing and deposit</h3>
      <Money
        label="One-month rental per laptop (₹)"
        value={form.monthlyRate}
        onChange={(value) => set('monthlyRate', value)}
      />
      <div className="grid gap-3 text-sm sm:col-span-2 sm:grid-cols-4">
        {[...discounts]
          .sort((left, right) => left.months - right.months)
          .map((tier) => {
            const price = discountedMonthlyRate(form.monthlyRate, tier.percent);
            return (
              <p
                key={tier.months}
                className="rounded-md border border-[var(--varnarc-border)] px-3 py-2"
              >
                <span className="text-[var(--varnarc-subtle)]">
                  {tier.months} months · {tier.percent}% off
                </span>
                <span className="mt-1 block font-medium">
                  {price == null ? '—' : `${formatProposalInr(price)} / month`}
                </span>
              </p>
            );
          })}
      </div>
      <label className="text-sm">
        Commitment length (months)
        <input
          className={inputClass}
          type="number"
          min={1}
          required
          value={form.commitmentMonths}
          onChange={(event) => set('commitmentMonths', Number(event.target.value))}
        />
      </label>
      <label className="text-sm">
        GST %
        <input
          className={inputClass}
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          value={form.gstPercent}
          onChange={(event) => set('gstPercent', Number(event.target.value))}
        />
      </label>
      <Money
        label="Security deposit per laptop (₹)"
        required
        value={form.depositPerLaptop}
        onChange={(value) => set('depositPerLaptop', value ?? 0)}
      />
      <Text
        label="Taxes and charges"
        value={form.taxesNote}
        onChange={(value) => set('taxesNote', value)}
      />

      <h3 className="text-sm font-medium sm:col-span-2">Physical unit</h3>
      <p className="text-sm text-[var(--varnarc-subtle)] sm:col-span-2">
        Leave these blank for a catalog model. Fill them when this row is one specific laptop.
      </p>
      <Text label="Asset tag" value={form.assetTag} onChange={(value) => set('assetTag', value)} />
      <Text
        label="Serial number"
        value={form.serialNumber}
        onChange={(value) => set('serialNumber', value)}
      />
      <label className="text-sm">
        Status
        <select
          className={inputClass}
          value={form.status}
          onChange={(event) => set('status', event.target.value as CrmLaptopStatus)}
        >
          {CRM_LAPTOP_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CRM_LAPTOP_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm sm:col-span-2">
        Notes
        <textarea
          className={inputClass}
          rows={3}
          value={form.notes}
          onChange={(event) => set('notes', event.target.value)}
        />
      </label>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Text({
  label,
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        className={inputClass}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <span className="mt-1 block text-xs text-[var(--varnarc-subtle)]">{hint}</span>
      ) : null}
    </label>
  );
}

function Money({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        className={inputClass}
        type="number"
        min={0}
        step="0.01"
        required={required}
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
      />
    </label>
  );
}

export function DeleteLaptopButton({ laptopId }: { laptopId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm('Delete this laptop? It must not be on a proposal.')) return;
    const res = await fetch(`/api/admin/crm/laptops/${laptopId}`, { method: 'DELETE' });
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      setError(json.error?.message ?? 'Could not delete the laptop.');
      return;
    }
    router.push('/crm/laptops');
    router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void onDelete()}
        className="text-sm text-red-600 underline"
      >
        Delete laptop
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
