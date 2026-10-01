import { formatInrCompact, formatInrExact } from '@varnarc/validation';

export function ValuationRangeCard({
  low,
  high,
  market,
}: {
  low: number;
  high: number;
  market: number;
}) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-[#0b1f3a] p-5 text-white sm:p-6"
      aria-label="Estimated market range"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
        Your car&apos;s estimated value
      </p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {formatInrCompact(low)} – {formatInrCompact(high)}
      </p>
      <p className="mt-4 text-sm text-slate-200">Expected market value</p>
      <p className="text-2xl font-bold">{formatInrCompact(market)}</p>
      <p className="mt-1 text-xs text-slate-300">{formatInrExact(market)}</p>
    </section>
  );
}
