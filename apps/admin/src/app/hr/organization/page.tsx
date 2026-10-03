import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Org = {
  id: string;
  name: string;
  code: string | null;
  kind: string;
  parent: { name: string } | null;
};

export default async function HrOrganizationPage() {
  const result = await apiServerFetch<Org[]>('/hr/organizations');
  const units = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Organization"
        description="Company, branches, and units. Departments stay on their own page."
      />
      <p className="mb-4 text-sm">
        <Link className="text-[var(--varnarc-brand)]" href="/hr/departments">
          Manage departments
        </Link>
      </p>
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/organizations"
          submitLabel="Add unit"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'code', label: 'Code' },
            {
              name: 'kind',
              label: 'Kind',
              type: 'select',
              required: true,
              options: [
                { value: 'COMPANY', label: 'Company' },
                { value: 'BRANCH', label: 'Branch' },
                { value: 'UNIT', label: 'Unit' },
              ],
            },
            {
              name: 'parentId',
              label: 'Parent',
              type: 'select',
              options: units.map((unit) => ({ value: unit.id, label: unit.name })),
            },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Name', 'Code', 'Kind', 'Parent']}
        empty="No organization units yet."
        rows={units.map((unit) => [
          unit.name,
          unit.code || '—',
          unit.kind,
          unit.parent?.name || '—',
        ])}
      />
    </div>
  );
}
