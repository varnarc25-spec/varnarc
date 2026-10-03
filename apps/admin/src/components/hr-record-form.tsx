'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type HrField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'email' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
};

const fieldClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

async function send(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message || 'Request failed');
}

export function HrRecordForm({
  action,
  fields,
  submitLabel,
}: {
  action: string;
  fields: HrField[];
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const form = new FormData(formEl);
        const body: Record<string, unknown> = {};
        for (const field of fields) {
          const raw = String(form.get(field.name) ?? '');
          if (field.type === 'number') body[field.name] = raw === '' ? 0 : Number(raw);
          else if (field.type === 'select' && raw === '') body[field.name] = null;
          else body[field.name] = raw;
        }
        setPending(true);
        setError(null);
        void send(action, 'POST', body)
          .then(() => {
            formEl.reset();
            router.refresh();
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'))
          .finally(() => setPending(false));
      }}
    >
      {fields.map((field) =>
        field.type === 'select' ? (
          <label key={field.name} className="text-sm">
            <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">{field.label}</span>
            <select
              className={fieldClass}
              name={field.name}
              required={field.required}
              defaultValue=""
            >
              <option value="">{field.required ? 'Select' : 'None'}</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label key={field.name} className="text-sm">
            <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">{field.label}</span>
            <input
              className={fieldClass}
              name={field.name}
              type={field.type ?? 'text'}
              required={field.required}
              step={field.type === 'number' ? '0.01' : undefined}
            />
          </label>
        ),
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {submitLabel}
      </button>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function HrProfileEditor({
  employees,
}: {
  employees: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    jobTitle: string;
    notes: string | null;
  }[];
}) {
  const router = useRouter();
  const [id, setId] = useState(employees[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const current = employees.find((employee) => employee.id === id);

  if (!current) {
    return (
      <p className="text-sm text-[var(--varnarc-subtle)]">
        Add an employee before editing a profile.
      </p>
    );
  }

  return (
    <form
      key={current.id}
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        void send(`/api/admin/hr/employees/${current.id}`, 'PUT', {
          fullName: String(form.get('fullName') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          jobTitle: String(form.get('jobTitle') ?? ''),
          notes: String(form.get('notes') ?? ''),
        })
          .then(() => router.refresh())
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'));
      }}
    >
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Employee</span>
        <select className={fieldClass} value={id} onChange={(event) => setId(event.target.value)}>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Name</span>
        <input className={fieldClass} name="fullName" defaultValue={current.fullName} required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Job title</span>
        <input className={fieldClass} name="jobTitle" defaultValue={current.jobTitle} required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Email</span>
        <input
          className={fieldClass}
          name="email"
          type="email"
          defaultValue={current.email ?? ''}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Phone</span>
        <input className={fieldClass} name="phone" defaultValue={current.phone ?? ''} />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Notes</span>
        <input className={fieldClass} name="notes" defaultValue={current.notes ?? ''} />
      </label>
      <button
        type="submit"
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white sm:w-fit"
      >
        Save profile
      </button>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function HrPutSelect({
  path,
  name,
  options,
  label,
}: {
  path: string;
  name: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = String(form.get(name) ?? '');
        setError(null);
        void send(path, 'PUT', { [name]: value || null })
          .then(() => router.refresh())
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'));
      }}
    >
      <select className={fieldClass} name={name} defaultValue="">
        <option value="">Unassigned</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button type="submit" className="text-sm text-[var(--varnarc-brand)]">
        {label}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </form>
  );
}

export function HrStatusButton({
  path,
  status,
  label,
  body,
}: {
  path: string;
  status?: string;
  label: string;
  body?: Record<string, unknown>;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-[var(--varnarc-brand)]"
      onClick={() => {
        void send(path, 'PUT', body ?? { status }).then(() => router.refresh());
      }}
    >
      {label}
    </button>
  );
}
