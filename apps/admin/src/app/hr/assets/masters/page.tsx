import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Master = { id: string; name: string; category: string; _count: { assets: number } };

export default async function HrAssetMastersPage() {
  const result = await apiServerFetch<Master[]>('/hr/asset-masters');
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Asset Masters"
        description="Types of equipment you issue, such as laptops or phones."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/asset-masters"
          submitLabel="Add master"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'category', label: 'Category', required: true },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Name', 'Category', 'Items']}
        empty="No asset masters yet."
        rows={rows.map((row) => [row.name, row.category, row._count.assets])}
      />
    </div>
  );
}
