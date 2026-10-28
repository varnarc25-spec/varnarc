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
    <section className="rounded-2xl border border-[var(--vn-border)] bg-[var(--vn-surface)] p-5 shadow-sm">
      <h2 className="text-base font-bold text-[var(--vn-ink)]">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
      {actions ? <div className="mt-5 flex flex-col gap-2">{actions}</div> : null}
    </section>
  );
}

export function CalculatorResultsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--vn-border)] bg-[var(--vn-surface)] p-5 shadow-sm">
      <h2 className="text-base font-bold text-[var(--vn-ink)]">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
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
    <div className="border-b border-[var(--vn-border)] pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-medium text-[var(--vn-subtle)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--vn-ink)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--vn-subtle)]">{hint}</p> : null}
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
    <section className="rounded-2xl border border-[var(--vn-border)] bg-[var(--vn-surface)] p-5 shadow-sm">
      <h2 className="text-base font-bold text-[var(--vn-ink)]">{title}</h2>
      <div className="mt-4 h-72 w-full">{children}</div>
    </section>
  );
}

export function CalculatorFAQ({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[var(--vn-ink)]">Frequently asked questions</h2>
      <div className="mt-4 divide-y divide-[var(--vn-border)] rounded-2xl border border-[var(--vn-border)] bg-[var(--vn-surface)]">
        {items.map((item) => (
          <details key={item.q} className="px-4 py-3">
            <summary className="cursor-pointer font-semibold text-[var(--vn-ink)]">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[var(--vn-subtle)]">{item.a}</p>
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
        <h2 className="text-xl font-bold text-[var(--vn-ink)]">Related calculators</h2>
        {calculators.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {calculators.map((item) => (
              <li key={item.href}>
                <a
                  className="font-semibold text-[var(--vn-ink)] underline-offset-2 hover:underline"
                  href={item.href}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--vn-subtle)]">
            Electricity bill, panel size, installation cost, and payback are covered in this
            calculator. Separate tools for those questions are not published yet, so this page does
            not link to them.
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--vn-ink)]">Useful guides</h2>
        {articles.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {articles.map((item) => (
              <li key={item.href}>
                <a
                  className="font-semibold text-[var(--vn-ink)] underline-offset-2 hover:underline"
                  href={item.href}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--vn-subtle)]">
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
      <h2 className="text-xl font-bold text-[var(--vn-ink)]">Methodology and sources</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--vn-subtle)]">
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
    <p className="rounded-xl border border-[var(--vn-border)] bg-[var(--vn-orange-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--vn-ink)]">
      {children}
    </p>
  );
}
