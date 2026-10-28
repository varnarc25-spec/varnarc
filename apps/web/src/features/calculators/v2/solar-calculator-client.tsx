'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  calculateSolar,
  compareSystemSizes,
  SOLAR_ILLUSTRATIVE_DEFAULTS,
  suggestSystemKw,
  type SolarAssumptions,
  type SolarResult,
} from '@varnarc/validation';
import {
  CalculatorChartSection,
  CalculatorDisclaimer,
  CalculatorFAQ,
  CalculatorInputCard,
  CalculatorPageShell,
  CalculatorRelatedTools,
  CalculatorResultMetric,
  CalculatorResultsCard,
  CalculatorSourceReferences,
} from '@/features/calculators/v2/calculator-v2';
import { SolarCharts } from '@/features/calculators/v2/solar-charts';
import { SolarGuide } from '@/features/calculators/v2/solar-guide';

const PLACES = [
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune'] },
  { state: 'Delhi', cities: ['New Delhi'] },
  { state: 'Tamil Nadu', cities: ['Chennai'] },
  { state: 'Telangana', cities: ['Hyderabad'] },
  { state: 'Gujarat', cities: ['Ahmedabad'] },
  { state: 'Rajasthan', cities: ['Jaipur'] },
  { state: 'Other', cities: ['Other'] },
] as const;

export type SolarPublishedRef = {
  kind: string;
  state?: string | null;
  city?: string | null;
  title: string;
  payload: Record<string, number | string | boolean | null | undefined>;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
};

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-[var(--vn-subtle)]">
        {label}
        {hint ? (
          <span className="ml-1 cursor-help text-slate-400" title={hint}>
            (?)
          </span>
        ) : null}
      </span>
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

const inputClass =
  'min-h-11 w-full rounded-xl border border-[var(--vn-border)] bg-[var(--vn-surface)] px-3 text-base font-semibold text-[var(--vn-ink)]';

function assumptionsFromRefs(
  refs: SolarPublishedRef[],
  state: string,
  city: string,
  systemKw: number,
): Partial<SolarAssumptions> {
  const loc = refs.find(
    (r) => r.kind === 'LOCATION' && r.state === state && (r.city === city || !r.city),
  );
  const tariff = refs.find((r) => r.kind === 'TARIFF' && (r.state === state || !r.state));
  const price = refs.find((r) => {
    if (r.kind !== 'INSTALLATION_PRICE') return false;
    if (r.state && r.state !== state) return false;
    const min = Number(r.payload.minKw ?? 0);
    const max = Number(r.payload.maxKw ?? 999);
    return systemKw >= min && systemKw <= max;
  });
  const subsidy = refs.find((r) => {
    if (r.kind !== 'SUBSIDY') return false;
    if (r.state && r.state !== state) return false;
    const max = Number(r.payload.maxKw ?? 0);
    const min = Number(r.payload.minKw ?? 0);
    return systemKw >= min && systemKw <= max && Number(r.payload.amountPerKw ?? 0) > 0;
  });
  const defaults = refs.find((r) => r.kind === 'DEFAULTS');
  const partial: Partial<SolarAssumptions> = {};
  if (loc) {
    partial.annualYieldKwhPerKw = Number(loc.payload.annualYieldKwhPerKw);
    partial.usingPublishedLocation = true;
  }
  if (tariff) {
    partial.tariffPerKwh = Number(tariff.payload.energyChargePerKwh);
    partial.fixedMonthlyCharge = Number(tariff.payload.fixedMonthlyCharge ?? 0);
    partial.usingPublishedTariff = true;
  }
  if (price) {
    partial.costPerKw = Number(price.payload.costPerKw);
    partial.usingPublishedPrice = true;
  }
  if (defaults) {
    partial.degradationPercent = Number(defaults.payload.degradationPercent);
    partial.maintenancePerKw = Number(defaults.payload.maintenancePerKw);
    partial.selfConsumptionPercent = Number(defaults.payload.selfConsumptionPercent);
    partial.exportRatePerKwh = Number(defaults.payload.exportRatePerKwh);
    partial.tariffEscalationPercent = Number(defaults.payload.tariffEscalationPercent);
    partial.lifetimeYears = Number(defaults.payload.lifetimeYears);
    partial.inverterReplacementYear = Number(defaults.payload.inverterReplacementYear);
    partial.inverterReplacementShare = Number(defaults.payload.inverterReplacementShare);
    partial.rooftopSqftPerKw = Number(defaults.payload.rooftopSqftPerKw);
  }
  if (subsidy) {
    const cap = Number(subsidy.payload.maxBenefit ?? 0);
    const amount = Math.min(
      cap || Number.POSITIVE_INFINITY,
      systemKw * Number(subsidy.payload.amountPerKw),
    );
    partial.subsidyEligible = true;
    partial.subsidyAmount = amount;
    partial.usingPublishedSubsidy = true;
  }
  return partial;
}

const defaults = {
  state: 'Karnataka',
  city: 'Bengaluru',
  monthlyBill: '3000',
  systemKw: '3',
  monthlyKwh: '',
  tariffPerKwh: '',
  rooftopSqft: '',
  installationCost: '',
  selfConsumptionPercent: String(SOLAR_ILLUSTRATIVE_DEFAULTS.selfConsumptionPercent),
  exportRatePerKwh: String(SOLAR_ILLUSTRATIVE_DEFAULTS.exportRatePerKwh),
  yieldKwhPerKwYear: String(SOLAR_ILLUSTRATIVE_DEFAULTS.annualYieldKwhPerKw),
  degradationPercent: String(SOLAR_ILLUSTRATIVE_DEFAULTS.degradationPercent),
  annualMaintenance: '',
  tariffEscalationPercent: String(SOLAR_ILLUSTRATIVE_DEFAULTS.tariffEscalationPercent),
  financeEnabled: false,
  interestRatePercent: '10',
  tenureYears: '5',
  subsidyEligible: false,
  subsidyAmount: '0',
};

export function SolarCalculatorClient({
  published,
  faq,
  articles,
}: {
  published: SolarPublishedRef[];
  faq: Array<{ q: string; a: string }>;
  articles: Array<{ title: string; href: string }>;
}) {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SolarResult | null>(null);
  const [status, setStatus] = useState('');

  const cities = PLACES.find((p) => p.state === form.state)?.cities ?? ['Other'];

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const base = useMemo(
    () => assumptionsFromRefs(published, form.state, form.city, Number(form.systemKw) || 1),
    [published, form.state, form.city, form.systemKw],
  );

  function suggest() {
    const tariff =
      Number(form.tariffPerKwh) || base.tariffPerKwh || SOLAR_ILLUSTRATIVE_DEFAULTS.tariffPerKwh;
    const bill = Number(form.monthlyBill) || 0;
    const kwh = Number(form.monthlyKwh) || (tariff > 0 ? bill / tariff : 0);
    const yieldKwh =
      Number(form.yieldKwhPerKwYear) ||
      base.annualYieldKwhPerKw ||
      SOLAR_ILLUSTRATIVE_DEFAULTS.annualYieldKwhPerKw;
    set('systemKw', String(suggestSystemKw(kwh * 12, yieldKwh)));
  }

  function run() {
    const next: Record<string, string> = {};
    const bill = Number(form.monthlyBill);
    const systemKw = Number(form.systemKw);
    if (!form.state) next.state = 'Select a state.';
    if (!form.city) next.city = 'Select a city.';
    if (!Number.isFinite(bill) || bill < 0)
      next.monthlyBill = 'Enter a monthly bill of zero or more.';
    if (!Number.isFinite(systemKw) || systemKw <= 0)
      next.systemKw = 'Enter a system size above 0 kW.';
    setErrors(next);
    if (Object.keys(next).length) {
      setResult(null);
      return;
    }
    const optional = (value: string) => (value.trim() === '' ? undefined : Number(value));
    const calculated = calculateSolar(
      {
        state: form.state,
        city: form.city,
        monthlyBill: bill,
        systemKw,
        monthlyKwh: mode === 'advanced' ? optional(form.monthlyKwh) : undefined,
        tariffPerKwh: mode === 'advanced' ? optional(form.tariffPerKwh) : undefined,
        rooftopSqft: mode === 'advanced' ? optional(form.rooftopSqft) : undefined,
        installationCost: mode === 'advanced' ? optional(form.installationCost) : undefined,
        selfConsumptionPercent:
          mode === 'advanced' ? optional(form.selfConsumptionPercent) : undefined,
        exportRatePerKwh: mode === 'advanced' ? optional(form.exportRatePerKwh) : undefined,
        yieldKwhPerKwYear: mode === 'advanced' ? optional(form.yieldKwhPerKwYear) : undefined,
        degradationPercent: mode === 'advanced' ? optional(form.degradationPercent) : undefined,
        annualMaintenance: mode === 'advanced' ? optional(form.annualMaintenance) : undefined,
        tariffEscalationPercent:
          mode === 'advanced' ? optional(form.tariffEscalationPercent) : undefined,
        financeEnabled: mode === 'advanced' ? form.financeEnabled : false,
        interestRatePercent: optional(form.interestRatePercent),
        tenureYears: form.tenureYears ? Number(form.tenureYears) : undefined,
        subsidyEligible:
          mode === 'advanced'
            ? form.subsidyEligible || Boolean(base.subsidyEligible)
            : Boolean(base.subsidyEligible),
        subsidyAmount:
          mode === 'advanced' && form.subsidyAmount
            ? Number(form.subsidyAmount)
            : base.subsidyAmount,
      },
      base,
    );
    setResult(calculated);
    setStatus('Estimate updated. Figures use the assumptions listed below.');
  }

  function reset() {
    setForm(defaults);
    setResult(null);
    setErrors({});
    setStatus('Calculator reset to demonstration values.');
  }

  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set('solarState', form.state);
    url.searchParams.set('solarCity', form.city);
    url.searchParams.set('bill', form.monthlyBill);
    url.searchParams.set('kw', form.systemKw);
    await navigator.clipboard.writeText(url.toString());
    setStatus('Share link copied. It contains only the location, bill, and system size.');
  }

  async function downloadPdf() {
    if (!result) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const lines = [
      'Varnarc — Solar Savings Calculator',
      `Location: ${form.city}, ${form.state}`,
      `Monthly bill: ${form.monthlyBill}`,
      `System: ${form.systemKw} kW`,
      `Monthly net operating savings: ${inr.format(result.monthlySavings)}`,
      `Annual gross electricity savings: ${inr.format(result.annualGrossSavings)}`,
      `Net installation cost: ${inr.format(result.netInstallationCost)}`,
      `Subsidy applied: ${inr.format(result.subsidyApplied)}`,
      `Payback: ${result.paybackLabel}`,
      `25-year net benefit: ${inr.format(result.lifetimeNetBenefit)}`,
      `Annual generation: ${num.format(result.annualGenerationKwh)} kWh`,
      `Calculated: ${new Date().toISOString().slice(0, 10)}`,
      'Exported units are not valued at the retail tariff.',
      'Illustrative defaults are not government tariffs or subsidies.',
    ];
    lines.forEach((line, index) => doc.text(line, 14, 20 + index * 8));
    doc.save('varnarc-solar-savings.pdf');
  }

  const comparison = result
    ? compareSystemSizes(
        {
          state: form.state,
          city: form.city,
          monthlyBill: Number(form.monthlyBill),
          systemKw: Number(form.systemKw),
          subsidyEligible: Boolean(base.subsidyEligible),
          subsidyAmount: base.subsidyAmount,
        },
        base,
      )
    : [];

  return (
    <CalculatorPageShell>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorInputCard
          title="Your solar details"
          actions={
            <>
              <button
                type="button"
                className="min-h-12 w-full rounded-xl bg-[var(--vn-orange-soft)] text-sm font-semibold text-[var(--vn-ink)] hover:bg-[var(--vn-orange)] hover:text-white"
                onClick={run}
              >
                Calculate savings
              </button>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-[var(--vn-subtle)]">
                <button type="button" className="min-h-11" onClick={reset}>
                  Reset
                </button>
                <button type="button" className="min-h-11" onClick={() => void share()}>
                  Copy link
                </button>
                <button type="button" className="min-h-11" onClick={() => window.print()}>
                  Print
                </button>
                <button
                  type="button"
                  className="min-h-11 disabled:opacity-40"
                  onClick={() => void downloadPdf()}
                  disabled={!result}
                >
                  PDF
                </button>
              </div>
            </>
          }
        >
          <div className="flex gap-2" role="tablist" aria-label="Calculator mode">
            {(['quick', 'advanced'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${mode === item ? 'bg-[#fff7ed] text-[#9a3412]' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setMode(item)}
              >
                {item === 'quick' ? 'Quick' : 'Advanced'}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="State" error={errors.state}>
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => {
                  const state = e.target.value;
                  const city = PLACES.find((p) => p.state === state)?.cities[0] ?? 'Other';
                  setForm((prev) => ({ ...prev, state, city }));
                }}
              >
                {PLACES.map((p) => (
                  <option key={p.state}>{p.state}</option>
                ))}
              </select>
            </Field>
            <Field label="City" error={errors.city}>
              <select
                className={inputClass}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Monthly electricity bill (₹)"
              error={errors.monthlyBill}
              hint="Demonstration value, not your DISCOM bill."
            >
              <input
                className={inputClass}
                inputMode="decimal"
                value={form.monthlyBill}
                onChange={(e) => set('monthlyBill', e.target.value)}
              />
            </Field>
            <Field
              label="Solar system size (kW)"
              error={errors.systemKw}
              hint="Suggested from the bill. You can edit it."
            >
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={form.systemKw}
                  onChange={(e) => set('systemKw', e.target.value)}
                />
                <button
                  type="button"
                  className="min-h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold"
                  onClick={suggest}
                >
                  Suggest
                </button>
              </div>
            </Field>
          </div>
          {mode === 'advanced' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Monthly consumption (kWh)">
                <input
                  className={inputClass}
                  value={form.monthlyKwh}
                  onChange={(e) => set('monthlyKwh', e.target.value)}
                />
              </Field>
              <Field
                label="Electricity tariff (₹/kWh)"
                hint="Leave blank to use the published or illustrative rate."
              >
                <input
                  className={inputClass}
                  value={form.tariffPerKwh}
                  onChange={(e) => set('tariffPerKwh', e.target.value)}
                />
              </Field>
              <Field label="Rooftop area (sq ft)">
                <input
                  className={inputClass}
                  value={form.rooftopSqft}
                  onChange={(e) => set('rooftopSqft', e.target.value)}
                />
              </Field>
              <Field label="Installation cost (₹)">
                <input
                  className={inputClass}
                  value={form.installationCost}
                  onChange={(e) => set('installationCost', e.target.value)}
                />
              </Field>
              <Field
                label={`Self-consumption (${form.selfConsumptionPercent}%)`}
                hint="Share of solar generation used in the home."
              >
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={100}
                  value={form.selfConsumptionPercent}
                  onChange={(e) => set('selfConsumptionPercent', e.target.value)}
                />
              </Field>
              <Field label="Export compensation (₹/kWh)" hint="Not the retail tariff.">
                <input
                  className={inputClass}
                  value={form.exportRatePerKwh}
                  onChange={(e) => set('exportRatePerKwh', e.target.value)}
                />
              </Field>
              <Field label="Expected generation (kWh/kW/year)">
                <input
                  className={inputClass}
                  value={form.yieldKwhPerKwYear}
                  onChange={(e) => set('yieldKwhPerKwYear', e.target.value)}
                />
              </Field>
              <Field label="Annual degradation (%)">
                <input
                  className={inputClass}
                  value={form.degradationPercent}
                  onChange={(e) => set('degradationPercent', e.target.value)}
                />
              </Field>
              <Field label="Annual maintenance (₹)">
                <input
                  className={inputClass}
                  value={form.annualMaintenance}
                  onChange={(e) => set('annualMaintenance', e.target.value)}
                />
              </Field>
              <Field label="Tariff escalation (%/year)">
                <input
                  className={inputClass}
                  value={form.tariffEscalationPercent}
                  onChange={(e) => set('tariffEscalationPercent', e.target.value)}
                />
              </Field>
              <Field
                label="Eligible subsidy (₹)"
                hint="Applied only when eligibility is turned on."
              >
                <input
                  className={inputClass}
                  value={form.subsidyAmount}
                  onChange={(e) => set('subsidyAmount', e.target.value)}
                />
              </Field>
              <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.subsidyEligible}
                  onChange={(e) => set('subsidyEligible', e.target.checked)}
                />
                Treat subsidy as eligible
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm font-medium sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.financeEnabled}
                  onChange={(e) => set('financeEnabled', e.target.checked)}
                />
                Include financing
              </label>
              {form.financeEnabled ? (
                <>
                  <Field label="Interest rate (%/year)">
                    <input
                      className={inputClass}
                      value={form.interestRatePercent}
                      onChange={(e) => set('interestRatePercent', e.target.value)}
                    />
                  </Field>
                  <Field label="Tenure (years)">
                    <input
                      className={inputClass}
                      value={form.tenureYears}
                      onChange={(e) => set('tenureYears', e.target.value)}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-slate-500">
              Quick mode assumes {SOLAR_ILLUSTRATIVE_DEFAULTS.selfConsumptionPercent}% of generation
              is used at home and exported units earn ₹
              {SOLAR_ILLUSTRATIVE_DEFAULTS.exportRatePerKwh}/kWh. Change these in Advanced.
            </p>
          )}
          {status ? (
            <p className="text-sm text-slate-600" role="status">
              {status}
            </p>
          ) : null}
        </CalculatorInputCard>
        <CalculatorResultsCard title="Estimated savings">
          {result ? (
            <>
              <div className="border-b border-[var(--vn-border)] pb-3">
                <p className="text-xs font-medium text-[var(--vn-subtle)]">
                  Estimated monthly savings
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-[#16a34a]">
                  {inr.format(result.monthlySavings)}
                </p>
                <p className="mt-1 text-xs text-[var(--vn-subtle)]">
                  Illustrative, after maintenance
                </p>
              </div>
              <CalculatorResultMetric
                label="Estimated annual savings"
                value={inr.format(result.annualNetOperatingSavings)}
                hint="After maintenance"
              />
              <CalculatorResultMetric
                label="Net installation cost"
                value={inr.format(result.netInstallationCost)}
                hint={
                  result.subsidyApplied
                    ? `Subsidy ${inr.format(result.subsidyApplied)}`
                    : 'No subsidy applied'
                }
              />
              <CalculatorResultMetric label="Estimated payback" value={result.paybackLabel} />
              <CalculatorResultMetric
                label="25-year net benefit"
                value={inr.format(result.lifetimeNetBenefit)}
                hint="After costs. Not gross generation value."
              />
              <CalculatorResultMetric
                label="Annual solar generation"
                value={`${num.format(result.annualGenerationKwh)} kWh`}
              />
            </>
          ) : (
            <p className="text-sm text-slate-600 sm:col-span-2">
              Calculate to see savings, cost, payback, and generation for the demonstration inputs.
            </p>
          )}
        </CalculatorResultsCard>
      </div>
      {result ? (
        <>
          <CalculatorChartSection title="Savings over time">
            <SolarCharts result={result} chart="cumulative" />
          </CalculatorChartSection>
          <div className="grid gap-4 lg:grid-cols-3">
            <CalculatorChartSection title="Electricity bill">
              <SolarCharts result={result} chart="bill" />
            </CalculatorChartSection>
            <CalculatorChartSection title="Generation and use">
              <SolarCharts result={result} chart="energy" />
            </CalculatorChartSection>
            <CalculatorChartSection title="Costs">
              <SolarCharts result={result} chart="cost" />
            </CalculatorChartSection>
          </div>
          <section className="overflow-x-auto">
            <h2 className="text-xl font-bold text-[var(--vn-ink)]">Solar system size comparison</h2>
            <table className="mt-3 min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Capacity</th>
                  <th className="py-2 pr-3">Roof area</th>
                  <th className="py-2 pr-3">Installation cost</th>
                  <th className="py-2 pr-3">Annual generation</th>
                  <th className="py-2 pr-3">Annual savings</th>
                  <th className="py-2 pr-3">Subsidy</th>
                  <th className="py-2 pr-3">Payback</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.systemKw} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{row.systemKw} kW</td>
                    <td className="py-2 pr-3">{num.format(row.rooftopSqft)} sq ft</td>
                    <td className="py-2 pr-3">{inr.format(row.installationCost)}</td>
                    <td className="py-2 pr-3">{num.format(row.annualGenerationKwh)} kWh</td>
                    <td className="py-2 pr-3">{inr.format(row.annualSavings)}</td>
                    <td className="py-2 pr-3">{inr.format(row.subsidy)}</td>
                    <td className="py-2 pr-3">{row.paybackLabel}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="min-h-11 font-semibold text-[#9a3412]"
                        onClick={() => {
                          set('systemKw', String(row.systemKw));
                          setResult(
                            calculateSolar(
                              {
                                state: form.state,
                                city: form.city,
                                monthlyBill: Number(form.monthlyBill),
                                systemKw: row.systemKw,
                                subsidyEligible: Boolean(base.subsidyEligible),
                                subsidyAmount: base.subsidyAmount,
                              },
                              base,
                            ),
                          );
                        }}
                      >
                        Use this system size
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {result.assumptions.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
      ) : null}
      <SolarGuide />
      <CalculatorFAQ items={faq} />
      <CalculatorRelatedTools calculators={[]} articles={articles} />
      <CalculatorSourceReferences
        items={[
          { label: 'Ministry of New and Renewable Energy', href: 'https://mnre.gov.in/' },
          {
            label:
              'PM Surya Ghar: Muft Bijli Yojana (check the current notification before using any subsidy figure)',
            href: 'https://pmsuryaghar.gov.in/',
          },
          {
            label:
              'Varnarc illustrative defaults are unpublished planning assumptions until an administrator publishes a sourced record.',
          },
        ]}
      />
      <CalculatorDisclaimer>
        This calculator is a planning aid. Roof orientation, shading, seasonal generation, local
        tariff orders, net-metering rules, maintenance, panel degradation, and installation quality
        change the outcome. A 25-year gross electricity figure is not profit. No official price or
        subsidy is shown unless a published record says so.
      </CalculatorDisclaimer>
    </CalculatorPageShell>
  );
}
