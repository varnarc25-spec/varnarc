'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CatalogColor } from '@/components/automobile-forms';

export type ColorRow = CatalogColor & { _count?: { vehicles: number } };

const inputClass =
  'h-10 w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm';

function swatch(hex?: string | null) {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#d1d5db';
}

export function AutomobileColorsManager({ colors }: { colors: ColorRow[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#d1d5db');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createColor() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/automobile/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, hex }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Could not add color');
      setName('');
      setMessage('Color saved');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add color');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void createColor();
        }}
      >
        <input
          type="color"
          aria-label="New color swatch"
          className="h-10 w-12 cursor-pointer rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-1"
          value={swatch(hex)}
          onChange={(event) => setHex(event.target.value)}
        />
        <input
          className={`${inputClass} max-w-sm`}
          placeholder="Color name, for example Pearl White"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-md bg-[var(--varnarc-brand)] px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          Add color
        </button>
      </form>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-hidden rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-surface)] text-[var(--varnarc-muted)]">
            <tr>
              <th className="px-3 py-2 font-medium">Color</th>
              <th className="px-3 py-2 font-medium">Used on</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <ColorEditor key={color.id} color={color} />
            ))}
            {colors.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-[var(--varnarc-muted)]" colSpan={3}>
                  No colors yet. Add one here, then select it on a car.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ColorEditor({ color }: { color: ColorRow }) {
  const router = useRouter();
  const [name, setName] = useState(color.name);
  const [hex, setHex] = useState(swatch(color.hex));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/automobile/colors/${color.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), hex }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Could not save color');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save color');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${color.name}? Cars using it will no longer show this color.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/automobile/colors/${color.id}`, { method: 'DELETE' });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Could not delete color');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete color');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-t border-[var(--varnarc-border)]">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`Swatch for ${color.name}`}
            className="h-10 w-12 cursor-pointer rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-1"
            value={swatch(hex)}
            onChange={(event) => setHex(event.target.value)}
          />
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </td>
      <td className="px-3 py-2 text-[var(--varnarc-muted)]">{color._count?.vehicles ?? 0} cars</td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          className="mr-3 text-[var(--varnarc-brand)] hover:underline disabled:opacity-60"
          disabled={busy || !name.trim()}
          onClick={() => void save()}
        >
          Save
        </button>
        <button
          type="button"
          className="text-red-600 hover:underline disabled:opacity-60"
          disabled={busy}
          onClick={() => void remove()}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
