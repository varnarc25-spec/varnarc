'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { RentalDiscountTier } from '@varnarc/validation';

const inputClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

export function DiscountForm({ initial }: { initial: RentalDiscountTier[] }) {
  const router = useRouter();
  const [tiers, setTiers] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  function update(index: number, key: keyof RentalDiscountTier, value: number) {
    setSaved(false);
    setTiers((current) =>
      current.map((tier, item) => (item === index ? { ...tier, [key]: value } : tier)),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const months = tiers.map((tier) => tier.months);
    if (new Set(months).size !== months.length) {
      setError('Each commitment length can only be listed once.');
      setPending(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/crm/rental-discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: RentalDiscountTier[];
        error?: { message?: string };
      };
      if (!res.ok || !json.data)
        throw new Error(json.error?.message ?? 'Could not save the discounts.');
      setTiers(json.data);
      setSaved(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the discounts.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="max-w-xl space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm">Discounts saved. New proposals use these percents.</p> : null}
      <div className="overflow-hidden rounded-lg border border-[var(--varnarc-border)]">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-[var(--varnarc-border)] px-4 py-2 text-xs text-[var(--varnarc-subtle)]">
          <span>Months</span>
          <span>Discount %</span>
          <span />
        </div>
        {tiers.map((tier, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-3">
            <input
              className={inputClass}
              type="number"
              min={1}
              max={60}
              required
              value={tier.months}
              onChange={(event) => update(index, 'months', Number(event.target.value))}
            />
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step="0.01"
              required
              value={tier.percent}
              onChange={(event) => update(index, 'percent', Number(event.target.value))}
            />
            <button
              type="button"
              className="text-sm underline disabled:opacity-40"
              disabled={tiers.length === 1}
              onClick={() => {
                setSaved(false);
                setTiers((current) => current.filter((_, item) => item !== index));
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-md border border-[var(--varnarc-border)] px-3 py-2 text-sm"
          onClick={() => {
            setSaved(false);
            setTiers((current) => [...current, { months: 1, percent: 0 }]);
          }}
        >
          Add discount
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-50"
          disabled={pending}
        >
          {pending ? 'Saving…' : 'Save discounts'}
        </button>
      </div>
    </form>
  );
}
