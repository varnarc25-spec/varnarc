import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import type { CrmContactView } from '@varnarc/validation';
import { HrDataTable } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';
import { DeleteContactButton } from '../companies/company-forms';

export default async function CrmContactsPage() {
  const result = await apiServerFetch<CrmContactView[]>('/crm/contacts');
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People at customer companies. Add a contact from the company page."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrDataTable
        columns={['Name', 'Company', 'Designation', 'Email', 'Phone', 'Primary', '']}
        empty="No contacts yet."
        rows={rows.map((row) => [
          row.name,
          <Link
            key={`${row.id}-company`}
            href={`/crm/companies/${row.companyId}`}
            className="underline"
          >
            {row.companyName}
          </Link>,
          row.designation ?? '',
          row.email ?? '',
          row.phone ?? '',
          row.isPrimary ? 'Yes' : '',
          <DeleteContactButton key={row.id} contactId={row.id} />,
        ])}
      />
    </div>
  );
}
