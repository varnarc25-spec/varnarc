import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Reports = { openJobs: number; candidates: number };

export default async function HrRecruitmentPage() {
  const result = await apiServerFetch<Reports>('/hr/reports');
  const stats = result.data;

  return (
    <div>
      <PageHeader
        title="Recruitment"
        description="Open roles, people who applied, and interviews."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--varnarc-border)] p-4">
          <div className="text-xs text-[var(--varnarc-subtle)]">Open jobs</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.openJobs ?? 0}</div>
        </div>
        <div className="rounded-lg border border-[var(--varnarc-border)] p-4">
          <div className="text-xs text-[var(--varnarc-subtle)]">Candidates</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.candidates ?? 0}</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: '/hr/openings', label: 'Job Openings' },
          { href: '/hr/candidates', label: 'Candidates' },
          { href: '/hr/interviews', label: 'Interviews' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-[var(--varnarc-border)] p-4 font-medium text-[var(--varnarc-brand)]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
