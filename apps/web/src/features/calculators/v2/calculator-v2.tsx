import type { ReactNode } from 'react';

export function CalculatorPageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-10">{children}</div>;
}

export function CalculatorInputCard({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <h2 className="text-lg font-bold text-[#0b1f3a] dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function CalculatorResultsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <h2 className="text-lg font-bold text-[#0b1f3a] dark:text-white">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function CalculatorResultMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8fafc] px-3 py-3 dark:bg-slate-800">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#0b1f3a] dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function CalculatorChartSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <h2 className="text-lg font-bold text-[#0b1f3a] dark:text-white">{title}</h2>
      <div className="mt-4 h-72 w-full">{children}</div>
    </section>
  );
}

export function CalculatorFAQ({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">
        Frequently asked questions
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
          >
            <summary className="cursor-pointer font-semibold text-[#0b1f3a] dark:text-white">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CalculatorRelatedTools({
  calculators,
  articles,
}: {
  calculators: Array<{ name: string; href: string }>;
  articles: Array<{ title: string; href: string }>;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">Related calculators</h2>
        {calculators.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {calculators.map((item) => (
              <li key={item.href}>
                <a
                  className="font-semibold text-[#0b1f3a] underline-offset-2 hover:underline dark:text-white"
                  href={item.href}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Electricity bill, panel size, installation cost, and payback are covered in this
            calculator. Separate tools for those questions are not published yet, so this page does
            not link to them.
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">Useful guides</h2>
        {articles.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {articles.map((item) => (
              <li key={item.href}>
                <a
                  className="font-semibold text-[#0b1f3a] underline-offset-2 hover:underline dark:text-white"
                  href={item.href}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Published solar guides from the Varnarc library will appear here when they are available
            for this calculator.
          </p>
        )}
      </div>
    </section>
  );
}

export function CalculatorSourceReferences({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">Methodology and sources</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a className="underline-offset-2 hover:underline" href={item.href} rel="noreferrer">
                {item.label}
              </a>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CalculatorDisclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      {children}
    </p>
  );
}
