import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Notice = { id: string; title: string; body: string; readAt: string | null; createdAt: string };

export default async function HrNotificationsPage() {
  const result = await apiServerFetch<Notice[]>('/hr/notifications');
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Notices for the HR team. Mark one read when it is handled."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/notifications"
          submitLabel="Add notification"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'body', label: 'Message', required: true },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Title', 'Message', 'Status', '']}
        empty="No notifications yet."
        rows={rows.map((row) => [
          row.title,
          row.body,
          row.readAt ? 'Read' : 'Unread',
          row.readAt ? null : (
            <HrStatusButton
              key={row.id}
              path={`/api/admin/hr/notifications/${row.id}`}
              label="Mark read"
              body={{}}
            />
          ),
        ])}
      />
    </div>
  );
}
