import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type DocType = { id: string; name: string; code: string | null };

export default async function HrDocumentTypesPage() {
  const result = await apiServerFetch<DocType[]>('/hr/document-types');

  return (
    <div>
      <PageHeader
        title="Document Types"
        description="Labels such as offer letter, ID proof, or contract."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/document-types"
          submitLabel="Add type"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'code', label: 'Code' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Name', 'Code']}
        empty="No document types yet."
        rows={(result.data ?? []).map((row) => [row.name, row.code || '—'])}
      />
    </div>
  );
}
