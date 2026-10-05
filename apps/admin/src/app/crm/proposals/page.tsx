import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import {
  formatProposalDate,
  formatProposalInr,
  LAPTOP_RENTAL_STATUSES,
  LAPTOP_RENTAL_STATUS_LABELS,
  type LaptopRentalProposalSummary,
} from '@varnarc/validation';
import { HrDataTable } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Search = { searchParams: Promise<{ status?: string }> };

export default async function LaptopProposalsPage({ searchParams }: Search) {
  const { status } = await searchParams;
  const selected = LAPTOP_RENTAL_STATUSES.find((item) => item === status);
  const result = await apiServerFetch<LaptopRentalProposalSummary[]>(
    selected ? `/crm/rental-proposals?status=${selected}` : '/crm/rental-proposals',
  );
  const rows = result.data ?? [];

  return (
    <div>
      <PageHeader
        title="Laptop proposals"
        description="Prepare a corporate laptop rental proposal for a company and download it as a PDF."
        actions={
          <Link
            href="/crm/proposals/new"
            className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
          >
            New proposal
          </Link>
        }
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <StatusLink href="/crm/proposals" label="All" active={!selected} />
        {LAPTOP_RENTAL_STATUSES.map((item) => (
          <StatusLink
            key={item}
            href={`/crm/proposals?status=${item}`}
            label={LAPTOP_RENTAL_STATUS_LABELS[item]}
            active={selected === item}
          />
        ))}
      </div>
      <HrDataTable
        columns={[
          'Proposal',
          'Company',
          'Date',
          'Laptops',
          'Monthly incl. GST',
          'Deposit',
          'Status',
          '',
        ]}
        empty="No laptop rental proposals yet."
        rows={rows.map((row) => [
          <Link key={row.id} href={`/crm/proposals/${row.id}`} className="font-medium underline">
            {row.proposalNumber}
          </Link>,
          <Link
            key={`${row.id}-company`}
            href={`/crm/companies/${row.companyId}`}
            className="underline"
          >
            {row.customerCompanyName}
          </Link>,
          formatProposalDate(row.proposalDate),
          String(row.quantity),
          formatProposalInr(row.monthlyWithGst),
          formatProposalInr(row.depositTotal),
          LAPTOP_RENTAL_STATUS_LABELS[row.status],
          <span key={`${row.id}-links`} className="flex gap-3">
            <Link href={`/crm/proposals/${row.id}/edit`} className="underline">
              Edit
            </Link>
            <Link href={`/crm/proposals/${row.id}/rental`} className="underline">
              Rental
            </Link>
          </span>,
        ])}
      />
    </div>
  );
}

function StatusLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${active ? 'border-[var(--varnarc-brand)] text-[var(--varnarc-brand)]' : 'border-[var(--varnarc-border)]'}`}
    >
      {label}
    </Link>
  );
}
