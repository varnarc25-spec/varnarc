import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiServerFetch } from '@/lib/api';
import { PayslipPrintButton } from './print-button';

type Payslip = {
  basic: string;
  hra: string;
  allowances: string;
  deductions: string;
  netPay: string;
  employee: { fullName: string; employeeCode: string; jobTitle: string; email: string | null };
  payrollRun: { period: string; status: string };
};

function money(value: string) {
  return Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export default async function HrPayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await apiServerFetch<Payslip>(`/hr/payslips/${id}`);
  if (result.status === 404) notFound();
  const slip = result.data;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link className="text-sm text-[var(--varnarc-brand)]" href="/hr/payroll/payslips">
          All payslips
        </Link>
        <PayslipPrintButton />
      </div>
      {result.error || !slip ? (
        <p className="text-sm text-red-600">{result.error || 'Payslip not found'}</p>
      ) : (
        <article className="mx-auto max-w-xl rounded-lg border border-[var(--varnarc-border)] bg-white p-8 text-black">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Varnarc</p>
          <h1 className="mt-1 text-2xl font-semibold">Payslip</h1>
          <p className="mt-1 text-sm text-neutral-600">Period {slip.payrollRun.period}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Employee</dt>
              <dd>{slip.employee.fullName}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Code</dt>
              <dd>{slip.employee.employeeCode}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Title</dt>
              <dd>{slip.employee.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Email</dt>
              <dd>{slip.employee.email || '—'}</dd>
            </div>
          </dl>
          <table className="mt-6 w-full text-sm">
            <tbody>
              {(
                [
                  ['Basic', slip.basic],
                  ['HRA', slip.hra],
                  ['Allowances', slip.allowances],
                  ['Deductions', slip.deductions],
                ] as const
              ).map(([label, value]) => (
                <tr key={label} className="border-t border-neutral-200">
                  <td className="py-2">{label}</td>
                  <td className="py-2 text-right">{money(value)}</td>
                </tr>
              ))}
              <tr className="border-t border-neutral-900 font-semibold">
                <td className="py-2">Net pay</td>
                <td className="py-2 text-right">{money(slip.netPay)}</td>
              </tr>
            </tbody>
          </table>
        </article>
      )}
    </div>
  );
}
