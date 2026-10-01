import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AutomobileSeo } from '@/components/automobile/automobile-seo';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RelatedCalculators } from '@/components/automobile/resale/related-calculators';
import { ResaleCalculator } from '@/components/automobile/resale/resale-calculator';
import { RESALE_FAQS, ResaleValueGuide } from '@/components/automobile/resale/resale-guide';
import { buildAutomobilePageMetadata } from '@/lib/automobile/seo';

const TITLE = 'Car Resale Value Calculator India 2026 | Used Car Value – Varnarc';
const DESCRIPTION =
  "Calculate your car's estimated resale value in India based on make, model, age, kilometres, ownership, condition and location. Check depreciation and future value instantly.";
const PATH = '/automobile/calculators/resale-value';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const meta = await buildAutomobilePageMetadata('calc-resale-value', { searchParams: sp });
  return {
    ...meta,
    title: { absolute: TITLE },
    description: DESCRIPTION,
    openGraph: {
      ...meta.openGraph,
      title: TITLE,
      description: DESCRIPTION,
    },
    twitter: {
      ...meta.twitter,
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

function HeroMark() {
  return (
    <svg
      viewBox="0 0 280 160"
      className="h-36 w-full max-w-xs"
      role="img"
      aria-label="Car value illustration"
    >
      <rect x="8" y="18" width="264" height="124" rx="16" fill="#f8fafc" stroke="#e2e8f0" />
      <path
        d="M48 104h168c8 0 14-8 16-18l10-22c2-6-2-12-8-12h-36l-18-22H92l-16 22H52c-8 0-14 8-14 16v20c0 8 4 16 10 16z"
        fill="#0b1f3a"
      />
      <circle cx="92" cy="108" r="12" fill="#fff" stroke="#0b1f3a" strokeWidth="4" />
      <circle cx="176" cy="108" r="12" fill="#fff" stroke="#0b1f3a" strokeWidth="4" />
      <text x="24" y="48" fill="#0b1f3a" fontSize="13" fontFamily="ui-sans-serif, system-ui">
        Estimated range
      </text>
    </svg>
  );
}

export default async function CarResaleValuePage({ searchParams }: Props) {
  const sp = await searchParams;
  void sp;
  return (
    <>
      <AutomobileSeo
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Automobile', path: '/automobile' },
          { name: 'Calculators', path: '/automobile/calculators' },
          { name: 'Car Resale Value Calculator', path: PATH },
        ]}
        webApplication={{
          name: 'Car Resale Value Calculator India',
          description: DESCRIPTION,
          path: PATH,
          applicationCategory: 'UtilitiesApplication',
        }}
        faqs={RESALE_FAQS}
      />
      <main className="w-full overflow-x-hidden bg-white">
        <div className="site-container py-6 sm:py-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Automobile', href: '/automobile' },
                { label: 'Calculators', href: '/automobile/calculators' },
                { label: 'Car Resale Value Calculator' },
              ]}
            />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#0b1f3a] sm:text-3xl lg:text-4xl">
                  Car Resale Value Calculator India
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Estimate your car&apos;s current resale value based on make, model, variant, age,
                  kilometres driven, ownership, location and condition.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <li>✓ Vehicle-specific valuation</li>
                  <li>✓ India-focused pricing</li>
                  <li>✓ Condition adjustments</li>
                  <li>✓ Future depreciation estimate</li>
                </ul>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="#calculator"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ea580c] px-4 text-sm font-semibold text-white"
                  >
                    Calculate Car Value
                  </a>
                  <a
                    href="#how-valuation-works"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#0b1f3a] underline-offset-2 hover:underline"
                  >
                    How valuation works
                  </a>
                </div>
              </div>
              <div className="hidden lg:block">
                <HeroMark />
              </div>
            </div>
            <div className="mt-8">
              <Suspense fallback={<p className="text-sm text-slate-500">Loading calculator…</p>}>
                <ResaleCalculator />
              </Suspense>
            </div>
            <RelatedCalculators />
            <ResaleValueGuide />
          </div>
        </div>
      </main>
    </>
  );
}
