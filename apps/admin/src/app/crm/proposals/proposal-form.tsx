'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  CRM_LAPTOP_AVAILABILITY_LABELS,
  LAPTOP_RENTAL_STATUSES,
  LAPTOP_RENTAL_STATUS_LABELS,
  discountPercentForMonths,
  formatProposalInr,
  quoteLaptopSelection,
  rateForCommitment,
  rentalDiscountForMonths,
  type CrmLaptopAvailability,
  type LaptopRentalFormValues,
  type LaptopRentalStatus,
  type RentalDiscountTier,
} from '@varnarc/validation';

const inputClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

type CompanyOption = { id: string; name: string };
type CatalogLaptop = {
  id: string;
  name: string;
  assetTag: string | null;
  serialNumber: string | null;
  brand: string;
  model: string | null;
  processor: string;
  ram: string | null;
  storage: string | null;
  display: string | null;
  operatingSystem: string;
  condition: string | null;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  availability: CrmLaptopAvailability;
  status: string;
  proposalId: string | null;
};

export function ProposalForm({
  mode,
  proposalId,
  companies,
  laptops,
  discounts,
  initial,
}: {
  mode: 'create' | 'edit';
  proposalId?: string;
  companies: CompanyOption[];
  laptops: CatalogLaptop[];
  discounts: RentalDiscountTier[];
  initial: LaptopRentalFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => {
    const tier = discountPercentForMonths(initial.commitmentMonths, discounts);
    const keepSaved = mode === 'edit' && initial.discountPercent > 0;
    return { ...initial, discountPercent: keepSaved ? initial.discountPercent : tier };
  });
  const [discountTouched, setDiscountTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (discountTouched) return;
    setForm((current) => {
      const next = discountPercentForMonths(current.commitmentMonths, discounts);
      if (current.discountPercent === next) return current;
      if (mode === 'edit' && current.discountPercent > 0) return current;
      return { ...current, discountPercent: next };
    });
  }, [discountTouched, discounts, mode]);

  function update<K extends keyof LaptopRentalFormValues>(
    key: K,
    value: LaptopRentalFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onCompany(companyId: string) {
    setForm((current) => {
      const previous = companies.find((company) => company.id === current.companyId);
      const next = companies.find((company) => company.id === companyId);
      const customerCompanyName =
        next?.name ??
        (previous && current.customerCompanyName === previous.name
          ? ''
          : current.customerCompanyName);
      return { ...current, companyId, customerCompanyName };
    });
  }

  function applyLines(laptopLines: LaptopRentalFormValues['laptopLines']) {
    setForm((current) => {
      const selected = laptopLines.flatMap((line) => {
        const laptop = laptops.find((item) => item.id === line.laptopId);
        return laptop ? [{ line, laptop }] : [];
      });
      const discountPercent = current.discountPercent;
      if (!selected.length) {
        return { ...current, laptopLines, laptopIds: [], discountPercent };
      }
      const first = selected[0];
      if (!first) return { ...current, laptopLines, laptopIds: [], discountPercent };
      const quote = quoteLaptopSelection({
        commitmentMonths: current.commitmentMonths,
        discountPercent,
        lines: selected.map(({ line, laptop }) => ({
          monthlyRate: laptop.monthlyRate ?? 0,
          commitmentRate: rateForCommitment({
            months: current.commitmentMonths,
            monthlyRate: laptop.monthlyRate,
            commitmentMonths: laptop.commitmentMonths,
            commitmentRate: laptop.commitmentRate,
          }),
          depositPerLaptop: laptop.depositPerLaptop,
          quantity: line.quantity,
          gstPercent: laptop.gstPercent,
        })),
      });
      return {
        ...current,
        laptopLines,
        laptopIds: selected.map(({ line }) => line.laptopId),
        discountPercent,
        quantity: quote.quantity,
        monthlyRate: quote.monthlyRate,
        commitmentRate: quote.commitmentRate,
        depositPerLaptop: quote.depositPerLaptop,
        gstPercent: quote.gstPercent,
      };
    });
  }

  function toggleLaptop(laptopId: string) {
    const selected = form.laptopLines.some((line) => line.laptopId === laptopId)
      ? form.laptopLines.filter((line) => line.laptopId !== laptopId)
      : [...form.laptopLines, { laptopId, quantity: 1 }];
    applyLines(selected);
  }

  function setLaptopQuantity(laptopId: string, quantity: number) {
    const nextQuantity = Math.max(1, quantity || 1);
    const existing = form.laptopLines.some((line) => line.laptopId === laptopId);
    const laptopLines = existing
      ? form.laptopLines.map((line) =>
          line.laptopId === laptopId ? { ...line, quantity: nextQuantity } : line,
        )
      : [...form.laptopLines, { laptopId, quantity: nextQuantity }];
    applyLines(laptopLines);
  }

  function setCommitmentMonths(commitmentMonths: number) {
    setDiscountTouched(false);
    setForm((current) => ({
      ...current,
      commitmentMonths,
      discountPercent: discountPercentForMonths(commitmentMonths, discounts),
    }));
  }

  function onLocation(deliveryLocation: string) {
    setForm((current) => ({
      ...current,
      deliveryLocation,
      services: current.services.map((service, index) =>
        index === 0 && /^Delivery of laptops to the agreed .+ location$/.test(service)
          ? `Delivery of laptops to the agreed ${deliveryLocation || 'location'} location`
          : service,
      ),
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const payload = {
      ...form,
      discountPercent:
        discountTouched || form.discountPercent > 0
          ? form.discountPercent
          : discountPercentForMonths(form.commitmentMonths, discounts),
      companyId: form.companyId || null,
      services: textLines(form.services),
      responsibilities: textLines(form.responsibilities),
      returnChecks: textLines(form.returnChecks),
    };
    const path =
      mode === 'create'
        ? '/api/admin/crm/rental-proposals'
        : `/api/admin/crm/rental-proposals/${proposalId}`;
    try {
      const res = await fetch(path, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { id?: string };
        error?: { message?: string; details?: unknown };
      };
      if (!res.ok || !json.data?.id) {
        throw new Error(errorMessage(json.error));
      }
      router.push(`/crm/proposals/${json.data.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the proposal.');
      setPending(false);
    }
  }

  async function onDelete() {
    if (!proposalId || !window.confirm('Delete this proposal?')) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/rental-proposals/${proposalId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Could not delete the proposal.');
      router.push('/crm/proposals');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the proposal.');
      setPending(false);
    }
  }

  const pricedLines = form.laptopLines.flatMap((line) => {
    const laptop = laptops.find((item) => item.id === line.laptopId);
    return laptop
      ? [
          {
            monthlyRate: laptop.monthlyRate ?? 0,
            commitmentRate: rateForCommitment({
              months: form.commitmentMonths,
              monthlyRate: laptop.monthlyRate,
              commitmentMonths: laptop.commitmentMonths,
              commitmentRate: laptop.commitmentRate,
            }),
            depositPerLaptop: laptop.depositPerLaptop,
            quantity: line.quantity,
            gstPercent: laptop.gstPercent,
          },
        ]
      : [];
  });
  const matchedDiscount = rentalDiscountForMonths(form.commitmentMonths, discounts);
  const shownDiscount =
    discountTouched || form.discountPercent > 0
      ? form.discountPercent
      : (matchedDiscount?.percent ?? 0);
  const quote = pricedLines.length
    ? quoteLaptopSelection({
        lines: pricedLines,
        commitmentMonths: form.commitmentMonths,
        discountPercent: shownDiscount,
      })
    : null;

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-8">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <fieldset className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Company</legend>
        <Field label="Existing company">
          <select
            className={inputClass}
            value={form.companyId ?? ''}
            onChange={(event) => onCompany(event.target.value)}
          >
            <option value="">New company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Prepared for" hint="Shown on the proposal as the customer company.">
          <input
            className={inputClass}
            required
            value={form.customerCompanyName}
            onChange={(event) => update('customerCompanyName', event.target.value)}
          />
        </Field>
        <Field label="Proposal date">
          <input
            className={inputClass}
            type="date"
            required
            value={form.proposalDate}
            onChange={(event) => update('proposalDate', event.target.value)}
          />
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            required
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
          />
        </Field>
        {mode === 'edit' ? (
          <Field label="Status">
            <select
              className={inputClass}
              value={form.status ?? 'DRAFT'}
              onChange={(event) => update('status', event.target.value as LaptopRentalStatus)}
            >
              {LAPTOP_RENTAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LAPTOP_RENTAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </fieldset>

      <fieldset className="rounded-lg border border-[var(--varnarc-border)] p-4">
        <legend className="px-1 text-sm font-medium">Laptops</legend>
        <p className="mb-3 text-sm text-[var(--varnarc-subtle)]">
          Choose models and enter how many of each. The price and deposit are calculated from this
          list.
        </p>
        {laptops.filter(
          (laptop) =>
            form.laptopIds.includes(laptop.id) ||
            (laptop.availability === 'IN_STOCK' &&
              laptop.status !== 'RETIRED' &&
              (!laptop.proposalId || laptop.proposalId === proposalId)),
        ).length === 0 ? (
          <p className="text-sm">
            No laptops are available.{' '}
            <a href="/crm/laptops" className="underline">
              Add laptop details
            </a>{' '}
            first.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {laptops
              .filter(
                (laptop) =>
                  form.laptopIds.includes(laptop.id) ||
                  (laptop.availability === 'IN_STOCK' &&
                    laptop.status !== 'RETIRED' &&
                    (!laptop.proposalId || laptop.proposalId === proposalId)),
              )
              .map((laptop) => {
                const line = form.laptopLines.find((item) => item.laptopId === laptop.id);
                const quantity = line?.quantity ?? 1;
                return (
                  <li
                    key={laptop.id}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--varnarc-border)] p-3 text-sm"
                  >
                    <label className="flex min-w-0 flex-1 gap-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(line)}
                        onChange={() => toggleLaptop(laptop.id)}
                      />
                      <span>
                        <span className="font-medium">{laptop.name}</span>
                        <span className="mt-1 block text-[var(--varnarc-subtle)]">
                          {[
                            laptop.brand,
                            laptop.model,
                            laptop.processor,
                            laptop.ram,
                            laptop.monthlyRate == null
                              ? null
                              : `${formatProposalInr(laptop.monthlyRate)} / month`,
                            `${formatProposalInr(laptop.commitmentRate)} / ${laptop.commitmentMonths} mo`,
                            CRM_LAPTOP_AVAILABILITY_LABELS[laptop.availability],
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </label>
                    <label className="text-xs text-[var(--varnarc-subtle)]">
                      Quantity
                      <input
                        className={`${inputClass} w-24`}
                        type="number"
                        min={1}
                        disabled={!line}
                        value={line ? quantity : ''}
                        placeholder="0"
                        onChange={(event) =>
                          setLaptopQuantity(laptop.id, Number(event.target.value))
                        }
                      />
                    </label>
                    {line ? (
                      <span className="text-sm">
                        {formatProposalInr(
                          rateForCommitment({
                            months: form.commitmentMonths,
                            monthlyRate: laptop.monthlyRate,
                            commitmentMonths: laptop.commitmentMonths,
                            commitmentRate: laptop.commitmentRate,
                          }) * quantity,
                        )}
                        <span className="block text-xs text-[var(--varnarc-subtle)]">
                          {form.commitmentMonths >= laptop.commitmentMonths
                            ? `${laptop.commitmentMonths}-month rate`
                            : '1-month rate'}
                        </span>
                      </span>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        )}
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Pricing and deposit</legend>
        {quote ? (
          <div className="space-y-1 text-sm sm:col-span-2">
            <p>
              {quote.quantity} {quote.quantity === 1 ? 'laptop' : 'laptops'} ·{' '}
              {form.commitmentMonths} month commitment · GST {quote.gstPercent}%
            </p>
            <p>
              One-month rental: {formatProposalInr(quote.monthlyBefore)}
              {quote.discountPercent > 0
                ? ` before discount, ${formatProposalInr(quote.monthlyTotal)} after`
                : ''}
            </p>
            <p>
              Commitment rental: {formatProposalInr(quote.commitmentBefore)} per month
              {quote.discountPercent > 0
                ? `, ${formatProposalInr(quote.commitmentMonthly)} after discount`
                : ''}
            </p>
            <p>
              GST: {formatProposalInr(quote.gstAmount)} · Invoice:{' '}
              {formatProposalInr(quote.monthlyWithGst)} per month
            </p>
            <p>Security deposit: {formatProposalInr(quote.depositTotal)}</p>
            <p>
              Discount: {shownDiscount}%
              {quote.discountAmount > 0
                ? ` (${formatProposalInr(quote.discountAmount)} per month)`
                : ''}
            </p>
            <p>
              Rental for {form.commitmentMonths} months before GST:{' '}
              {formatProposalInr(quote.termBeforeGst)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--varnarc-subtle)] sm:col-span-2">
            Select laptops and enter a quantity to calculate the price and deposit.
          </p>
        )}
        <Field
          label="Commitment length (months)"
          hint="The one-month price is used until this reaches the laptop's commitment length, usually 12 months."
        >
          <input
            className={inputClass}
            type="number"
            min={1}
            max={60}
            required
            value={form.commitmentMonths}
            onChange={(event) => setCommitmentMonths(Number(event.target.value))}
          />
        </Field>
        <Field
          label="Discount %"
          hint={
            matchedDiscount
              ? `The saved ${matchedDiscount.months}-month discount is ${matchedDiscount.percent}%. Changing the commitment length updates this field. You can still edit it for this proposal.`
              : 'No saved term discount applies for this commitment length. You can set a percent for this proposal.'
          }
        >
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            value={shownDiscount}
            onChange={(event) => {
              setDiscountTouched(true);
              update('discountPercent', Number(event.target.value));
            }}
          />
        </Field>
        <Field label="Delivery location">
          <input
            className={inputClass}
            required
            value={form.deliveryLocation}
            onChange={(event) => onLocation(event.target.value)}
          />
        </Field>
        <Field label="GST note" className="sm:col-span-2">
          <input
            className={inputClass}
            required
            value={form.gstNote}
            onChange={(event) => update('gstNote', event.target.value)}
          />
        </Field>
        <Field label="Payment due date" className="sm:col-span-2">
          <input
            className={inputClass}
            required
            value={form.paymentDueText}
            onChange={(event) => update('paymentDueText', event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4">
        <legend className="px-1 text-sm font-medium">Proposal wording</legend>
        <Field label="Summary">
          <textarea
            className={inputClass}
            rows={3}
            required
            value={form.proposalSummary}
            onChange={(event) => update('proposalSummary', event.target.value)}
          />
        </Field>
        <Field label="Services included" hint="One service per line.">
          <textarea
            className={inputClass}
            rows={7}
            required
            value={form.services.join('\n')}
            onChange={(event) => update('services', event.target.value.split('\n'))}
          />
        </Field>
        <Field label="Support and replacement">
          <textarea
            className={inputClass}
            rows={6}
            required
            value={form.supportText}
            onChange={(event) => update('supportText', event.target.value)}
          />
        </Field>
        <Field label="Customer responsibilities" hint="One responsibility per line.">
          <textarea
            className={inputClass}
            rows={6}
            required
            value={form.responsibilities.join('\n')}
            onChange={(event) => update('responsibilities', event.target.value.split('\n'))}
          />
        </Field>
        <Field label="Deposit refund note">
          <textarea
            className={inputClass}
            rows={3}
            required
            value={form.depositNote}
            onChange={(event) => update('depositNote', event.target.value)}
          />
        </Field>
        <Field label="Return introduction">
          <textarea
            className={inputClass}
            rows={2}
            required
            value={form.returnIntro}
            onChange={(event) => update('returnIntro', event.target.value)}
          />
        </Field>
        <Field label="Return inspection" hint="One check per line.">
          <textarea
            className={inputClass}
            rows={7}
            required
            value={form.returnChecks.join('\n')}
            onChange={(event) => update('returnChecks', event.target.value.split('\n'))}
          />
        </Field>
        <Field label="Wear and tear">
          <input
            className={inputClass}
            required
            value={form.wearNote}
            onChange={(event) => update('wearNote', event.target.value)}
          />
        </Field>
        <Field label="Acceptance">
          <textarea
            className={inputClass}
            rows={4}
            required
            value={form.acceptanceText}
            onChange={(event) => update('acceptanceText', event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Your company</legend>
        <Field label="Legal name" className="sm:col-span-2">
          <input
            className={inputClass}
            required
            value={form.issuerName}
            onChange={(event) => update('issuerName', event.target.value)}
          />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <textarea
            className={inputClass}
            rows={3}
            value={form.issuerAddress}
            onChange={(event) => update('issuerAddress', event.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputClass}
            value={form.issuerPhone}
            onChange={(event) => update('issuerPhone', event.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClass}
            value={form.issuerEmail}
            onChange={(event) => update('issuerEmail', event.target.value)}
          />
        </Field>
        <Field label="GSTIN">
          <input
            className={inputClass}
            value={form.issuerGstin}
            onChange={(event) => update('issuerGstin', event.target.value)}
          />
        </Field>
        <Field label="Signatory name">
          <input
            className={inputClass}
            value={form.issuerSignatoryName}
            onChange={(event) => update('issuerSignatoryName', event.target.value)}
          />
        </Field>
        <Field label="Signatory designation">
          <input
            className={inputClass}
            value={form.issuerSignatoryDesignation}
            onChange={(event) => update('issuerSignatoryDesignation', event.target.value)}
          />
        </Field>
        <Field label="Customer signatory name">
          <input
            className={inputClass}
            value={form.customerSignatoryName}
            onChange={(event) => update('customerSignatoryName', event.target.value)}
          />
        </Field>
        <Field label="Customer designation">
          <input
            className={inputClass}
            value={form.customerSignatoryDesignation}
            onChange={(event) => update('customerSignatoryDesignation', event.target.value)}
          />
        </Field>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Create proposal' : 'Save proposal'}
        </button>
        {mode === 'edit' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void onDelete()}
            className="inline-flex h-10 items-center rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm ${className ?? ''}`}>
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-[var(--varnarc-subtle)]">{hint}</span>
      ) : null}
    </label>
  );
}

function textLines(value: string[]) {
  return value.map((line) => line.trim()).filter(Boolean);
}

function errorMessage(error: { message?: string; details?: unknown } | undefined) {
  if (Array.isArray(error?.details)) {
    const lines = error.details
      .map((issue) => {
        if (!issue || typeof issue !== 'object' || !('message' in issue)) return '';
        const path = Array.isArray((issue as { path?: unknown }).path)
          ? (issue as { path: Array<string | number> }).path.join('.')
          : '';
        const message = String((issue as { message?: string }).message ?? '');
        return path ? `${path}: ${message}` : message;
      })
      .filter(Boolean);
    if (lines.length > 0) return lines.join(' ');
  }
  return error?.message || 'Could not save the proposal.';
}
