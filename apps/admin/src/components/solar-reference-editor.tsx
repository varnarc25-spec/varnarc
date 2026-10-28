'use client';

import { useState } from 'react';

const KINDS = ['LOCATION', 'TARIFF', 'INSTALLATION_PRICE', 'SUBSIDY', 'DEFAULTS'] as const;

const TEMPLATES: Record<(typeof KINDS)[number], string> = {
  LOCATION: '{\n  "annualYieldKwhPerKw": 1500\n}',
  TARIFF:
    '{\n  "discom": "",\n  "consumerCategory": "Domestic",\n  "energyChargePerKwh": 0,\n  "fixedMonthlyCharge": 0\n}',
  INSTALLATION_PRICE:
    '{\n  "minKw": 1,\n  "maxKw": 10,\n  "costPerKw": 0,\n  "installationType": "On-grid rooftop"\n}',
  SUBSIDY:
    '{\n  "schemeName": "",\n  "authority": "",\n  "eligibilityNotes": "",\n  "minKw": 0,\n  "maxKw": 3,\n  "amountPerKw": 0,\n  "maxBenefit": 0\n}',
  DEFAULTS:
    '{\n  "degradationPercent": 0.7,\n  "maintenancePerKw": 800,\n  "selfConsumptionPercent": 70,\n  "exportRatePerKwh": 0,\n  "tariffEscalationPercent": 3,\n  "lifetimeYears": 25,\n  "inverterReplacementYear": 12,\n  "inverterReplacementShare": 0.12,\n  "rooftopSqftPerKw": 80\n}',
};

export type SolarAdminRow = {
  id: string;
  kind: (typeof KINDS)[number];
  status: string;
  title: string;
  state?: string | null;
  city?: string | null;
  payload: unknown;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
};

export function SolarReferenceEditor({ initial }: { initial: SolarAdminRow[] }) {
  const [rows, setRows] = useState(initial);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('LOCATION');
  const [title, setTitle] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [payload, setPayload] = useState(TEMPLATES.LOCATION);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  async function save() {
    setMessage('');
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setMessage('Payload must be valid JSON.');
      return;
    }
    const body = {
      kind,
      status,
      title,
      state: state || null,
      city: city || null,
      payload: parsed,
      sourceUrl: sourceUrl || null,
      sourceLabel: sourceLabel || null,
    };
    const res = await fetch(
      editing ? `/api/admin/calculators/solar/${editing}` : '/api/admin/calculators/solar',
      {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json?.error?.message || 'Save failed. Check the payload against the kind schema.');
      return;
    }
    setMessage(
      status === 'PUBLISHED'
        ? 'Published. The public calculator cache refreshes within a minute.'
        : 'Saved as draft. The public site ignores drafts.',
    );
    const list = await fetch('/api/admin/calculators/solar');
    const listed = await list.json().catch(() => ({}));
    if (Array.isArray(listed.data)) setRows(listed.data);
    setEditing(null);
  }

  async function disable(id: string, row: SolarAdminRow) {
    const res = await fetch(`/api/admin/calculators/solar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...row, status: 'ARCHIVED', payload: row.payload }),
    });
    if (!res.ok) {
      setMessage('Could not archive this record.');
      return;
    }
    setRows((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'ARCHIVED' } : item)),
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            Kind
            <select
              className="mt-1 w-full rounded border px-2 py-2"
              value={kind}
              onChange={(e) => {
                const next = e.target.value as (typeof KINDS)[number];
                setKind(next);
                if (!editing) setPayload(TEMPLATES[next]);
              }}
            >
              {KINDS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              className="mt-1 w-full rounded border px-2 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Title
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="text-sm">
            State
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </label>
          <label className="text-sm">
            City
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Source label
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
            />
          </label>
        </div>
        <label className="text-sm">
          Source URL
          <input
            className="mt-1 w-full rounded border px-2 py-2"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://"
          />
        </label>
        <label className="text-sm">
          Payload JSON
          <textarea
            className="mt-1 min-h-40 w-full rounded border px-2 py-2 font-mono text-xs"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </label>
        <div className="flex gap-2">
          <button
            className="rounded bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            {editing ? 'Update record' : 'Add record'}
          </button>
          {editing ? (
            <button
              type="button"
              className="rounded border px-4 py-2 text-sm"
              onClick={() => setEditing(null)}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)]">
            <tr>
              <th className="px-3 py-2">Kind</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Place</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{row.kind}</td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">
                  {[row.city, row.state].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="mr-3 underline"
                    onClick={() => {
                      setEditing(row.id);
                      setKind(row.kind);
                      setTitle(row.title);
                      setState(row.state ?? '');
                      setCity(row.city ?? '');
                      setStatus(row.status);
                      setSourceUrl(row.sourceUrl ?? '');
                      setSourceLabel(row.sourceLabel ?? '');
                      setPayload(JSON.stringify(row.payload, null, 2));
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void disable(row.id, row)}
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
