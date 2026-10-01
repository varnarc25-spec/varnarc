'use client';

import dynamic from 'next/dynamic';
import { formatInrCompact, formatInrExact } from '@varnarc/validation';

const DepreciationChart = dynamic(
  () => import('./depreciation-chart').then((mod) => mod.DepreciationChart),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100" aria-hidden />,
  },
);

export function FutureValueForecast({
  today,
  year1,
  year2,
  year3,
  year5,
  nextValue,
  nextDepreciation,
  perMonth,
}: {
  today: number;
  year1: number;
  year2: number;
  year3: number;
  year5: number;
  nextValue: number;
  nextDepreciation: number;
  perMonth: number;
}) {
  const points = [
    { label: 'Today', value: today },
    { label: '1 year', value: year1 },
    { label: '2 years', value: year2 },
    { label: '3 years', value: year3 },
    { label: '5 years', value: year5 },
  ];
  return (
    <section aria-label="Estimated future value">
      <h3 className="text-base font-bold text-[#0b1f3a]">Estimated future value</h3>
      <p className="mt-1 text-sm text-slate-600">Illustrative depreciation forecast</p>
      <div className="mt-3">
        <DepreciationChart points={points} />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {points.map((point) => (
          <li key={point.label} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">{point.label}</p>
            <p className="text-sm font-bold text-[#0b1f3a]">{formatInrCompact(point.value)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Estimated value after 12 months" value={formatInrCompact(nextValue)} />
        <Stat
          label="Potential depreciation over next year"
          value={formatInrExact(nextDepreciation)}
        />
        <Stat
          label="Approximate depreciation per month"
          value={`${formatInrExact(perMonth)}/month`}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Actual future resale value depends on market conditions, kilometres driven and vehicle
        condition. This forecast continues the same fallback model and assumes typical additional
        driving.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#0b1f3a]">{value}</p>
    </div>
  );
}
