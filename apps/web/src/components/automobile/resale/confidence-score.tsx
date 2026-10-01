import type { ResaleConfidenceLevel } from '@varnarc/validation';

const LABELS: Record<ResaleConfidenceLevel, string> = {
  HIGH: 'High confidence',
  MEDIUM: 'Medium confidence',
  LIMITED: 'Limited confidence',
};

export function ConfidenceScore({
  score,
  level,
  note,
  suggestions,
}: {
  score: number;
  level: ResaleConfidenceLevel;
  note: string;
  suggestions: string[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4" aria-label="Valuation confidence">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0b1f3a]">Valuation confidence</h3>
          <p className="mt-1 text-sm text-slate-600">{LABELS[level]}</p>
        </div>
        <p className="text-3xl font-extrabold text-[#0b1f3a]">{score}%</p>
      </div>
      <p className="mt-3 text-sm text-slate-600">{note}</p>
      {suggestions.length ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-[#0b1f3a]">To improve confidence</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
