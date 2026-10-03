import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Folder = { id: string; name: string };
type DocType = { id: string; name: string };
type Employee = { id: string; fullName: string };
type DocumentRow = {
  title: string;
  reference: string | null;
  folder: { name: string } | null;
  type: { name: string } | null;
  employee: { fullName: string } | null;
};

export default async function HrBrowseDocumentsPage() {
  const [documents, folders, types, employees] = await Promise.all([
    apiServerFetch<DocumentRow[]>('/hr/documents'),
    apiServerFetch<Folder[]>('/hr/document-folders'),
    apiServerFetch<DocType[]>('/hr/document-types'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);

  return (
    <div>
      <PageHeader
        title="Browse Documents"
        description="Records stored against a folder, a type, and an employee."
      />
      {documents.error ? <p className="mb-4 text-sm text-red-600">{documents.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/documents"
          submitLabel="Add document"
          fields={[
            { name: 'title', label: 'Title', required: true },
            {
              name: 'folderId',
              label: 'Folder',
              type: 'select',
              options: (folders.data ?? []).map((folder) => ({
                value: folder.id,
                label: folder.name,
              })),
            },
            {
              name: 'typeId',
              label: 'Type',
              type: 'select',
              options: (types.data ?? []).map((type) => ({ value: type.id, label: type.name })),
            },
            {
              name: 'employeeId',
              label: 'Employee',
              type: 'select',
              options: (employees.data ?? []).map((employee) => ({
                value: employee.id,
                label: employee.fullName,
              })),
            },
            { name: 'reference', label: 'Link or reference' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Title', 'Folder', 'Type', 'Employee', 'Reference']}
        empty="No documents yet."
        rows={(documents.data ?? []).map((row) => [
          row.title,
          row.folder?.name || '—',
          row.type?.name || '—',
          row.employee?.fullName || '—',
          row.reference || '—',
        ])}
      />
    </div>
  );
}
