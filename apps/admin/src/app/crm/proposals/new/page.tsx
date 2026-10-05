import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import {
  DEFAULT_RENTAL_DISCOUNTS,
  laptopRentalDefaults,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';
import { ProposalForm } from '../proposal-form';

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
type Company = {
  legalName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
};

export default async function NewLaptopProposalPage() {
  const [companies, laptops, company, discounts] = await Promise.all([
    apiServerFetch<CompanyOption[]>('/crm/companies'),
    apiServerFetch<CatalogLaptop[]>('/crm/laptops'),
    apiServerFetch<Company>('/settings/company'),
    apiServerFetch<RentalDiscountTier[]>('/crm/rental-discounts'),
  ]);
  const profile = company.data ?? {};
  const address = [
    profile.address,
    [profile.city, profile.state, profile.postalCode].filter(Boolean).join(', '),
    profile.country,
  ]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
    .join('\n');
  const proposalDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const initial = {
    ...laptopRentalDefaults(proposalDate),
    issuerName: profile.legalName?.trim() ?? '',
    issuerAddress: address,
    issuerPhone: profile.phone?.trim() ?? '',
    issuerEmail: profile.email?.trim() ?? '',
    issuerGstin: profile.gstin?.trim() ?? '',
  };

  return (
    <div>
      <PageHeader
        title="New laptop proposal"
        description="The rental rates, GST and security deposit are calculated on the proposal. Company details come from Settings → Company profile."
      />
      {companies.error ? <p className="mb-4 text-sm text-red-600">{companies.error}</p> : null}
      {!initial.issuerName ? (
        <p className="mb-4 text-sm text-[var(--varnarc-subtle)]">
          Add a legal name in{' '}
          <Link href="/settings/company" className="underline">
            Settings → Company profile
          </Link>{' '}
          or type it below. It is printed as the company preparing the proposal.
        </p>
      ) : null}
      {laptops.error ? <p className="mb-4 text-sm text-red-600">{laptops.error}</p> : null}
      <ProposalForm
        mode="create"
        companies={companies.data ?? []}
        laptops={laptops.data ?? []}
        discounts={discounts.data?.length ? discounts.data : DEFAULT_RENTAL_DISCOUNTS}
        initial={initial}
      />
    </div>
  );
}
