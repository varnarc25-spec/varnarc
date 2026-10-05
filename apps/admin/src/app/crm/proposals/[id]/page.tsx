import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import type { LaptopRentalProposalView } from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';
import { ProposalPdfButton } from '../proposal-pdf';
import { ProposalSheet } from '../proposal-sheet';
import { ProposalStatus } from '../proposal-status';

type Params = { params: Promise<{ id: string }> };

export default async function LaptopProposalPage({ params }: Params) {
  const { id } = await params;
  const result = await apiServerFetch<LaptopRentalProposalView>(`/crm/rental-proposals/${id}`);
  if (result.status === 404) notFound();
  const proposal = result.data;

  return (
    <div>
      <PageHeader
        title={proposal?.document.headline ?? 'Laptop proposal'}
        description={
          proposal ? `${proposal.proposalNumber} · ${proposal.document.statusLabel}` : undefined
        }
        actions={
          proposal ? (
            <div className="flex flex-wrap items-center gap-3">
              <ProposalStatus id={proposal.id} status={proposal.status} />
              <Link
                href={`/crm/proposals/${proposal.id}/rental`}
                className="inline-flex h-10 items-center rounded-md border border-[var(--varnarc-border)] px-4 text-sm font-medium"
              >
                Rental service
              </Link>
              <Link
                href={`/crm/proposals/${proposal.id}/edit`}
                className="inline-flex h-10 items-center rounded-md border border-[var(--varnarc-border)] px-4 text-sm font-medium"
              >
                Edit
              </Link>
              <ProposalPdfButton document={proposal.document} logoDataUrl={proposal.logoDataUrl} />
            </div>
          ) : null
        }
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      {proposal ? (
        <ProposalSheet document={proposal.document} logoDataUrl={proposal.logoDataUrl} />
      ) : null}
    </div>
  );
}
