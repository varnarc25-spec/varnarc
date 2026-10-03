import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Reports = {
  employees: number;
  activeEmployees: number;
  openExits: number;
  openJobs: number;
  candidates: number;
  assets: number;
  assignedAssets: number;
  pendingLeave: number;
  openEss: number;
  payslips: number;
  unreadNotifications: number;
};

const sections = [
  { href: '/hr/reports', label: 'HR Reports' },
  { href: '/hr/employees', label: 'Employees' },
  { href: '/hr/organization', label: 'Organization' },
  { href: '/hr/exits', label: 'Exit Management' },
  { href: '/hr/recruitment', label: 'Recruitment' },
  { href: '/hr/assets', label: 'Assets' },
  { href: '/hr/documents', label: 'Documents' },
  { href: '/hr/ess/requests', label: 'ESS Requests' },
  { href: '/hr/payroll', label: 'Payroll' },
  { href: '/hr/payroll/payslips', label: 'Payslips' },
];

export default async function HrOverviewPage() {
  const result = await apiServerFetch<Reports>('/hr/reports');
  const stats = result.data;

  return (
    <div>
      <PageHeader
        title="HRMS Dashboard"
        description="Headcount, hiring, assets, requests, and payroll in one place."
      />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load HR</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Active employees', value: stats?.activeEmployees ?? 0 },
              { label: 'Open jobs', value: stats?.openJobs ?? 0 },
              { label: 'Open exits', value: stats?.openExits ?? 0 },
              { label: 'Pending leave', value: stats?.pendingLeave ?? 0 },
              { label: 'ESS requests', value: stats?.openEss ?? 0 },
              { label: 'Assigned assets', value: stats?.assignedAssets ?? 0 },
              { label: 'Payslips', value: stats?.payslips ?? 0 },
              { label: 'Unread notices', value: stats?.unreadNotifications ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4"
              >
                <div className="text-xs text-[var(--varnarc-subtle)]">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4 hover:bg-[var(--varnarc-muted)]"
              >
                <div className="font-medium text-[var(--varnarc-brand)]">{section.label}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
