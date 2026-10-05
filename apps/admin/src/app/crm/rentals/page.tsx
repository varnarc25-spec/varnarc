import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { formatProposalDate, type CrmRentalSummary } from '@varnarc/validation';
import { HrDataTable } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

const STATUS_LABELS: Record<CrmRentalSummary['status'], string> = {
  PENDING_SIGNATURE: 'Pending signature',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

export default async function CrmRentalsPage() {
  const result = await apiServerFetch<CrmRentalSummary[]>('/crm/rentals');
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Rentals"
        description="Agreements started from accepted proposals. Open a rental to manage laptops, deposit, invoices, and support."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrDataTable
        columns={['Agreement', 'Company', 'Proposal', 'Start', 'End', 'Laptops', 'Status', '']}
        empty="No rentals yet. Accept a proposal, then start the rental service."
        rows={rows.map((row) => [
          row.agreementNumber,
          <Link
            key={`${row.id}-company`}
            href={`/crm/companies/${row.companyId}`}
            className="underline"
          >
            {row.companyName}
          </Link>,
          <Link
            key={`${row.id}-proposal`}
            href={`/crm/proposals/${row.proposalId}`}
            className="underline"
          >
            {row.proposalNumber}
          </Link>,
          formatProposalDate(row.startDate),
          formatProposalDate(row.endDate),
          String(row.quantity),
          STATUS_LABELS[row.status],
          <Link
            key={`${row.id}-desk`}
            href={`/crm/proposals/${row.proposalId}/rental`}
            className="underline"
          >
            Open
          </Link>,
        ])}
      />
    </div>
  );
}
