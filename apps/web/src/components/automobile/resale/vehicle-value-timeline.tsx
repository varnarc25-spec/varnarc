import { formatInrCompact } from '@varnarc/validation';

export function VehicleValueTimeline({
  points,
}: {
  points: Array<{ key: string; label: string; value: number }>;
}) {
  return (
    <section aria-label="Vehicle value timeline">
      <h3 className="text-base font-bold text-[#0b1f3a]">Vehicle value timeline</h3>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {points.map((point) => (
          <li key={point.key} className="rounded-lg border border-slate-200 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {point.label}
            </p>
            <p className="mt-1 text-sm font-bold text-[#0b1f3a]">{formatInrCompact(point.value)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
