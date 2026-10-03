'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Department = { id: string; name: string };
type EmployeeOption = { id: string; fullName: string; employeeCode: string };

const fieldClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

async function submitHr(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message || 'Request failed');
  }
}

export function DepartmentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_160px_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const form = new FormData(formEl);
        setPending(true);
        setError(null);
        void submitHr('/api/admin/hr/departments', 'POST', {
          name: String(form.get('name') ?? ''),
          code: String(form.get('code') ?? ''),
        })
          .then(() => {
            formEl.reset();
            router.refresh();
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'))
          .finally(() => setPending(false));
      }}
    >
      <input className={fieldClass} name="name" placeholder="Department name" required />
      <input className={fieldClass} name="code" placeholder="Code" maxLength={40} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Add department
      </button>
      {error ? <p className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}
    </form>
  );
}

export function EmployeeForm({ departments }: { departments: Department[] }) {
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
        const departmentId = String(form.get('departmentId') ?? '');
        setPending(true);
        setError(null);
        void submitHr('/api/admin/hr/employees', 'POST', {
          fullName: String(form.get('fullName') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          jobTitle: String(form.get('jobTitle') ?? ''),
          departmentId: departmentId || null,
          status: String(form.get('status') ?? 'ACTIVE'),
          joinedOn: String(form.get('joinedOn') ?? '') || null,
          notes: String(form.get('notes') ?? ''),
        })
          .then(() => {
            formEl.reset();
            router.refresh();
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'))
          .finally(() => setPending(false));
      }}
    >
      <input className={fieldClass} name="fullName" placeholder="Full name" required />
      <input className={fieldClass} name="jobTitle" placeholder="Job title" required />
      <input className={fieldClass} name="email" type="email" placeholder="Email" />
      <input className={fieldClass} name="phone" placeholder="Phone" />
      <select className={fieldClass} name="departmentId" defaultValue="">
        <option value="">No department</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      <select className={fieldClass} name="status" defaultValue="ACTIVE">
        <option value="ACTIVE">Active</option>
        <option value="ON_LEAVE">On leave</option>
        <option value="EXITED">Exited</option>
      </select>
      <input className={fieldClass} name="joinedOn" type="date" />
      <input className={fieldClass} name="notes" placeholder="Notes" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        Add employee
      </button>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function EmployeeStatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const next = status === 'ACTIVE' ? 'EXITED' : 'ACTIVE';
  return (
    <button
      type="button"
      className="text-sm text-[var(--varnarc-brand)]"
      onClick={() => {
        void submitHr(`/api/admin/hr/employees/${id}`, 'PUT', { status: next }).then(() =>
          router.refresh(),
        );
      }}
    >
      Mark {next === 'EXITED' ? 'exited' : 'active'}
    </button>
  );
}

export function LeaveForm({ employees }: { employees: EmployeeOption[] }) {
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
        setPending(true);
        setError(null);
        void submitHr('/api/admin/hr/leave', 'POST', {
          employeeId: String(form.get('employeeId') ?? ''),
          leaveType: String(form.get('leaveType') ?? 'ANNUAL'),
          startDate: String(form.get('startDate') ?? ''),
          endDate: String(form.get('endDate') ?? ''),
          reason: String(form.get('reason') ?? ''),
        })
          .then(() => {
            formEl.reset();
            router.refresh();
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'))
          .finally(() => setPending(false));
      }}
    >
      <select className={fieldClass} name="employeeId" required defaultValue="">
        <option value="" disabled>
          Employee
        </option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.fullName} ({employee.employeeCode})
          </option>
        ))}
      </select>
      <select className={fieldClass} name="leaveType" defaultValue="ANNUAL">
        <option value="ANNUAL">Annual</option>
        <option value="SICK">Sick</option>
        <option value="UNPAID">Unpaid</option>
      </select>
      <input className={fieldClass} name="startDate" type="date" required />
      <input className={fieldClass} name="endDate" type="date" required />
      <input className={`${fieldClass} sm:col-span-2`} name="reason" placeholder="Reason" />
      <button
        type="submit"
        disabled={pending || employees.length === 0}
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        Request leave
      </button>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function LeaveDecision({ id }: { id: string }) {
  const router = useRouter();
  return (
    <div className="flex gap-3">
      {(['APPROVED', 'REJECTED'] as const).map((status) => (
        <button
          key={status}
          type="button"
          className="text-sm text-[var(--varnarc-brand)]"
          onClick={() => {
            void submitHr(`/api/admin/hr/leave/${id}`, 'PUT', { status }).then(() =>
              router.refresh(),
            );
          }}
        >
          {status === 'APPROVED' ? 'Approve' : 'Reject'}
        </button>
      ))}
    </div>
  );
}
