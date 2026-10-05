import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import {
  DEFAULT_RENTAL_DISCOUNTS,
  type LaptopRentalFormValues,
  type LaptopRentalProposalView,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';
import { ProposalForm } from '../../proposal-form';

type CompanyOption = { id: string; name: string };
type CatalogLaptop = {
  id: string;
  name: string;
  assetTag: string | null;
  serialNumber: string | null;
  brand: string;
  model: string | null;
  processor: string;
  ram: string | null;
  storage: string | null;
  display: string | null;
  operatingSystem: string;
  condition: string | null;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'VARIES';
  status: string;
  proposalId: string | null;
};
type Params = { params: Promise<{ id: string }> };

export default async function EditLaptopProposalPage({ params }: Params) {
  const { id } = await params;
  const [proposal, companies, laptops, discounts] = await Promise.all([
    apiServerFetch<LaptopRentalProposalView>(`/crm/rental-proposals/${id}`),
    apiServerFetch<CompanyOption[]>('/crm/companies'),
    apiServerFetch<CatalogLaptop[]>('/crm/laptops'),
    apiServerFetch<RentalDiscountTier[]>('/crm/rental-discounts'),
  ]);
  if (proposal.status === 404) notFound();
  const row = proposal.data;

  return (
    <div>
      <PageHeader
        title="Edit laptop proposal"
        description={row ? `${row.proposalNumber} for ${row.customerCompanyName}` : undefined}
      />
      {proposal.error ? <p className="mb-4 text-sm text-red-600">{proposal.error}</p> : null}
      {companies.error ? <p className="mb-4 text-sm text-red-600">{companies.error}</p> : null}
      {laptops.error ? <p className="mb-4 text-sm text-red-600">{laptops.error}</p> : null}
      {row ? (
        <ProposalForm
          mode="edit"
          proposalId={row.id}
          companies={companies.data ?? []}
          laptops={laptops.data ?? []}
          discounts={discounts.data?.length ? discounts.data : DEFAULT_RENTAL_DISCOUNTS}
          initial={toForm(row)}
        />
      ) : null}
    </div>
  );
}

function toForm(row: LaptopRentalProposalView): LaptopRentalFormValues {
  return {
    companyId: row.companyId,
    customerCompanyName: row.customerCompanyName,
    proposalDate: row.proposalDate,
    title: row.title,
    proposalSummary: row.proposalSummary,
    quantity: row.quantity,
    processor: row.processor,
    ram: row.ram,
    storage: row.storage,
    display: row.display,
    operatingSystem: row.operatingSystem,
    brand: row.brand,
    condition: row.condition,
    accessories: row.accessories,
    monthlyRate: row.monthlyRate,
    commitmentMonths: row.commitmentMonths,
    commitmentRate: row.commitmentRate,
    gstPercent: row.gstPercent,
    depositPerLaptop: row.depositPerLaptop,
    deliveryLocation: row.deliveryLocation,
    services: row.services,
    supportText: row.supportText,
    responsibilities: row.responsibilities,
    paymentDueText: row.paymentDueText,
    depositNote: row.depositNote,
    returnIntro: row.returnIntro,
    returnChecks: row.returnChecks,
    wearNote: row.wearNote,
    acceptanceText: row.acceptanceText,
    gstNote: row.gstNote,
    customerSignatoryName: row.customerSignatoryName ?? '',
    customerSignatoryDesignation: row.customerSignatoryDesignation ?? '',
    issuerSignatoryName: row.issuerSignatoryName ?? '',
    issuerSignatoryDesignation: row.issuerSignatoryDesignation ?? '',
    issuerName: row.issuerName,
    issuerAddress: row.issuerAddress ?? '',
    issuerPhone: row.issuerPhone ?? '',
    issuerEmail: row.issuerEmail ?? '',
    issuerGstin: row.issuerGstin ?? '',
    laptopIds: row.laptopIds,
    laptopLines: row.laptopLines,
    discountPercent: row.discountPercent,
    status: row.status,
  };
}
