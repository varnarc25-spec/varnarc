'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car } from 'lucide-react';

export type VehicleDetailFact = { label: string; value: string };

export type VehicleDetailGroup = {
  title: string;
  rows: VehicleDetailFact[];
};

export type VehicleDetailExperienceProps = {
  name: string;
  images: Array<{ src: string; alt: string }>;
  manufacturer: { name: string; slug: string } | null;
  featured: boolean;
  sponsored: boolean;
  chips: string[];
  priceLabel: string | null;
  priceNote: string | null;
  onRoadLabel: string | null;
  emiLabel: string | null;
  ukLabel: string | null;
  ukNote: string | null;
  highlights: VehicleDetailFact[];
  specGroups: VehicleDetailGroup[];
  safetyRows: VehicleDetailFact[];
  features: VehicleDetailFact[];
  colors: Array<{ name: string; hex: string | null }>;
  cities: Array<{ name: string; href: string }>;
  brochure: { name: string; url: string } | null;
  compareHref: string;
  emiHref: string;
  onRoadHref: string;
  maintenanceHref: string;
  rating: { value: number; count: number } | null;
};

const TABS = ['Highlights', 'Specifications', 'Safety', 'Features'] as const;
type Tab = (typeof TABS)[number];

export function VehicleDetailExperience(props: VehicleDetailExperienceProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const availableTabs = TABS.filter((tab) => tabHasContent(tab, props));
  const [tab, setTab] = useState<Tab>(availableTabs[0] ?? 'Highlights');
  const active = availableTabs.includes(tab) ? tab : availableTabs[0];
  const image = props.images[imageIndex] ?? props.images[0];

  return (
    <div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              className="aspect-[16/10] w-full bg-slate-100 object-contain"
            />
          ) : (
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 text-slate-400">
              <Car className="h-16 w-16" aria-hidden />
              <span className="text-sm">No photos for this variant yet</span>
            </div>
          )}
          {props.images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white p-3">
              {props.images.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                    index === imageIndex ? 'border-[#ea580c]' : 'border-slate-200'
                  }`}
                  aria-label={`Photo ${index + 1}`}
                >
                  <img src={item.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside
          id="price"
          className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:scroll-mt-40"
        >
          <div className="flex flex-wrap items-center gap-2">
            {props.manufacturer ? (
              <Link
                href={`/automobile/manufacturers/${props.manufacturer.slug}`}
                className="text-sm font-semibold text-[#ea580c] hover:underline"
              >
                {props.manufacturer.name}
              </Link>
            ) : null}
            {props.featured ? (
              <span className="rounded-full bg-[#0b1f3a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Featured
              </span>
            ) : null}
            {props.sponsored ? (
              <span className="rounded-full bg-[#ea580c] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sponsored
              </span>
            ) : null}
            {props.rating ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {props.rating.value.toFixed(1)} / 5 · {props.rating.count}{' '}
                {props.rating.count === 1 ? 'review' : 'reviews'}
              </span>
            ) : null}
          </div>
          {props.chips.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {props.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {props.priceLabel ? 'Ex-showroom' : 'Availability'}
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#0b1f3a]">
            {props.priceLabel ?? props.priceNote}
          </p>
          {props.priceLabel && props.priceNote ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">{props.priceNote}</p>
          ) : null}
          {props.onRoadLabel ? (
            <p className="mt-3 text-sm text-slate-700">
              Est. on-road <span className="font-semibold text-[#0b1f3a]">{props.onRoadLabel}</span>
            </p>
          ) : null}
          {props.emiLabel ? (
            <p className="mt-1 text-sm text-slate-700">
              Indicative EMI{' '}
              <Link href={props.emiHref} className="font-semibold text-[#0b1f3a] underline">
                {props.emiLabel}
              </Link>
              <span className="mt-1 block text-xs text-slate-500">
                20% down, 8.5% for 5 years. A planning figure, not a loan offer.
              </span>
            </p>
          ) : null}
          {props.ukLabel ? (
            <p className="mt-3 text-sm text-slate-700">
              UK price <span className="font-semibold text-[#0b1f3a]">{props.ukLabel}</span>
              {props.ukNote ? (
                <span className="mt-1 block text-xs leading-5 text-slate-500">{props.ukNote}</span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              href={props.onRoadHref}
              className="rounded-lg bg-[#0b1f3a] px-3 py-2 text-center text-sm font-semibold text-white"
            >
              On-road price
            </Link>
            <Link
              href={props.emiHref}
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#0b1f3a]"
            >
              EMI calculator
            </Link>
            <Link
              href={props.compareHref}
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#0b1f3a]"
            >
              Compare
            </Link>
            <Link
              href={props.maintenanceHref}
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#0b1f3a]"
            >
              Maintenance
            </Link>
          </div>
        </aside>
      </div>

      {props.highlights.length ? (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {props.highlights.slice(0, 6).map((fact) => (
            <div key={fact.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {fact.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#0b1f3a]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <nav
        className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 py-3"
        aria-label="On this page"
      >
        {[
          ['Price', '#price'],
          ...(availableTabs.length ? [['Specifications', '#specifications']] : []),
          ...(props.colors.length ? [['Colours', '#colors']] : []),
          ...(props.cities.length ? [['Cities', '#cities']] : []),
          ['Reviews', '#reviews'],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-[#0b1f3a] hover:border-[#ea580c]"
          >
            {label}
          </a>
        ))}
      </nav>

      {availableTabs.length ? (
        <section id="specifications" className="mt-8 scroll-mt-28 lg:scroll-mt-40">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[#0b1f3a]">Specifications & features</h2>
            {props.brochure ? (
              <a
                href={props.brochure.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#ea580c] underline"
              >
                {props.brochure.name}
              </a>
            ) : null}
          </div>
          {availableTabs.length > 1 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist">
              {availableTabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active === item}
                  onClick={() => setTab(item)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                    active === item
                      ? 'bg-[#0b1f3a] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-4" role="tabpanel">
            {active === 'Highlights' ? <FactTable rows={props.highlights} /> : null}
            {active === 'Specifications' ? (
              <div className="space-y-6">
                {props.specGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-semibold text-[#0b1f3a]">{group.title}</h3>
                    <FactTable rows={group.rows} />
                  </div>
                ))}
              </div>
            ) : null}
            {active === 'Safety' ? <FactTable rows={props.safetyRows} /> : null}
            {active === 'Features' ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {props.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-[#0b1f3a]">{feature.label}</span>
                    <span className="shrink-0 text-slate-600">{feature.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {props.colors.length ? (
        <section id="colors" className="mt-10 scroll-mt-28 lg:scroll-mt-40">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">Colours</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {props.colors.map((color) => (
              <li
                key={`${color.name}-${color.hex ?? ''}`}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <span
                  className="block h-14 rounded-lg border border-slate-200"
                  style={{ backgroundColor: color.hex || '#e2e8f0' }}
                  aria-hidden
                />
                <span className="mt-2 block text-sm font-medium text-[#0b1f3a]">{color.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {props.cities.length ? (
        <section id="cities" className="mt-10 scroll-mt-28 lg:scroll-mt-40">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">On-road price by city</h2>
          <p className="mt-1 text-sm text-slate-600">
            Open a city for the planning estimate. These are not dealer quotations.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {props.cities.map((city) => (
              <li key={city.href}>
                <Link
                  href={city.href}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0b1f3a] hover:border-[#ea580c]"
                >
                  {city.name}
                  <span className="text-xs font-medium text-[#ea580c]">View</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function tabHasContent(tab: Tab, props: VehicleDetailExperienceProps) {
  if (tab === 'Highlights') return props.highlights.length > 0;
  if (tab === 'Specifications') return props.specGroups.length > 0;
  if (tab === 'Safety') return props.safetyRows.length > 0;
  return props.features.length > 0;
}

function FactTable({ rows }: { rows: VehicleDetailFact[] }) {
  if (!rows.length) return null;
  return (
    <dl className="overflow-hidden rounded-xl border border-slate-200">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className={`grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4 ${
            index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
          }`}
        >
          <dt className="text-sm text-slate-500">{row.label}</dt>
          <dd className="text-sm font-medium text-[#0b1f3a]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
