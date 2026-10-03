import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { HrDataTable } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Payslip = {
  id: string;
  basic: string;
  hra: string;
  allowances: string;
  deductions: string;
  netPay: string;
  employee: { fullName: string; employeeCode: string };
  payrollRun: { period: string };
};

function money(value: string) {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function HrPayslipsPage() {
  const result = await apiServerFetch<Payslip[]>('/hr/payslips');

  return (
    <div>
      <PageHeader
        title="Payslips"
        description="Slips created from payroll. Open one to print it."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrDataTable
        columns={['Period', 'Employee', 'Net pay', '']}
        empty="Generate a payroll month before payslips appear."
        rows={(result.data ?? []).map((row) => [
          row.payrollRun.period,
          `${row.employee.fullName} (${row.employee.employeeCode})`,
          money(row.netPay),
          <Link
            key={row.id}
            className="text-[var(--varnarc-brand)]"
            href={`/hr/payroll/payslips/${row.id}`}
          >
            View slip
          </Link>,
        ])}
      />
    </div>
  );
}
