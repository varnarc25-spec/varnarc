'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  CRM_ACTIVITY_KINDS,
  CRM_ACTIVITY_KIND_LABELS,
  type CrmActivityKind,
} from '@varnarc/validation';

const inputClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

type CompanyValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  gstin: string;
  website: string;
  notes: string;
};

export function CompanyForm({
  companyId,
  initial,
  submitLabel,
}: {
  companyId?: string;
  initial: CompanyValues;
  submitLabel: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const path = companyId ? `/api/admin/crm/companies/${companyId}` : '/api/admin/crm/companies';
    try {
      const res = await fetch(path, {
        method: companyId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { id?: string };
        error?: { message?: string };
      };
      if (!res.ok || !json.data?.id)
        throw new Error(json.error?.message ?? 'Could not save the company.');
      router.push(`/crm/companies/${json.data.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the company.');
      setPending(false);
    }
  }

  function set(key: keyof CompanyValues, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2">
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
      <label className="text-sm">
        Name
        <input
          className={inputClass}
          required
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
        />
      </label>
      <label className="text-sm">
        Email
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(event) => set('email', event.target.value)}
        />
      </label>
      <label className="text-sm">
        Phone
        <input
          className={inputClass}
          value={form.phone}
          onChange={(event) => set('phone', event.target.value)}
        />
      </label>
      <label className="text-sm">
        City
        <input
          className={inputClass}
          value={form.city}
          onChange={(event) => set('city', event.target.value)}
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Address
        <textarea
          className={inputClass}
          rows={2}
          value={form.address}
          onChange={(event) => set('address', event.target.value)}
        />
      </label>
      <label className="text-sm">
        GSTIN
        <input
          className={inputClass}
          value={form.gstin}
          onChange={(event) => set('gstin', event.target.value)}
        />
      </label>
      <label className="text-sm">
        Website
        <input
          className={inputClass}
          value={form.website}
          onChange={(event) => set('website', event.target.value)}
        />
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

export function DeleteCompanyButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm('Delete this company? Proposals must be removed first.')) return;
    setError(null);
    const res = await fetch(`/api/admin/crm/companies/${companyId}`, { method: 'DELETE' });
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      setError(json.error?.message ?? 'Could not delete the company.');
      return;
    }
    router.push('/crm/companies');
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onDelete()}
        className="text-sm text-red-600 underline"
      >
        Delete company
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function ContactForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: String(form.get('name') ?? ''),
          designation: String(form.get('designation') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          isPrimary: form.get('isPrimary') === 'on',
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? 'Could not add the contact.');
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add the contact.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3 sm:grid-cols-2">
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
      <input className={inputClass} name="name" required placeholder="Name" />
      <input className={inputClass} name="designation" placeholder="Designation" />
      <input className={inputClass} name="email" type="email" placeholder="Email" />
      <input className={inputClass} name="phone" placeholder="Phone" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPrimary" />
        Primary contact
      </label>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          Add contact
        </button>
      </div>
    </form>
  );
}

export function ActivityForm({
  companyId,
  proposals,
}: {
  companyId: string;
  proposals: { id: string; proposalNumber: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<CrmActivityKind>('NOTE');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const proposalId = String(form.get('proposalId') ?? '');
    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          proposalId: proposalId || null,
          kind,
          body: String(form.get('body') ?? ''),
          occurredOn: String(form.get('occurredOn') ?? today),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? 'Could not save the activity.');
      event.currentTarget.reset();
      setKind('NOTE');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the activity.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          className={inputClass}
          value={kind}
          onChange={(event) => setKind(event.target.value as CrmActivityKind)}
        >
          {CRM_ACTIVITY_KINDS.map((item) => (
            <option key={item} value={item}>
              {CRM_ACTIVITY_KIND_LABELS[item]}
            </option>
          ))}
        </select>
        <input className={inputClass} type="date" name="occurredOn" required defaultValue={today} />
        <select className={inputClass} name="proposalId" defaultValue="">
          <option value="">No proposal</option>
          {proposals.map((proposal) => (
            <option key={proposal.id} value={proposal.id}>
              {proposal.proposalNumber}
            </option>
          ))}
        </select>
      </div>
      <textarea className={inputClass} name="body" required rows={3} placeholder="What happened" />
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          Add activity
        </button>
      </div>
    </form>
  );
}

export function DeleteContactButton({ contactId }: { contactId: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!window.confirm('Remove this contact?')) return;
    const res = await fetch(`/api/admin/crm/contacts/${contactId}`, { method: 'DELETE' });
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <button type="button" onClick={() => void onDelete()} className="underline">
      Remove
    </button>
  );
}
