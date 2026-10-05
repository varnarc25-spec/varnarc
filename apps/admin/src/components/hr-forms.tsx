'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Department = { id: string; name: string };
type EmployeeOption = { id: string; fullName: string; employeeCode: string };
type EmployeeSalary = {
  basic: string | number;
  hra: string | number;
  specialAllowance: string | number;
  leaveTravelAllowance: string | number;
  professionalTax: string | number;
  providentFund: string | number;
} | null;

export type EmployeeHike = {
  id: string;
  effectiveOn: string;
  percentage: string | number;
  previousBasic: string | number;
  previousHra: string | number;
  previousSpecialAllowance: string | number;
  previousLeaveTravelAllowance: string | number;
  previousProfessionalTax: string | number;
  basic: string | number;
  hra: string | number;
  specialAllowance: string | number;
  leaveTravelAllowance: string | number;
  professionalTax: string | number;
  providentFund: string | number;
  notes: string | null;
};

export type EditableEmployee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string;
  status: string;
  joinedOn: string | null;
  dateOfBirth: string | null;
  pan: string | null;
  bankAccountNo: string | null;
  ifscCode: string | null;
  taxRegime: string;
  notes: string | null;
  department: { id: string; name: string } | null;
  salary: EmployeeSalary;
  salaryHikes?: EmployeeHike[];
};

function dateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

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

function moneyNumber(value: unknown) {
  const text = moneyInput(value);
  return text === '' ? 0 : Number(text);
}

function inr(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function grossPay(salary: {
  basic: unknown;
  hra: unknown;
  specialAllowance: unknown;
  leaveTravelAllowance: unknown;
}) {
  return (
    moneyNumber(salary.basic) +
    moneyNumber(salary.hra) +
    moneyNumber(salary.specialAllowance) +
    moneyNumber(salary.leaveTravelAllowance)
  );
}

const fieldClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

async function submitHr(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; details?: unknown };
  };
  if (!res.ok) {
    throw new Error(hrErrorMessage(json.error));
  }
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

function employeePayload(form: FormData) {
  const departmentId = String(form.get('departmentId') ?? '');
  return {
    fullName: String(form.get('fullName') ?? ''),
    email: String(form.get('email') ?? ''),
    phone: String(form.get('phone') ?? ''),
    jobTitle: String(form.get('jobTitle') ?? ''),
    departmentId: departmentId || null,
    status: String(form.get('status') ?? 'ACTIVE'),
    joinedOn: String(form.get('joinedOn') ?? '') || null,
    dateOfBirth: String(form.get('dateOfBirth') ?? '') || null,
    pan: String(form.get('pan') ?? ''),
    bankAccountNo: String(form.get('bankAccountNo') ?? ''),
    ifscCode: String(form.get('ifscCode') ?? ''),
    taxRegime: String(form.get('taxRegime') ?? 'NEW'),
    notes: String(form.get('notes') ?? ''),
    basic: String(form.get('basic') ?? '').trim(),
    hra: String(form.get('hra') ?? '').trim(),
    specialAllowance: String(form.get('specialAllowance') ?? '').trim(),
    leaveTravelAllowance: String(form.get('leaveTravelAllowance') ?? '').trim(),
    professionalTax: String(form.get('professionalTax') ?? '').trim(),
    providentFund: String(form.get('providentFund') ?? '').trim(),
    hikePercentage: String(form.get('hikePercentage') ?? '').trim(),
    hikeEffectiveOn: String(form.get('hikeEffectiveOn') ?? '') || null,
    hikeNotes: String(form.get('hikeNotes') ?? ''),
  };
}

export function EmployeeForm({
  departments,
  employee,
  onDone,
}: {
  departments: Department[];
  employee?: EditableEmployee;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [hikePercent, setHikePercent] = useState('');
  const [salary, setSalary] = useState({
    basic: moneyInput(employee?.salary?.basic),
    hra: moneyInput(employee?.salary?.hra),
    specialAllowance: moneyInput(employee?.salary?.specialAllowance),
    leaveTravelAllowance: moneyInput(employee?.salary?.leaveTravelAllowance),
    professionalTax: moneyInput(employee?.salary?.professionalTax),
    providentFund: moneyInput(employee?.salary?.providentFund),
  });
  const editing = Boolean(employee);
  const hikeRate = Number(hikePercent);
  const hiked = editing && Number.isFinite(hikeRate) && hikeRate > 0;
  const currentSalary = {
    basic: moneyNumber(salary.basic),
    hra: moneyNumber(salary.hra),
    specialAllowance: moneyNumber(salary.specialAllowance),
    leaveTravelAllowance: moneyNumber(salary.leaveTravelAllowance),
  };

  function setSalaryField(key: keyof typeof salary, value: string) {
    setSalary((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const form = new FormData(formEl);
        setPending(true);
        setError(null);
        const path = employee
          ? `/api/admin/hr/employees/${employee.id}`
          : '/api/admin/hr/employees';
        void submitHr(path, employee ? 'PUT' : 'POST', employeePayload(form))
          .then(() => {
            if (!employee) formEl.reset();
            onDone?.();
            router.refresh();
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Save failed'))
          .finally(() => setPending(false));
      }}
    >
      <label className="block text-sm">
        Full name
        <input
          className={`${fieldClass} mt-1`}
          name="fullName"
          defaultValue={employee?.fullName ?? ''}
          required
        />
      </label>
      <label className="block text-sm">
        Job title
        <input
          className={`${fieldClass} mt-1`}
          name="jobTitle"
          defaultValue={employee?.jobTitle ?? ''}
          required
        />
      </label>
      <label className="block text-sm">
        Email
        <input
          className={`${fieldClass} mt-1`}
          name="email"
          type="email"
          defaultValue={employee?.email ?? ''}
        />
      </label>
      <label className="block text-sm">
        Phone
        <input className={`${fieldClass} mt-1`} name="phone" defaultValue={employee?.phone ?? ''} />
      </label>
      <label className="block text-sm">
        Department
        <select
          className={`${fieldClass} mt-1`}
          name="departmentId"
          defaultValue={employee?.department?.id ?? ''}
          aria-label="Department"
        >
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Status
        <select
          className={`${fieldClass} mt-1`}
          name="status"
          defaultValue={employee?.status ?? 'ACTIVE'}
        >
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="EXITED">Exited</option>
        </select>
      </label>
      <label className="block text-sm">
        Date of joining
        <input
          className={`${fieldClass} mt-1`}
          name="joinedOn"
          type="date"
          defaultValue={dateInput(employee?.joinedOn)}
        />
      </label>
      <label className="block text-sm">
        Date of birth
        <input
          className={`${fieldClass} mt-1`}
          name="dateOfBirth"
          type="date"
          defaultValue={dateInput(employee?.dateOfBirth)}
        />
      </label>
      <label className="block text-sm">
        PAN
        <input
          className={`${fieldClass} mt-1`}
          name="pan"
          defaultValue={employee?.pan ?? ''}
          maxLength={10}
        />
      </label>
      <label className="block text-sm">
        Account number
        <input
          className={`${fieldClass} mt-1`}
          name="bankAccountNo"
          defaultValue={employee?.bankAccountNo ?? ''}
        />
      </label>
      <label className="block text-sm">
        IFSC code
        <input
          className={`${fieldClass} mt-1`}
          name="ifscCode"
          defaultValue={employee?.ifscCode ?? ''}
          maxLength={11}
        />
      </label>
      <label className="block text-sm">
        Tax regime
        <select
          className={`${fieldClass} mt-1`}
          name="taxRegime"
          defaultValue={employee?.taxRegime || 'NEW'}
          aria-label="Tax regime"
        >
          <option value="NEW">New regime</option>
          <option value="OLD">Old regime</option>
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        Notes
        <input className={`${fieldClass} mt-1`} name="notes" defaultValue={employee?.notes ?? ''} />
      </label>
      <p className="text-xs text-[var(--varnarc-subtle)] sm:col-span-2">
        Monthly salary copied onto payslips. A blank amount is treated as zero.
      </p>
      <label className="block text-sm">
        Basic
        <input
          className={`${fieldClass} mt-1`}
          name="basic"
          type="number"
          min="0"
          step="0.01"
          value={salary.basic}
          onChange={(event) => setSalaryField('basic', event.target.value)}
        />
      </label>
      <label className="block text-sm">
        House rent allowance
        <input
          className={`${fieldClass} mt-1`}
          name="hra"
          type="number"
          min="0"
          step="0.01"
          value={salary.hra}
          onChange={(event) => setSalaryField('hra', event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Special allowance
        <input
          className={`${fieldClass} mt-1`}
          name="specialAllowance"
          type="number"
          min="0"
          step="0.01"
          value={salary.specialAllowance}
          onChange={(event) => setSalaryField('specialAllowance', event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Leave and travel allowance
        <input
          className={`${fieldClass} mt-1`}
          name="leaveTravelAllowance"
          type="number"
          min="0"
          step="0.01"
          value={salary.leaveTravelAllowance}
          onChange={(event) => setSalaryField('leaveTravelAllowance', event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Professional tax
        <input
          className={`${fieldClass} mt-1`}
          name="professionalTax"
          type="number"
          min="0"
          step="0.01"
          value={salary.professionalTax}
          onChange={(event) => setSalaryField('professionalTax', event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Provident fund (PF)
        <input
          className={`${fieldClass} mt-1`}
          name="providentFund"
          type="number"
          min="0"
          step="0.01"
          value={salary.providentFund}
          onChange={(event) => setSalaryField('providentFund', event.target.value)}
        />
      </label>
      {editing ? (
        <>
          <p className="text-xs text-[var(--varnarc-subtle)] sm:col-span-2">
            Add a hike to raise basic, house rent allowance, special allowance, and leave travel
            allowance. Professional tax and provident fund stay as entered. Payslips generated after
            you save use the new amounts.
          </p>
          <label className="block text-sm">
            Hike effective date
            <input className={`${fieldClass} mt-1`} name="hikeEffectiveOn" type="date" />
          </label>
          <label className="block text-sm">
            Hike percent
            <input
              className={`${fieldClass} mt-1`}
              name="hikePercentage"
              type="number"
              min="0"
              step="0.01"
              value={hikePercent}
              onChange={(event) => setHikePercent(event.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            Hike notes
            <input className={`${fieldClass} mt-1`} name="hikeNotes" />
          </label>
          {hiked ? (
            <p className="text-sm sm:col-span-2">
              After this hike, gross pay becomes{' '}
              {inr(Math.round(grossPay(currentSalary) * (1 + hikeRate / 100) * 100) / 100)} from{' '}
              {inr(grossPay(currentSalary))}.
            </p>
          ) : null}
          {employee?.salaryHikes && employee.salaryHikes.length > 0 ? (
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-[var(--varnarc-subtle)]">Previous hikes</p>
              <ul className="space-y-1 text-sm">
                {employee.salaryHikes.map((hike) => (
                  <li key={hike.id}>
                    {dateInput(hike.effectiveOn)} · {moneyInput(hike.percentage)}% · gross{' '}
                    {inr(
                      grossPay({
                        basic: hike.previousBasic,
                        hra: hike.previousHra,
                        specialAllowance: hike.previousSpecialAllowance,
                        leaveTravelAllowance: hike.previousLeaveTravelAllowance,
                      }),
                    )}{' '}
                    to{' '}
                    {inr(
                      grossPay({
                        basic: hike.basic,
                        hra: hike.hra,
                        specialAllowance: hike.specialAllowance,
                        leaveTravelAllowance: hike.leaveTravelAllowance,
                      }),
                    )}
                    {hike.notes ? ` · ${hike.notes}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {editing ? 'Save changes' : 'Add employee'}
        </button>
        {editing && onDone ? (
          <button
            type="button"
            className="rounded-md border border-[var(--varnarc-border)] px-4 py-2 text-sm"
            onClick={onDone}
          >
            Cancel
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function EmployeeDirectory({
  employees,
  departments,
}: {
  employees: EditableEmployee[];
  departments: Department[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = employees.find((employee) => employee.id === editingId) ?? null;
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId) editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingId]);

  return (
    <>
      <div className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
        <h2 className="mb-3 text-sm font-medium">Add employee</h2>
        <EmployeeForm departments={departments} />
      </div>
      {editing ? (
        <div
          ref={editRef}
          className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4"
        >
          <h2 className="mb-3 text-sm font-medium">
            Edit {editing.fullName} ({editing.employeeCode})
          </h2>
          <EmployeeForm
            key={editing.id}
            departments={departments}
            employee={editing}
            onDone={() => setEditingId(null)}
          />
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs text-[var(--varnarc-subtle)]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={6}>
                  No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-t border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">{employee.employeeCode}</td>
                  <td className="px-4 py-3">
                    <div>{employee.fullName}</div>
                    {employee.email ? (
                      <div className="text-xs text-[var(--varnarc-subtle)]">{employee.email}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{employee.jobTitle}</td>
                  <td className="px-4 py-3">{employee.department?.name || '—'}</td>
                  <td className="px-4 py-3">{employee.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-sm text-[var(--varnarc-brand)]"
                        onClick={() => setEditingId(employee.id)}
                      >
                        Edit
                      </button>
                      <EmployeeStatusButton id={employee.id} status={employee.status} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
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
