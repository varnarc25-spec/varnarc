import { PageHeader } from '@varnarc/ui';
import { DEFAULT_RENTAL_DISCOUNTS, type RentalDiscountTier } from '@varnarc/validation';
import { apiServerFetch } from '@/lib/api';
import { DiscountForm } from './discount-form';

export default async function RentalDiscountsPage() {
  const result = await apiServerFetch<RentalDiscountTier[]>('/crm/rental-discounts');
  const tiers = result.data?.length
    ? result.data
    : DEFAULT_RENTAL_DISCOUNTS.map((tier) => ({ ...tier }));

  return (
    <div>
      <PageHeader
        title="Discounts"
        description="These percents apply to every laptop. A proposal uses the highest discount whose months are at or below the commitment length, and that percent can still be changed on the proposal."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <DiscountForm initial={tiers} />
    </div>
  );
}
