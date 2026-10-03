import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Folder = { id: string; name: string; parent: { name: string } | null };

export default async function HrDocumentFoldersPage() {
  const result = await apiServerFetch<Folder[]>('/hr/document-folders');
  const folders = result.data ?? [];

  return (
    <div>
      <PageHeader title="Document Folders" description="Group employee papers into folders." />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/document-folders"
          submitLabel="Add folder"
          fields={[
            { name: 'name', label: 'Name', required: true },
            {
              name: 'parentId',
              label: 'Parent folder',
              type: 'select',
              options: folders.map((folder) => ({ value: folder.id, label: folder.name })),
            },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Folder', 'Parent']}
        empty="No folders yet."
        rows={folders.map((folder) => [folder.name, folder.parent?.name || '—'])}
      />
    </div>
  );
}
