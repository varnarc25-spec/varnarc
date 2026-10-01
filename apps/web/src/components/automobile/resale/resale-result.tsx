'use client';

import Link from 'next/link';
import {
  formatInrCompact,
  formatInrExact,
  formatKm,
  formatVehicleAge,
  type ResaleValuationResult,
} from '@varnarc/validation';
import { trackAutomobileEvent } from '@/lib/automobile/analytics';
import { cityName, regionName } from './locations';
import { ConfidenceScore } from './confidence-score';
import { FutureValueForecast } from './future-value-forecast';
import { SimilarVehicleComparison } from './similar-vehicle-comparison';
import { ValuationRangeCard } from './valuation-range-card';
import { ValueAdjustmentBreakdown } from './value-adjustment-breakdown';
import { VehicleValueTimeline } from './vehicle-value-timeline';
import type { ResaleFormState } from './form';

const OWNER_LABEL: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4 or more',
};

type Props = {
  result: ResaleValuationResult;
  form: ResaleFormState;
  onReset: () => void;
  onCopy: () => void;
  copied: boolean;
};

export function ResaleResult({ result, form, onReset, onCopy, copied }: Props) {
  const location = form.citySlug
    ? `${cityName(form.stateSlug, form.citySlug)}, ${regionName(form.stateSlug)}`
    : regionName(form.stateSlug);
  const facts = [
    { label: 'Original new-car price', value: formatInrCompact(result.originalPrice) },
    { label: 'Estimated depreciation', value: formatInrCompact(result.depreciationAmount) },
    { label: 'Value retained', value: `${result.valueRetentionPercentage.toFixed(1)}%` },
    { label: 'Value lost', value: `${result.valueLostPercentage.toFixed(1)}%` },
    {
      label: 'Vehicle age',
      value: formatVehicleAge(result.vehicleAgeYears, result.ageApproximate),
    },
    { label: 'Kilometres driven', value: formatKm(result.kilometres) },
    { label: 'Number of owners', value: OWNER_LABEL[result.owners] ?? String(result.owners) },
    { label: 'Location', value: location },
  ];

  return (
    <div className="space-y-6" aria-live="polite">
      <ValuationRangeCard
        low={result.lowEstimate}
        high={result.highEstimate}
        market={result.marketValue}
      />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-lg border border-slate-200 px-3 py-3">
            <dt className="text-xs text-slate-500">{fact.label}</dt>
            <dd className="mt-1 text-sm font-bold text-[#0b1f3a]">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-slate-500">
        Exact market value {formatInrExact(result.marketValue)}
      </p>
      <ConfidenceScore
        score={result.confidenceScore}
        level={result.confidenceLevel}
        note={result.confidenceNote}
        suggestions={result.confidenceSuggestions}
      />
      {result.resaleValueScore != null ? (
        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">{form.modelName || 'This model'}</p>
          <h3 className="text-sm font-bold text-[#0b1f3a]">Resale value score</h3>
          <p className="mt-1 text-2xl font-extrabold text-[#0b1f3a]">
            {result.resaleValueScore.toFixed(1)} / 10
          </p>
          <p className="mt-1 text-xs text-slate-500">
            A model-level score from configured Varnarc data, separate from this car&apos;s
            condition.
          </p>
        </section>
      ) : null}
      <ValueAdjustmentBreakdown
        base={result.baseDepreciatedValue}
        lines={result.adjustmentLines}
        market={result.marketValue}
      />
      <FutureValueForecast
        today={result.futureValues.today}
        year1={result.futureValues.year1}
        year2={result.futureValues.year2}
        year3={result.futureValues.year3}
        year5={result.futureValues.year5}
        nextValue={result.next12Months.value}
        nextDepreciation={result.next12Months.depreciation}
        perMonth={result.next12Months.perMonth}
      />
      <VehicleValueTimeline points={result.timeline} />
      <SimilarVehicleComparison
        bodyType={form.bodyType}
        fuelLabel={form.fuel}
        price={result.originalPrice}
        manufacturerSlug={form.manufacturerSlug}
        manufacturerName={form.manufacturerName}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          href="#similar-cars"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b1f3a] px-4 text-sm font-semibold text-white"
        >
          Compare similar cars
        </a>
        {form.manufacturerSlug ? (
          <Link
            href={`/automobile/manufacturers/${form.manufacturerSlug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a]"
          >
            Explore this car
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a]"
        >
          Calculate another car
        </button>
        <Link
          href="/automobile/calculators/tco"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a]"
          onClick={() => trackAutomobileEvent('related_calculator_clicked', { calculator: 'tco' })}
        >
          Check ownership cost
        </Link>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a]"
        >
          {copied ? 'Link copied' : 'Copy result link'}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{result.assumptionsNote}</p>
      <p className="text-xs leading-relaxed text-slate-500">
        Estimates are indicative. A physical inspection can change the final sale price, especially
        after accident, flood or chassis damage.
      </p>
    </div>
  );
}
