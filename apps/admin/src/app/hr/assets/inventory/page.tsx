import { PageHeader } from '@varnarc/ui';
import { HrPutSelect, HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Master = { id: string; name: string };
type Employee = { id: string; fullName: string; employeeCode: string };
type Asset = {
  id: string;
  assetTag: string;
  status: string;
  master: { name: string; category: string };
  employee: { fullName: string; employeeCode: string } | null;
};

export default async function HrAssetInventoryPage() {
  const [assets, masters, employees] = await Promise.all([
    apiServerFetch<Asset[]>('/hr/assets'),
    apiServerFetch<Master[]>('/hr/asset-masters'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);
  const rows = assets.data ?? [];
  const people = employees.data ?? [];

  return (
    <div>
      <PageHeader
        title="Asset Inventory"
        description="Each item gets a tag. Assign it to an employee or return it."
      />
      {assets.error ? <p className="mb-4 text-sm text-red-600">{assets.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/assets"
          submitLabel="Add asset"
          fields={[
            {
              name: 'masterId',
              label: 'Master',
              type: 'select',
              required: true,
              options: (masters.data ?? []).map((master) => ({
                value: master.id,
                label: master.name,
              })),
            },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Tag', 'Item', 'Status', 'Holder', 'Assign']}
        empty="No assets yet."
        rows={rows.map((row) => [
          row.assetTag,
          `${row.master.name} · ${row.master.category}`,
          row.status,
          row.employee ? `${row.employee.fullName}` : '—',
          <HrPutSelect
            key={row.id}
            path={`/api/admin/hr/assets/${row.id}`}
            name="employeeId"
            label="Save"
            options={people.map((person) => ({
              value: person.id,
              label: `${person.fullName} (${person.employeeCode})`,
            }))}
          />,
        ])}
      />
    </div>
  );
}
