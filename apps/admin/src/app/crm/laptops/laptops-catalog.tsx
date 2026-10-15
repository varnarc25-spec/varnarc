'use client';

import { useState } from 'react';
import type { RentalDiscountTier } from '@varnarc/validation';
import { HrPanel } from '@/components/hr-table';
import { LaptopForm, type LaptopValues } from './laptop-form';
import { LaptopsTable, type LaptopTableRow, type PriceListCompany } from './laptops-table';

export function LaptopsCatalog({
  rows,
  discounts,
  company,
  blank,
}: {
  rows: LaptopTableRow[];
  discounts: RentalDiscountTier[];
  company: PriceListCompany;
  blank: LaptopValues;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {adding ? (
        <HrPanel>
          <LaptopForm
            initial={blank}
            submitLabel="Add laptop"
            discounts={discounts}
            onCancel={() => setAdding(false)}
            onSaved={() => setAdding(false)}
          />
        </HrPanel>
      ) : (
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
          onClick={() => setAdding(true)}
        >
          Add new laptop
        </button>
      )}
      <LaptopsTable rows={rows} discounts={discounts} company={company} />
    </div>
  );
}
