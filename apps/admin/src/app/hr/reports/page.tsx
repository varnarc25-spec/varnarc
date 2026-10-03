import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Reports = Record<string, number>;

const labels: Record<string, string> = {
  employees: 'Employees',
  activeEmployees: 'Active employees',
  openExits: 'Open exits',
  openJobs: 'Open jobs',
  candidates: 'Candidates',
  assets: 'Assets',
  assignedAssets: 'Assigned assets',
  pendingLeave: 'Pending leave',
  openEss: 'Open ESS requests',
  payslips: 'Payslips generated',
  unreadNotifications: 'Unread notifications',
};

export default async function HrReportsPage() {
  const result = await apiServerFetch<Reports>('/hr/reports');
  const stats = result.data ?? {};

  return (
    <div>
      <PageHeader
        title="HR Reports"
        description="Current counts across people, hiring, assets, and pay."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(labels).map(([key, label]) => (
          <div
            key={key}
            className="rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4"
          >
            <div className="text-xs text-[var(--varnarc-subtle)]">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{stats[key] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
