import { PageHeader } from '@varnarc/ui';
import { HrDataTable } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Asset = { status: string; master: { category: string } };

export default async function HrAssetReportsPage() {
  const result = await apiServerFetch<Asset[]>('/hr/assets');
  const rows = result.data ?? [];
  const byStatus = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const row of rows) {
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    byCategory.set(row.master.category, (byCategory.get(row.master.category) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Asset Reports"
        description="How many items are available, assigned, or grouped by category."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-8">
        <HrDataTable
          columns={['Status', 'Count']}
          empty="No assets yet."
          rows={[...byStatus.entries()].map(([status, count]) => [status, count])}
        />
      </div>
      <HrDataTable
        columns={['Category', 'Count']}
        empty="No categories yet."
        rows={[...byCategory.entries()].map(([category, count]) => [category, count])}
      />
    </div>
  );
}
