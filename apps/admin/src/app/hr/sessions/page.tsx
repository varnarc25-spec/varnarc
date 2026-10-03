import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Account = { id: string; email: string };
type Session = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  ipAddress: string | null;
  status: string;
  account: { email: string };
};

export default async function HrSessionsPage() {
  const [sessions, accounts] = await Promise.all([
    apiServerFetch<Session[]>('/hr/sessions'),
    apiServerFetch<Account[]>('/hr/accounts'),
  ]);

  return (
    <div>
      <PageHeader
        title="Login Sessions"
        description="Record a portal sign-in and end it when the person signs out."
      />
      {sessions.error ? <p className="mb-4 text-sm text-red-600">{sessions.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/sessions"
          submitLabel="Record session"
          fields={[
            {
              name: 'accountId',
              label: 'Account',
              type: 'select',
              required: true,
              options: (accounts.data ?? []).map((account) => ({
                value: account.id,
                label: account.email,
              })),
            },
            { name: 'ipAddress', label: 'IP address' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Account', 'Started', 'IP', 'Status', '']}
        empty="No sessions yet."
        rows={(sessions.data ?? []).map((row) => [
          row.account.email,
          row.startedAt.replace('T', ' ').slice(0, 16),
          row.ipAddress || '—',
          row.status,
          row.status === 'ACTIVE' ? (
            <HrStatusButton
              key={row.id}
              path={`/api/admin/hr/sessions/${row.id}`}
              label="End session"
              body={{}}
            />
          ) : null,
        ])}
      />
    </div>
  );
}
