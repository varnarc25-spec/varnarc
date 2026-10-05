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

function moneyInput(value: unknown) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    const decimal = value as { s?: number; e?: number; d?: number[] };
    if (Array.isArray(decimal.d) && typeof decimal.e === 'number') {
      const digits = decimal.d.join('');
      if (!digits) return '';
      const amount = Number(digits) * 10 ** (decimal.e - digits.length + 1);
      return Number.isFinite(amount) ? String(decimal.s === -1 ? -amount : amount) : '';
    }
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : '';
}

async function send(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string; details?: unknown };
  };
  if (!res.ok) throw new Error(hrErrorMessage(json.error));
  return json.data;
}

function hrErrorMessage(error: { message?: string; details?: unknown } | undefined) {
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
  return error?.message || 'Request failed';
}

function payrollEmailResult(data: unknown) {
  if (!data || typeof data !== 'object') return 'Payslips generated.';
  const row = data as {
    count?: number;
    emailNotice?: string | null;
    emailed?: Array<{ name: string }>;
    skipped?: Array<{ name: string; reason: string }>;
    failed?: Array<{ name: string; error: string }>;
  };
  const count = row.count ?? 0;
  const parts = [`Generated ${count} payslip${count === 1 ? '' : 's'}.`];
  if (row.emailNotice) parts.push(row.emailNotice);
  if (row.emailed?.length) {
    parts.push(`Emailed ${row.emailed.map((person) => person.name).join(', ')}.`);
  }
  if (row.skipped?.length) {
    parts.push(
      `Not emailed: ${row.skipped.map((person) => `${person.name} (${person.reason})`).join('; ')}.`,
    );
  }
  if (row.failed?.length) {
    parts.push(
      `Email failed: ${row.failed.map((person) => `${person.name} (${person.error})`).join('; ')}.`,
    );
  }
  return parts.join(' ');
}

export function HrRecordForm({
  action,
  fields,
  submitLabel,
  reportPayrollEmail = false,
}: {
  action: string;
  fields: HrField[];
  submitLabel: string;
  reportPayrollEmail?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
        setMessage(null);
        void send(action, 'POST', body)
          .then((data) => {
            if (reportPayrollEmail) setMessage(payrollEmailResult(data));
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
      {message ? <p className="text-sm text-emerald-700 sm:col-span-2">{message}</p> : null}
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
    dateOfBirth: string | null;
    pan: string | null;
    bankAccountNo: string | null;
    ifscCode: string | null;
    taxRegime: string;
    joinedOn: string | null;
    salary: {
      basic: string | number;
      hra: string | number;
      specialAllowance: string | number;
      leaveTravelAllowance: string | number;
      professionalTax: string | number;
      providentFund: string | number;
    } | null;
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
          dateOfBirth: String(form.get('dateOfBirth') ?? '') || null,
          joinedOn: String(form.get('joinedOn') ?? '') || null,
          pan: String(form.get('pan') ?? ''),
          bankAccountNo: String(form.get('bankAccountNo') ?? ''),
          ifscCode: String(form.get('ifscCode') ?? ''),
          taxRegime: String(form.get('taxRegime') ?? 'NEW'),
          basic: String(form.get('basic') ?? '').trim(),
          hra: String(form.get('hra') ?? '').trim(),
          specialAllowance: String(form.get('specialAllowance') ?? '').trim(),
          leaveTravelAllowance: String(form.get('leaveTravelAllowance') ?? '').trim(),
          professionalTax: String(form.get('professionalTax') ?? '').trim(),
          providentFund: String(form.get('providentFund') ?? '').trim(),
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
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Date of birth</span>
        <input
          className={fieldClass}
          name="dateOfBirth"
          type="date"
          defaultValue={current.dateOfBirth?.slice(0, 10) ?? ''}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Date of joining</span>
        <input
          className={fieldClass}
          name="joinedOn"
          type="date"
          defaultValue={current.joinedOn?.slice(0, 10) ?? ''}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">PAN</span>
        <input className={fieldClass} name="pan" defaultValue={current.pan ?? ''} maxLength={10} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Account number</span>
        <input
          className={fieldClass}
          name="bankAccountNo"
          defaultValue={current.bankAccountNo ?? ''}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">IFSC code</span>
        <input
          className={fieldClass}
          name="ifscCode"
          defaultValue={current.ifscCode ?? ''}
          maxLength={11}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Regime opted</span>
        <select className={fieldClass} name="taxRegime" defaultValue={current.taxRegime || 'NEW'}>
          <option value="NEW">New regime</option>
          <option value="OLD">Old regime</option>
        </select>
      </label>
      <p className="text-xs text-[var(--varnarc-subtle)] sm:col-span-2">
        Monthly salary used when payslips are generated.
      </p>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Basic</span>
        <input
          className={fieldClass}
          name="basic"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.basic)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">
          House rent allowance
        </span>
        <input
          className={fieldClass}
          name="hra"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.hra)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Special allowance</span>
        <input
          className={fieldClass}
          name="specialAllowance"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.specialAllowance)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">
          Leave and travel allowance
        </span>
        <input
          className={fieldClass}
          name="leaveTravelAllowance"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.leaveTravelAllowance)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Professional tax</span>
        <input
          className={fieldClass}
          name="professionalTax"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.professionalTax)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">Provident fund (PF)</span>
        <input
          className={fieldClass}
          name="providentFund"
          type="number"
          min="0"
          step="0.01"
          defaultValue={moneyInput(current.salary?.providentFund)}
        />
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
