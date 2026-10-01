'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const inputClass =
  'h-10 w-full rounded-md border border-[var(--varnarc-border)] bg-white px-3 text-sm';

export function ResaleConfigForm() {
  const router = useRouter();
  const [type, setType] = useState('segment');
  const [key, setKey] = useState('suv');
  const [value, setValue] = useState('0.86');
  const [segment, setSegment] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/resale-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          key,
          value: Number(value),
          segment: segment || null,
          fuelType: fuelType || null,
          notes: notes || null,
          sourceName: sourceName || null,
          sourceUrl: sourceUrl || null,
          isActive: true,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Could not save this factor.');
      setMessage('Saved. The public calculator will use it on the next estimate.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save this factor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="mb-6 grid gap-3 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label className="text-sm">
        Type
        <input
          className={inputClass}
          value={type}
          onChange={(event) => setType(event.target.value)}
          required
        />
      </label>
      <label className="text-sm">
        Key
        <input
          className={inputClass}
          value={key}
          onChange={(event) => setKey(event.target.value)}
          required
        />
      </label>
      <label className="text-sm">
        Value
        <input
          className={inputClass}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="decimal"
          required
        />
      </label>
      <label className="text-sm">
        Segment
        <input
          className={inputClass}
          value={segment}
          onChange={(event) => setSegment(event.target.value)}
        />
      </label>
      <label className="text-sm">
        Fuel type
        <input
          className={inputClass}
          value={fuelType}
          onChange={(event) => setFuelType(event.target.value)}
        />
      </label>
      <label className="text-sm">
        Source name
        <input
          className={inputClass}
          value={sourceName}
          onChange={(event) => setSourceName(event.target.value)}
        />
      </label>
      <label className="text-sm md:col-span-2">
        Source URL
        <input
          className={inputClass}
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
        />
      </label>
      <label className="text-sm md:col-span-2">
        Notes
        <input
          className={inputClass}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-md bg-[var(--varnarc-ink)] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Add factor'}
        </button>
        {message ? <p className="mt-2 text-sm">{message}</p> : null}
        <p className="mt-2 text-xs text-[var(--varnarc-subtle)]">
          Values are decimal factors, such as 0.02 for +2% or 1.1 for a depreciation-curve
          multiplier. Leave the table empty to keep the built-in fallback. Do not enter a resale
          score unless it comes from a verified source. Set type feature and key
          enableResaleValueScore to 1 before scores are shown.
        </p>
      </div>
    </form>
  );
}

export function ResaleConfigRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function remove() {
    setMessage(null);
    const res = await fetch(`/api/admin/automobile/resale-valuation/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setMessage('Could not remove this factor.');
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        className="text-sm font-semibold text-red-700"
        onClick={() => void remove()}
      >
        Remove
      </button>
      {message ? <p className="text-xs text-red-700">{message}</p> : null}
    </div>
  );
}
