import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string; status: string };
type Salary = {
  basic: string;
  hra: string;
  allowances: string;
  deductions: string;
  employee: { fullName: string; employeeCode: string };
};
type Run = { id: string; period: string; status: string; _count: { payslips: number } };

function money(value: string) {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function HrPayrollPage() {
  const [employees, salaries, runs] = await Promise.all([
    apiServerFetch<Employee[]>('/hr/employees'),
    apiServerFetch<Salary[]>('/hr/salaries'),
    apiServerFetch<Run[]>('/hr/payroll'),
  ]);
  const active = (employees.data ?? []).filter((employee) => employee.status === 'ACTIVE');

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Set salary parts, then generate payslips for a month. Net pay is basic + HRA + allowances − deductions."
      />
      {salaries.error ? <p className="mb-4 text-sm text-red-600">{salaries.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/salaries"
          submitLabel="Save salary"
          fields={[
            {
              name: 'employeeId',
              label: 'Employee',
              type: 'select',
              required: true,
              options: active.map((employee) => ({
                value: employee.id,
                label: `${employee.fullName} (${employee.employeeCode})`,
              })),
            },
            { name: 'basic', label: 'Basic', type: 'number', required: true },
            { name: 'hra', label: 'HRA', type: 'number' },
            { name: 'allowances', label: 'Allowances', type: 'number' },
            { name: 'deductions', label: 'Deductions', type: 'number' },
          ]}
        />
      </HrPanel>
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/payroll/generate"
          submitLabel="Generate payslips"
          fields={[{ name: 'period', label: 'Month (YYYY-MM)', required: true }]}
        />
        <p className="mt-3 text-xs text-[var(--varnarc-subtle)]">
          Use a month such as 2026-10. Generating again for the same month refreshes the slips.{' '}
          <Link className="text-[var(--varnarc-brand)]" href="/hr/payroll/payslips">
            Open payslips
          </Link>
        </p>
      </HrPanel>
      <div className="mb-8">
        <HrDataTable
          columns={['Employee', 'Basic', 'HRA', 'Allowances', 'Deductions']}
          empty="No salaries yet."
          rows={(salaries.data ?? []).map((row) => [
            `${row.employee.fullName} (${row.employee.employeeCode})`,
            money(row.basic),
            money(row.hra),
            money(row.allowances),
            money(row.deductions),
          ])}
        />
      </div>
      <HrDataTable
        columns={['Period', 'Status', 'Payslips']}
        empty="No payroll runs yet."
        rows={(runs.data ?? []).map((row) => [row.period, row.status, row._count.payslips])}
      />
    </div>
  );
}
