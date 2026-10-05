import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { formatProposalInr, type CrmDashboard } from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';

const sections = [
  { href: '/crm/companies', label: 'Companies', detail: 'Customers, GSTIN, and notes' },
  { href: '/crm/contacts', label: 'Contacts', detail: 'People at each company' },
  { href: '/crm/laptops', label: 'Laptops', detail: 'Asset tag, serial number, and specification' },
  { href: '/crm/proposals', label: 'Proposals', detail: 'Laptop rental offers and PDFs' },
  { href: '/crm/rentals', label: 'Rentals', detail: 'Agreements, deposits, and invoices' },
];

export default async function CrmDashboardPage() {
  const result = await apiServerFetch<CrmDashboard>('/crm/dashboard');
  const stats = result.data;
  const pipeline = stats?.proposals;

  return (
    <div>
      <PageHeader
        title="CRM"
        description="Companies, contacts, laptop rental proposals, and live rentals."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Companies', value: String(stats?.companies ?? 0), href: '/crm/companies' },
          { label: 'Contacts', value: String(stats?.contacts ?? 0), href: '/crm/contacts' },
          {
            label: 'Active rentals',
            value: String(stats?.activeRentals ?? 0),
            href: '/crm/rentals',
          },
          {
            label: 'Awaiting signature',
            value: String(stats?.pendingSignatures ?? 0),
            href: '/crm/rentals',
          },
          {
            label: 'Draft proposals',
            value: String(pipeline?.draft ?? 0),
            href: '/crm/proposals?status=DRAFT',
          },
          {
            label: 'Sent proposals',
            value: String(pipeline?.sent ?? 0),
            href: '/crm/proposals?status=SENT',
          },
          {
            label: 'Accepted proposals',
            value: String(pipeline?.accepted ?? 0),
            href: '/crm/proposals?status=ACCEPTED',
          },
          {
            label: 'Open invoices',
            value: formatProposalInr(stats?.openInvoiceTotal ?? 0),
            href: '/crm/rentals',
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4 hover:bg-[var(--varnarc-muted)]"
          >
            <div className="text-xs text-[var(--varnarc-subtle)]">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold">{item.value}</div>
          </Link>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4 hover:bg-[var(--varnarc-muted)]"
          >
            <div className="font-medium text-[var(--varnarc-brand)]">{section.label}</div>
            <div className="mt-1 text-sm text-[var(--varnarc-subtle)]">{section.detail}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
