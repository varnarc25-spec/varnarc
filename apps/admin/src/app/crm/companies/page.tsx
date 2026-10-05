import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import type { CrmCompanyView } from '@varnarc/validation';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';
import { CompanyForm } from './company-forms';

const blank = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  gstin: '',
  website: '',
  notes: '',
};

export default async function CrmCompaniesPage() {
  const result = await apiServerFetch<CrmCompanyView[]>('/crm/companies');
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Customer companies for proposals and laptop rentals. A new proposal can also create a company from the name on the offer."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <CompanyForm initial={blank} submitLabel="Add company" />
      </HrPanel>
      <HrDataTable
        columns={['Company', 'City', 'GSTIN', 'Contacts', 'Proposals', '']}
        empty="No companies yet."
        rows={rows.map((row) => [
          <Link key={row.id} href={`/crm/companies/${row.id}`} className="font-medium underline">
            {row.name}
          </Link>,
          row.city ?? '',
          row.gstin ?? '',
          String(row.contactCount),
          String(row.proposalCount),
          <Link key={`${row.id}-proposal`} href={`/crm/proposals/new`} className="underline">
            New proposal
          </Link>,
        ])}
      />
    </div>
  );
}
