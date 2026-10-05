import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import {
  DEFAULT_RENTAL_DISCOUNTS,
  type CrmLaptopView,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';
import { DeleteLaptopButton, LaptopForm } from '../laptop-form';

type Params = { params: Promise<{ id: string }> };

export default async function CrmLaptopPage({ params }: Params) {
  const { id } = await params;
  const [result, discounts] = await Promise.all([
    apiServerFetch<CrmLaptopView>(`/crm/laptops/${id}`),
    apiServerFetch<RentalDiscountTier[]>('/crm/rental-discounts'),
  ]);
  const tiers = discounts.data?.length ? discounts.data : DEFAULT_RENTAL_DISCOUNTS;
  if (result.status === 404) notFound();
  const laptop = result.data;

  return (
    <div>
      <PageHeader
        title={laptop ? laptop.name : 'Laptop'}
        description={laptop ? [laptop.brand, laptop.model].filter(Boolean).join(' ') : undefined}
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      {laptop ? (
        <HrPanel>
          <LaptopForm
            laptopId={laptop.id}
            submitLabel="Save laptop"
            discounts={tiers}
            initial={{
              name: laptop.name,
              category: laptop.category,
              brand: laptop.brand,
              model: laptop.model ?? '',
              listedYear: laptop.listedYear,
              generation: laptop.generation ?? '',
              processor: laptop.processor,
              processorFull: laptop.processorFull ?? '',
              ram: laptop.ram ?? '',
              storage: laptop.storage ?? '',
              display: laptop.display ?? '',
              graphics: laptop.graphics ?? '',
              camera: laptop.camera,
              operatingSystem: laptop.operatingSystem,
              modelNumber: laptop.modelNumber ?? '',
              ports: laptop.ports ?? '',
              adapter: laptop.adapter ?? '',
              useCase: laptop.useCase ?? '',
              condition: laptop.condition ?? '',
              notes: laptop.notes ?? '',
              assetTag: laptop.assetTag ?? '',
              serialNumber: laptop.serialNumber ?? '',
              monthlyRate: laptop.monthlyRate,
              commitmentMonths: laptop.commitmentMonths,
              commitmentRate: laptop.commitmentRate,
              gstPercent: laptop.gstPercent,
              depositPerLaptop: laptop.depositPerLaptop,
              taxesNote: laptop.taxesNote ?? '',
              availability: laptop.availability,
              status: laptop.status,
            }}
          />
          <DeleteLaptopButton laptopId={laptop.id} />
        </HrPanel>
      ) : null}
    </div>
  );
}
