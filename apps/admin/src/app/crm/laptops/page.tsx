import { PageHeader } from '@varnarc/ui';
import {
  CRM_LAPTOP_AVAILABILITY_LABELS,
  CRM_LAPTOP_CATEGORY_LABELS,
  DEFAULT_RENTAL_DISCOUNTS,
  type CrmLaptopView,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';
import { LaptopForm, type LaptopValues } from './laptop-form';
import { LaptopsTable, type LaptopTableRow } from './laptops-table';

const blank: LaptopValues = {
  name: '',
  category: 'WINDOWS_LAPTOP',
  brand: '',
  model: '',
  listedYear: null,
  generation: '',
  processor: '',
  processorFull: '',
  ram: '',
  storage: '',
  display: '',
  graphics: '',
  camera: true,
  operatingSystem: 'Windows 11 Pro',
  modelNumber: '',
  ports: '',
  adapter: '',
  useCase: '',
  condition: '',
  notes: '',
  assetTag: '',
  serialNumber: '',
  monthlyRate: null,
  commitmentMonths: 12,
  commitmentRate: 0,
  gstPercent: 18,
  depositPerLaptop: 5000,
  taxesNote: 'Additional charges may apply at checkout',
  availability: 'IN_STOCK',
  status: 'AVAILABLE',
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
  logoUrl?: string | null;
};

async function logoDataUrl(url: string | null | undefined) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 2_000_000) return null;
    return `data:${type.split(';')[0]};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

function toTableRow(row: CrmLaptopView): LaptopTableRow {
  return {
    id: row.id,
    name: row.name,
    category: CRM_LAPTOP_CATEGORY_LABELS[row.category],
    brand: row.brand,
    model: row.model ?? '',
    listedYear: row.listedYear == null ? '' : String(row.listedYear),
    generation: row.generation ?? '',
    processor: row.processor,
    processorDetail: [row.processor, row.generation ? `${row.generation} gen` : null]
      .filter(Boolean)
      .join(' · '),
    processorFull: row.processorFull ?? '',
    ram: row.ram ?? '',
    storage: row.storage ?? '',
    display: row.display ?? '',
    graphics: row.graphics ?? '',
    operatingSystem: row.operatingSystem,
    camera: row.camera ? 'Yes' : 'No',
    monthlyRate: row.monthlyRate,
    commitmentMonths: row.commitmentMonths,
    commitmentRate: row.commitmentRate,
    gstPercent: row.gstPercent,
    depositPerLaptop: row.depositPerLaptop,
    taxesNote: row.taxesNote ?? '',
    availability: CRM_LAPTOP_AVAILABILITY_LABELS[row.availability],
    assetTag: row.assetTag ?? '',
    serialNumber: row.serialNumber ?? '',
  };
}

export default async function CrmLaptopsPage() {
  const [result, discounts, company] = await Promise.all([
    apiServerFetch<CrmLaptopView[]>('/crm/laptops'),
    apiServerFetch<RentalDiscountTier[]>('/crm/rental-discounts'),
    apiServerFetch<Company>('/settings/company'),
  ]);
  const rows = result.data ?? [];
  const tiers = discounts.data?.length ? discounts.data : DEFAULT_RENTAL_DISCOUNTS;
  const profile = company.data ?? {};
  const address = [
    profile.address,
    [profile.city, profile.state, profile.postalCode].filter(Boolean).join(', '),
    profile.country,
  ]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
    .join('\n');
  const logo = await logoDataUrl(profile.logoUrl);

  return (
    <div>
      <PageHeader
        title="Laptops"
        description="Add each laptop model here, with its specification and rental price. A proposal chooses from this list."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <LaptopForm initial={blank} submitLabel="Add laptop" discounts={tiers} />
      </HrPanel>
      <LaptopsTable
        rows={rows.map(toTableRow)}
        discounts={tiers}
        company={{
          name: profile.legalName?.trim() ?? '',
          address,
          phone: profile.phone?.trim() ?? '',
          email: profile.email?.trim() ?? '',
          gstin: profile.gstin?.trim() ?? '',
          logoDataUrl: logo,
        }}
      />
    </div>
  );
}
