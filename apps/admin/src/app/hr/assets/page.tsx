import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Reports = { assets: number; assignedAssets: number };

export default async function HrAssetsPage() {
  const result = await apiServerFetch<Reports>('/hr/reports');
  const stats = result.data;

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Catalog items, the live inventory, and assignment totals."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--varnarc-border)] p-4">
          <div className="text-xs text-[var(--varnarc-subtle)]">Assets</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.assets ?? 0}</div>
        </div>
        <div className="rounded-lg border border-[var(--varnarc-border)] p-4">
          <div className="text-xs text-[var(--varnarc-subtle)]">Assigned</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.assignedAssets ?? 0}</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: '/hr/assets/inventory', label: 'Asset Inventory' },
          { href: '/hr/assets/masters', label: 'Asset Masters' },
          { href: '/hr/assets/reports', label: 'Asset Reports' },
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
