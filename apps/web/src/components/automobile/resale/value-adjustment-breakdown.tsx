import { formatInrExact, formatSignedInr, type ResaleAdjustmentLine } from '@varnarc/validation';

export function ValueAdjustmentBreakdown({
  base,
  lines,
  market,
}: {
  base: number;
  lines: ResaleAdjustmentLine[];
  market: number;
}) {
  return (
    <section aria-label="What affected your car's value">
      <h3 className="text-base font-bold text-[#0b1f3a]">What affected your car&apos;s value?</h3>
      <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
        <li className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
          <span className="text-slate-700">Base depreciated value</span>
          <span className="font-semibold text-[#0b1f3a]">{formatInrExact(base)}</span>
        </li>
        {lines.map((line) => (
          <li key={line.key} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
            <span className="text-slate-700">{line.label}</span>
            <span
              className={
                line.amount > 0 ? 'font-semibold text-emerald-800' : 'font-semibold text-red-800'
              }
            >
              {formatSignedInr(line.amount)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-3 text-sm">
          <span className="font-semibold text-[#0b1f3a]">Estimated market value</span>
          <span className="font-extrabold text-[#0b1f3a]">{formatInrExact(market)}</span>
        </li>
      </ul>
    </section>
  );
}
