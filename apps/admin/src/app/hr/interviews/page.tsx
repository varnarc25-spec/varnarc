import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Candidate = { id: string; fullName: string };
type Interview = {
  id: string;
  scheduledAt: string;
  interviewer: string;
  status: string;
  result: string | null;
  candidate: { fullName: string };
};

export default async function HrInterviewsPage() {
  const [interviews, candidates] = await Promise.all([
    apiServerFetch<Interview[]>('/hr/interviews'),
    apiServerFetch<Candidate[]>('/hr/candidates'),
  ]);
  const rows = interviews.data ?? [];

  return (
    <div>
      <PageHeader title="Interviews" description="Schedule a conversation and record the result." />
      {interviews.error ? <p className="mb-4 text-sm text-red-600">{interviews.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/interviews"
          submitLabel="Schedule interview"
          fields={[
            {
              name: 'candidateId',
              label: 'Candidate',
              type: 'select',
              required: true,
              options: (candidates.data ?? []).map((candidate) => ({
                value: candidate.id,
                label: candidate.fullName,
              })),
            },
            { name: 'scheduledAt', label: 'When', type: 'datetime-local', required: true },
            { name: 'interviewer', label: 'Interviewer', required: true },
            { name: 'notes', label: 'Notes' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Candidate', 'When', 'Interviewer', 'Status', '']}
        empty="No interviews yet."
        rows={rows.map((row) => [
          row.candidate.fullName,
          row.scheduledAt.replace('T', ' ').slice(0, 16),
          row.interviewer,
          row.status,
          row.status === 'SCHEDULED' ? (
            <HrStatusButton
              key={row.id}
              path={`/api/admin/hr/interviews/${row.id}`}
              status="COMPLETED"
              label="Complete"
            />
          ) : (
            row.result || '—'
          ),
        ])}
      />
    </div>
  );
}
