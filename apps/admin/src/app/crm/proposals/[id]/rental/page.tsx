import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import type { LaptopRentalServiceView } from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';
import { RentalDesk } from './rental-desk';

type Params = { params: Promise<{ id: string }> };

export default async function LaptopRentalServicePage({ params }: Params) {
  const { id } = await params;
  const result = await apiServerFetch<LaptopRentalServiceView>(
    `/crm/rental-proposals/${id}/service`,
  );
  if (result.status === 404) notFound();
  const service = result.data;

  return (
    <div>
      <PageHeader
        title={service ? `Rental for ${service.proposal.customerCompanyName}` : 'Rental'}
        description={
          service
            ? `${service.proposal.proposalNumber}${service.agreement ? ` · ${service.agreement.agreementNumber}` : ''}`
            : undefined
        }
        actions={
          <Link
            href={`/crm/proposals/${id}`}
            className="inline-flex h-10 items-center rounded-md border border-[var(--varnarc-border)] px-4 text-sm font-medium"
          >
            Proposal
          </Link>
        }
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      {service ? <RentalDesk service={service} /> : null}
    </div>
  );
}
