import Link from 'next/link';
import { ConstructionFAQ } from '@/components/construction/construction-faq';
import { cn, cx } from '@/components/construction/styles';
import type { PriceObservation } from '@/lib/construction/prices-hub/api';
import {
  buildCementNationalSnapshot,
  type CementGrade,
  type CementWebQuote,
} from '@varnarc/validation';

function money(n: number | null, currency = 'INR') {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDay(iso: string) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function quoteAmount(quote: CementWebQuote) {
  if (quote.price != null) return money(quote.price);
  if (quote.minPrice != null && quote.maxPrice != null) {
    return `${money(quote.minPrice)} – ${money(quote.maxPrice)}`;
  }
  return '—';
}

const GRADE_ORDER: CementGrade[] = ['OPC 53', 'OPC 43', 'OPC 33', 'PPC', 'market', 'White'];

export function CementNationalView({
  observations,
  indexableCitySlugs,
}: {
  observations: PriceObservation[];
  indexableCitySlugs: ReadonlySet<string>;
}) {
  const snapshot = buildCementNationalSnapshot();
  const pricedManufacturers = snapshot.manufacturers.filter((row) => row.quotes.length > 0);
  const unpricedManufacturers = snapshot.manufacturers.filter((row) => row.quotes.length === 0);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-700">
          Cement bag rates in India move with brand, grade and city. The figures below are the
          published lists retrieved on {formatDay(snapshot.retrievedAt)} from Dream Civil (national
          brand rates and city bands) and HomeRun (Bengaluru shelf prices, listing dated 8 May
          2026). Manufacturer websites are linked for company details. They are not a single
          all-India MRP.
        </p>
        <p className="text-xs text-slate-500">{snapshot.qualification}</p>
      </section>

      <section className={cn(cx.card, 'grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5')}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            India city-band average
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0b1f3a]">
            {money(snapshot.citySummary.average)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Midpoint of {snapshot.cities.length} city bands, per 50 kg bag
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            India city range
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-800">
            {money(snapshot.citySummary.low)} – {money(snapshot.citySummary.high)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Lowest city low to highest city high</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            OPC 53 brand average
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-800">
            {money(snapshot.opc53.average)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {snapshot.opc53.count} national listings, {money(snapshot.opc53.low)} –{' '}
            {money(snapshot.opc53.high)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Lists retrieved
          </p>
          <p className="mt-1 text-lg font-bold text-slate-800">{formatDay(snapshot.retrievedAt)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {snapshot.sources.length} websites · {snapshot.manufacturers.length} manufacturers
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/construction/cement-calculator" className={cx.primaryBtn}>
          Cement calculator
        </Link>
        <Link href="/construction/compare/opc-vs-ppc" className={cx.secondaryBtn}>
          OPC vs PPC
        </Link>
        <Link href="/construction/prices" className={cx.secondaryBtn}>
          All material prices
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0b1f3a]">Average price range by city</h2>
        <p className="text-sm text-slate-600">
          City bands are for a 50 kg bag. The midpoint is the middle of the published low and high,
          not a surveyed average of every dealer in that city.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">City</th>
                <th className="py-2 pr-3 font-semibold">Range / 50 kg</th>
                <th className="py-2 pr-3 font-semibold">Midpoint</th>
                <th className="py-2 pr-3 font-semibold">Source</th>
                <th className="py-2 font-semibold">City page</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.cities.map((city) => (
                <tr key={city.citySlug} className="border-b border-slate-100">
                  <td className="py-2.5 pr-3 font-medium text-[#0b1f3a]">{city.cityName}</td>
                  <td className="py-2.5 pr-3 tabular-nums">
                    {money(city.minPrice)} – {money(city.maxPrice)}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{money(Math.round(city.midpoint))}</td>
                  <td className="py-2.5 pr-3">
                    <a
                      href={city.sourceUrl}
                      className={cx.link}
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                    >
                      {city.sourceName}
                    </a>
                  </td>
                  <td className="py-2.5">
                    {city.hubPath && indexableCitySlugs.has(city.citySlug) ? (
                      <Link href={city.hubPath} className={cx.link}>
                        {city.cityName} prices
                      </Link>
                    ) : city.hubPath ? (
                      <Link
                        href={`/construction/prices?material=cement&location=${city.citySlug}`}
                        className={cx.link}
                      >
                        Hub filter
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0b1f3a]">Cement manufacturers</h2>
        <p className="text-sm text-slate-600">
          {pricedManufacturers.length} of {snapshot.manufacturers.length} listed manufacturers have
          a bag rate on the cited websites. OPC 53 is the headline grade. Other grades stay in the
          website tables below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">Manufacturer</th>
                <th className="py-2 pr-3 font-semibold">Group</th>
                <th className="py-2 pr-3 font-semibold">Coverage</th>
                <th className="py-2 pr-3 font-semibold">OPC 53 / 50 kg</th>
                <th className="py-2 font-semibold">Website</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.manufacturers.map((row) => (
                <tr key={row.slug} className="border-b border-slate-100 align-top">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-[#0b1f3a]">{row.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{row.products}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-700">{row.group}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{row.coverage}</td>
                  <td className="py-2.5 pr-3 tabular-nums">
                    {row.opc53.count
                      ? `${money(row.opc53.low)}${row.opc53.low !== row.opc53.high ? ` – ${money(row.opc53.high)}` : ''}`
                      : '—'}
                    {row.opc53.count > 1 ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {row.opc53.count} listings, avg {money(row.opc53.average)}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5">
                    {row.website ? (
                      <a
                        href={row.website}
                        className={cx.link}
                        rel="nofollow noopener noreferrer"
                        target="_blank"
                      >
                        Official site
                      </a>
                    ) : (
                      <span className="text-slate-400">No public site listed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {unpricedManufacturers.length ? (
          <p className="text-xs text-slate-500">
            No bag rate was published for {unpricedManufacturers.map((row) => row.name).join(', ')}{' '}
            on the two price websites retrieved for this page.
          </p>
        ) : null}
      </section>

      {snapshot.sources.map((source) => {
        const grades = GRADE_ORDER.filter((grade) =>
          source.quotes.some((quote) => quote.grade === grade),
        );
        return (
          <section key={source.id} className="space-y-3">
            <h2 className="text-lg font-bold text-[#0b1f3a]">Prices on {source.name}</h2>
            <p className="text-sm text-slate-600">
              {source.note} Published label: {source.publishedLabel}. Grey 50 kg span on this site:{' '}
              {money(source.greyBag.low)} – {money(source.greyBag.high)}
              {source.greyBag.average != null
                ? ` (midpoint average ${money(source.greyBag.average)})`
                : ''}
              .
            </p>
            <p className="text-sm">
              <a
                href={source.url}
                className={cx.link}
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                Open {source.name}
              </a>
            </p>
            {grades.map((grade) => {
              const rows = source.quotes.filter((quote) => quote.grade === grade);
              return (
                <div key={grade} className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#0b1f3a]">
                    {grade === 'market' ? 'City bands' : grade}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="py-2 pr-3 font-semibold">Brand / product</th>
                          <th className="py-2 pr-3 font-semibold">Place</th>
                          <th className="py-2 pr-3 font-semibold">Rate</th>
                          <th className="py-2 font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((quote) => (
                          <tr key={quote.id} className="border-b border-slate-100 align-top">
                            <td className="py-2.5 pr-3">
                              <p className="font-medium text-[#0b1f3a]">{quote.brandLabel}</p>
                              {quote.note ? (
                                <p className="mt-0.5 text-xs text-slate-500">{quote.note}</p>
                              ) : null}
                            </td>
                            <td className="py-2.5 pr-3 text-slate-700">
                              {quote.cityName ?? 'India (city not stated)'}
                            </td>
                            <td className="py-2.5 pr-3 tabular-nums">{quoteAmount(quote)}</td>
                            <td className="py-2.5 text-slate-700">{quote.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#0b1f3a]">Other grades on the national list</h2>
        <p className="text-sm text-slate-700">
          Dream Civil’s OPC 43 list averages {money(snapshot.opc43.average)} per 50 kg bag (
          {money(snapshot.opc43.low)} – {money(snapshot.opc43.high)}). The OPC 33 list averages{' '}
          {money(snapshot.opc33.average)} ({money(snapshot.opc33.low)} –{' '}
          {money(snapshot.opc33.high)}
          ). Two OPC 33 rows are labelled 43 grade on that source; they are kept in the OPC 33 table
          with a note. White cement is excluded from the grey-bag averages. Across every grey 50 kg
          figure on both websites, the span is {money(snapshot.greyBagSpan.low)} –{' '}
          {money(snapshot.greyBagSpan.high)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0b1f3a]">Varnarc price observations</h2>
        {observations.length ? (
          <ul className="space-y-3">
            {observations.map((obs) => (
              <li key={obs.id} className={cn(cx.card, 'p-4')}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-[#0b1f3a]">
                    {obs.material?.name ?? 'Cement'}
                    {obs.location ? ` · ${obs.location.name}` : ''}
                    {obs.brand ? ` · ${obs.brand.name}` : ''}
                  </p>
                  <p className="text-lg font-bold tabular-nums text-[#0b1f3a]">
                    {money(obs.price, obs.currency)}
                    <span className="text-sm font-normal text-slate-500"> / {obs.unit}</span>
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {obs.freshnessLabel}
                  {obs.source ? ` · ${obs.source}` : ''}
                  {obs.isOlderData ? ' · older data, not a current rate' : ''}
                </p>
                {obs.material?.hubKey && obs.location?.slug ? (
                  <Link
                    href={`/construction/prices/${obs.material.hubKey}/${obs.location.slug}`}
                    className={cn(cx.link, 'mt-2 inline-block')}
                  >
                    {obs.location.name} history
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            No Varnarc-verified cement observation is published for the hub cities yet. The tables
            above are the third-party lists. City history pages appear when enough local
            observations exist.
          </p>
        )}
      </section>

      <ConstructionFAQ
        faqs={snapshot.faqs.map((faq, index) => ({
          id: `cement-price-faq-${index}`,
          question: faq.question,
          answer: faq.answer,
        }))}
        columns={1}
      />
    </div>
  );
}
