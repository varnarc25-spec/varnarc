'use client';

import Link from 'next/link';
import { trackAutomobileEvent } from '@/lib/automobile/analytics';

const TOOLS = [
  { href: '/automobile/calculators/car-loan', label: 'Car Loan EMI Calculator', slug: 'car-loan' },
  { href: '/automobile/calculators/fuel', label: 'Fuel Cost Calculator', slug: 'fuel' },
  { href: '/automobile/calculators/mileage', label: 'Mileage Calculator', slug: 'mileage' },
  {
    href: '/automobile/calculators/charging-cost',
    label: 'EV Charging Cost Calculator',
    slug: 'charging-cost',
  },
  { href: '/automobile/calculators/tco', label: 'Car Ownership Cost Calculator', slug: 'tco' },
  {
    href: '/automobile/calculators/depreciation',
    label: 'Depreciation Calculator',
    slug: 'depreciation',
  },
  { href: '/automobile/calculators/road-tax', label: 'Road Tax Calculator', slug: 'road-tax' },
  {
    href: '/automobile/calculators/car-insurance',
    label: 'Insurance Estimate',
    slug: 'car-insurance',
  },
];

export function RelatedCalculators() {
  return (
    <section className="mx-auto mt-10 max-w-[960px]" aria-label="Related automobile calculators">
      <h2 className="text-xl font-extrabold text-[#0b1f3a]">Related automobile calculators</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0b1f3a] hover:border-[#ea580c]"
              onClick={() =>
                trackAutomobileEvent('related_calculator_clicked', { calculator: tool.slug })
              }
            >
              {tool.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
