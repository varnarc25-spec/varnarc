import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Opening = { id: string; title: string; status: string };
type Candidate = {
  id: string;
  fullName: string;
  email: string | null;
  status: string;
  opening: { title: string };
};

const nextStatus: Record<string, string> = {
  APPLIED: 'SCREENING',
  SCREENING: 'INTERVIEW',
  INTERVIEW: 'OFFERED',
  OFFERED: 'HIRED',
};

export default async function HrCandidatesPage() {
  const [candidates, openings] = await Promise.all([
    apiServerFetch<Candidate[]>('/hr/candidates'),
    apiServerFetch<Opening[]>('/hr/openings'),
  ]);
  const rows = candidates.data ?? [];

  return (
    <div>
      <PageHeader title="Candidates" description="People linked to a job opening." />
      {candidates.error ? <p className="mb-4 text-sm text-red-600">{candidates.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/candidates"
          submitLabel="Add candidate"
          fields={[
            {
              name: 'openingId',
              label: 'Opening',
              type: 'select',
              required: true,
              options: (openings.data ?? []).map((opening) => ({
                value: opening.id,
                label: opening.title,
              })),
            },
            { name: 'fullName', label: 'Name', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Name', 'Opening', 'Status', '']}
        empty="No candidates yet."
        rows={rows.map((row) => [
          row.fullName,
          row.opening.title,
          row.status,
          nextStatus[row.status] ? (
            <span key={row.id} className="flex gap-3">
              <HrStatusButton
                path={`/api/admin/hr/candidates/${row.id}`}
                status={nextStatus[row.status]}
                label="Advance"
              />
              <HrStatusButton
                path={`/api/admin/hr/candidates/${row.id}`}
                status="REJECTED"
                label="Reject"
              />
            </span>
          ) : null,
        ])}
      />
    </div>
  );
}
