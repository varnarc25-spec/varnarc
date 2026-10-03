import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Department = { id: string; name: string };
type Opening = {
  id: string;
  title: string;
  location: string | null;
  openings: number;
  status: string;
  department: { name: string } | null;
  _count: { candidates: number };
};

export default async function HrOpeningsPage() {
  const [openings, departments] = await Promise.all([
    apiServerFetch<Opening[]>('/hr/openings'),
    apiServerFetch<Department[]>('/hr/departments'),
  ]);
  const rows = openings.data ?? [];

  return (
    <div>
      <PageHeader title="Job Openings" description="Roles you are hiring for." />
      {openings.error ? <p className="mb-4 text-sm text-red-600">{openings.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/openings"
          submitLabel="Add opening"
          fields={[
            { name: 'title', label: 'Title', required: true },
            {
              name: 'departmentId',
              label: 'Department',
              type: 'select',
              options: (departments.data ?? []).map((department) => ({
                value: department.id,
                label: department.name,
              })),
            },
            { name: 'location', label: 'Location' },
            { name: 'openings', label: 'Openings', type: 'number', required: true },
            { name: 'description', label: 'Description' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Title', 'Department', 'Openings', 'Candidates', 'Status', '']}
        empty="No job openings yet."
        rows={rows.map((row) => [
          row.title,
          row.department?.name || '—',
          row.openings,
          row._count.candidates,
          row.status,
          <HrStatusButton
            key={row.id}
            path={`/api/admin/hr/openings/${row.id}`}
            status={row.status === 'OPEN' ? 'CLOSED' : 'OPEN'}
            label={row.status === 'OPEN' ? 'Close' : 'Reopen'}
          />,
        ])}
      />
    </div>
  );
}
