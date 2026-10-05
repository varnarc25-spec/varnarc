import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import {
  CRM_ACTIVITY_KIND_LABELS,
  formatProposalDate,
  formatProposalInr,
  LAPTOP_RENTAL_STATUS_LABELS,
  type CrmActivityView,
  type CrmCompanyView,
  type CrmContactView,
  type LaptopRentalProposalSummary,
} from '@varnarc/validation';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';
import {
  ActivityForm,
  CompanyForm,
  ContactForm,
  DeleteCompanyButton,
  DeleteContactButton,
} from '../company-forms';

type CompanyDetail = CrmCompanyView & {
  contacts: CrmContactView[];
  activities: CrmActivityView[];
  proposals: LaptopRentalProposalSummary[];
};

type Params = { params: Promise<{ id: string }> };

export default async function CrmCompanyPage({ params }: Params) {
  const { id } = await params;
  const result = await apiServerFetch<CompanyDetail>(`/crm/companies/${id}`);
  if (result.status === 404) notFound();
  const company = result.data;

  return (
    <div>
      <PageHeader
        title={company?.name ?? 'Company'}
        description="Contacts, activity, and laptop rental proposals for this company."
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
      {company ? (
        <>
          <HrPanel>
            <CompanyForm
              companyId={company.id}
              submitLabel="Save company"
              initial={{
                name: company.name,
                email: company.email ?? '',
                phone: company.phone ?? '',
                address: company.address ?? '',
                city: company.city ?? '',
                gstin: company.gstin ?? '',
                website: company.website ?? '',
                notes: company.notes ?? '',
              }}
            />
            <div className="mt-4">
              <DeleteCompanyButton companyId={company.id} />
            </div>
          </HrPanel>
          <h2 className="mb-3 text-lg font-medium">Contacts</h2>
          <HrPanel>
            <ContactForm companyId={company.id} />
          </HrPanel>
          <HrDataTable
            columns={['Name', 'Designation', 'Email', 'Phone', 'Primary', '']}
            empty="No contacts yet."
            rows={company.contacts.map((contact) => [
              contact.name,
              contact.designation ?? '',
              contact.email ?? '',
              contact.phone ?? '',
              contact.isPrimary ? 'Yes' : '',
              <DeleteContactButton key={contact.id} contactId={contact.id} />,
            ])}
          />
          <h2 className="mb-3 mt-8 text-lg font-medium">Activity</h2>
          <HrPanel>
            <ActivityForm
              companyId={company.id}
              proposals={company.proposals.map((proposal) => ({
                id: proposal.id,
                proposalNumber: proposal.proposalNumber,
              }))}
            />
          </HrPanel>
          <HrDataTable
            columns={['Date', 'Kind', 'Note']}
            empty="No activity yet."
            rows={company.activities.map((activity) => [
              formatProposalDate(activity.occurredOn),
              CRM_ACTIVITY_KIND_LABELS[activity.kind],
              activity.body,
            ])}
          />
          <h2 className="mb-3 mt-8 text-lg font-medium">Proposals</h2>
          <HrDataTable
            columns={['Proposal', 'Date', 'Laptops', 'Monthly incl. GST', 'Status', '']}
            empty="No proposals for this company."
            rows={company.proposals.map((proposal) => [
              <Link
                key={proposal.id}
                href={`/crm/proposals/${proposal.id}`}
                className="font-medium underline"
              >
                {proposal.proposalNumber}
              </Link>,
              formatProposalDate(proposal.proposalDate),
              String(proposal.quantity),
              formatProposalInr(proposal.monthlyWithGst),
              LAPTOP_RENTAL_STATUS_LABELS[proposal.status],
              <Link
                key={`${proposal.id}-rental`}
                href={`/crm/proposals/${proposal.id}/rental`}
                className="underline"
              >
                Rental
              </Link>,
            ])}
          />
        </>
      ) : null}
    </div>
  );
}
