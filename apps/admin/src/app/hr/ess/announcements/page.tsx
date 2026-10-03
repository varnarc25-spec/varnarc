import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Announcement = { title: string; body: string; publishedOn: string };

export default async function HrAnnouncementsPage() {
  const result = await apiServerFetch<Announcement[]>('/hr/announcements');

  return (
    <div>
      <PageHeader title="ESS Announcements" description="Messages published for employees." />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/announcements"
          submitLabel="Publish"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'body', label: 'Message', required: true },
            { name: 'publishedOn', label: 'Date', type: 'date', required: true },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Date', 'Title', 'Message']}
        empty="No announcements yet."
        rows={(result.data ?? []).map((row) => [row.publishedOn.slice(0, 10), row.title, row.body])}
      />
    </div>
  );
}
