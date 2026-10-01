'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  calculateResaleValue,
  DEFAULT_RESALE_SETTINGS,
  mergeResaleConfigRows,
  normalizeResaleFuel,
  normalizeResaleTransmission,
  parseInrAmount,
  parseResaleShare,
  serializeResaleShare,
  type ResaleConfigRow,
  type ResaleValuationResult,
  type ResaleValuationSettings,
} from '@varnarc/validation';
import { trackAutomobileEvent } from '@/lib/automobile/analytics';
import { apiClientFetch } from '@/services/api-client';
import {
  emptyResaleForm,
  toValuationInput,
  validateResaleStep,
  type ResaleFormState,
} from './form';
import { ResaleResult } from './resale-result';
import { VehicleConditionStep } from './vehicle-condition-step';
import { VehicleSelectionStep } from './vehicle-selection-step';
import { VehicleUsageStep } from './vehicle-usage-step';

const STEPS = [
  { id: 'vehicle', label: 'Select vehicle', short: 'Vehicle' },
  { id: 'usage', label: 'Vehicle usage', short: 'Usage' },
  { id: 'condition', label: 'Condition', short: 'Condition' },
  { id: 'valuation', label: 'Valuation', short: 'Value' },
];

type Brand = { id: string; name: string; slug: string };
type ModelRow = {
  id: string;
  name: string;
  slug: string;
  bodyType?: string | null;
  vehicleSegment?: string | null;
  discontinuedYear?: number | null;
};
type VariantRow = {
  id: string;
  name: string;
  slug: string;
  fuelType?: string | null;
  transmissionType?: string | null;
  exShowroomPrice?: unknown;
  modelYear?: number | null;
};
type VariantDetail = VariantRow & {
  drivetrain?: string | null;
  discontinuedDate?: string | null;
  model?: {
    bodyType?: string | null;
    discontinuedYear?: number | null;
  } | null;
  engine?: {
    engineName?: string | null;
    displacementCc?: unknown;
    maxPowerBhp?: unknown;
  } | null;
};

function textAmount(value: unknown, suffix: string): string | null {
  const amount = parseInrAmount(value) ?? (typeof value === 'number' ? value : Number(value));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `${amount}${suffix}`;
}

function specLines(
  detail: VariantDetail,
  price: number | null,
): Array<{ label: string; value: string }> {
  const lines: Array<{ label: string; value: string }> = [];
  if (price) lines.push({ label: 'Ex-showroom', value: `₹${price.toLocaleString('en-IN')}` });
  if (detail.modelYear) lines.push({ label: 'Model year', value: String(detail.modelYear) });
  if (detail.fuelType) lines.push({ label: 'Fuel type', value: detail.fuelType });
  if (detail.transmissionType)
    lines.push({ label: 'Transmission', value: detail.transmissionType });
  if (detail.model?.bodyType) lines.push({ label: 'Body type', value: detail.model.bodyType });
  if (detail.engine?.engineName) lines.push({ label: 'Engine', value: detail.engine.engineName });
  const cc = textAmount(detail.engine?.displacementCc, ' cc');
  if (cc) lines.push({ label: 'Displacement', value: cc });
  const power = textAmount(detail.engine?.maxPowerBhp, ' bhp');
  if (power) lines.push({ label: 'Power', value: power });
  if (detail.drivetrain) lines.push({ label: 'Drivetrain', value: detail.drivetrain });
  return lines;
}

export function ResaleCalculator() {
  const search = useSearchParams();
  const share = useMemo(() => parseResaleShare(search), [search]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ResaleFormState>(emptyResaleForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ResaleValuationSettings>(DEFAULT_RESALE_SETTINGS);
  const [result, setResult] = useState<ResaleValuationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);
  const autoRan = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    trackAutomobileEvent('resale_calculator_started');
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiClientFetch<ResaleConfigRow[]>('/automobile/resale-valuation/config')
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data)) setSettings(mergeResaleConfigRows(data));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function loadBrands() {
    setBrandsLoading(true);
    setBrandsError(null);
    apiClientFetch<Brand[]>('/cars/brands')
      .then(({ data }) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrandsError('We could not load manufacturers. Try again in a moment.'))
      .finally(() => setBrandsLoading(false));
  }

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (!form.manufacturerId) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setModelsLoading(true);
    setModelsError(null);
    apiClientFetch<ModelRow[]>(`/cars/models?brandId=${encodeURIComponent(form.manufacturerId)}`)
      .then(({ data }) => {
        if (!cancelled) setModels(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setModelsError('We could not load models for this manufacturer.');
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.manufacturerId]);

  useEffect(() => {
    if (!form.modelId) {
      setVariants([]);
      return;
    }
    let cancelled = false;
    setVariantsLoading(true);
    apiClientFetch<VariantRow[]>(
      `/cars?modelId=${encodeURIComponent(form.modelId)}&limit=100&sort=name`,
    )
      .then(({ data }) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setVariants(rows);
        setForm((prev) => ({ ...prev, variantsAvailable: rows.length > 0 }));
      })
      .catch(() => {
        if (!cancelled)
          setModelsError('We could not load variants. You can still enter an approximate price.');
      })
      .finally(() => {
        if (!cancelled) setVariantsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.modelId]);

  useEffect(() => {
    if (!form.variantId) {
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    apiClientFetch<VariantDetail>(`/cars/${form.variantId}`)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const price = parseInrAmount(data.exShowroomPrice);
        const fuel = normalizeResaleFuel(data.fuelType);
        const transmission = normalizeResaleTransmission(data.transmissionType);
        const year = new Date().getFullYear();
        const discontinued = Boolean(
          data.discontinuedDate ||
          (data.model?.discontinuedYear && data.model.discontinuedYear <= year),
        );
        setForm((prev) => ({
          ...prev,
          variantSlug: data.slug ?? prev.variantSlug,
          variantName: data.name ?? prev.variantName,
          catalogPrice: price,
          manualPrice: price ? '' : prev.manualPrice,
          fuel: fuel === 'unknown' ? prev.fuel : fuel,
          transmission: transmission === 'unknown' ? prev.transmission : transmission,
          bodyType: data.model?.bodyType || prev.bodyType,
          discontinued,
          specLines: specLines(data, price),
        }));
        trackAutomobileEvent('resale_vehicle_selected', {
          manufacturer: form.manufacturerSlug,
          model: form.modelSlug,
          variant: data.slug,
          fuel_type: fuel,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCalcError('We could not load this variant. Enter an approximate new price to continue.');
        setForm((prev) => ({ ...prev, catalogPrice: null }));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.variantId, form.manufacturerSlug, form.modelSlug]);

  useEffect(() => {
    if (!share.make || form.manufacturerId || brands.length === 0) return;
    const brand = brands.find((item) => item.slug === share.make);
    if (!brand) return;
    setForm((prev) => ({
      ...prev,
      manufacturerId: brand.id,
      manufacturerSlug: brand.slug,
      manufacturerName: brand.name,
      registrationYear: share.year ?? prev.registrationYear,
      registrationMonth: share.month ?? prev.registrationMonth,
      kilometres: share.km ?? prev.kilometres,
      owners: share.owners ?? prev.owners,
      stateSlug: share.state ?? prev.stateSlug,
      citySlug: share.city ?? prev.citySlug,
      fuel: share.fuel ?? prev.fuel,
      transmission: share.transmission ?? prev.transmission,
      insurance: share.insurance ?? prev.insurance,
      serviceHistory: share.service ?? prev.serviceHistory,
      accidentHistory: share.accident ?? prev.accidentHistory,
      rcStatus: share.rc ?? prev.rcStatus,
      overall: share.condition ?? prev.overall,
      manualPrice: share.price ?? prev.manualPrice,
      originalPaint: share.paint === '1',
      recentTyres: share.recentTyres === '1',
      floodDamage: share.flood === '1',
      chassisDamage: share.chassis === '1',
      majorAccident: share.majorAccident === '1',
      fullServiceHistory: share.fullService === '1',
      batteryHealth: share.battery ?? prev.batteryHealth,
      batteryWarranty: share.batteryWarranty ?? prev.batteryWarranty,
      batteryReplaced: share.batteryReplaced ?? prev.batteryReplaced,
    }));
  }, [brands, form.manufacturerId, share]);

  useEffect(() => {
    if (!share.model || !form.manufacturerId || form.modelId || models.length === 0) return;
    const model = models.find((item) => item.slug === share.model);
    if (!model) return;
    setForm((prev) => ({
      ...prev,
      modelId: model.id,
      modelSlug: model.slug,
      modelName: model.name,
      bodyType: model.bodyType ?? '',
      category: model.vehicleSegment ?? '',
      discontinued: Boolean(
        model.discontinuedYear && model.discontinuedYear <= new Date().getFullYear(),
      ),
    }));
  }, [models, form.manufacturerId, form.modelId, share.model]);

  useEffect(() => {
    if (!share.variant || !form.modelId || form.variantId || variants.length === 0) return;
    const variant = variants.find((item) => item.slug === share.variant);
    if (!variant) return;
    setForm((prev) => ({
      ...prev,
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.name,
    }));
  }, [variants, form.modelId, form.variantId, share.variant]);

  function update(patch: Partial<ResaleFormState>) {
    setResult(null);
    setCalcError(null);
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.modelId && patch.modelId !== prev.modelId) {
        const model = models.find((item) => item.id === patch.modelId);
        if (model) {
          next.modelSlug = model.slug;
          next.modelName = model.name;
          next.bodyType = model.bodyType ?? '';
          next.category = model.vehicleSegment ?? '';
          next.discontinued = Boolean(
            model.discontinuedYear && model.discontinuedYear <= new Date().getFullYear(),
          );
        }
      }
      return next;
    });
  }

  function shareQuery() {
    return serializeResaleShare({
      make: form.manufacturerSlug,
      model: form.modelSlug,
      variant: form.variantSlug,
      year: form.registrationYear,
      month: form.registrationMonth,
      km: form.kilometres,
      owners: form.owners,
      state: form.stateSlug,
      city: form.citySlug,
      fuel: form.fuel,
      transmission: form.transmission,
      condition: form.overall,
      insurance: form.insurance,
      service: form.serviceHistory,
      accident: form.accidentHistory,
      rc: form.rcStatus,
      price: form.catalogPrice == null ? form.manualPrice : '',
      paint: form.originalPaint ? '1' : '',
      recentTyres: form.recentTyres ? '1' : '',
      flood: form.floodDamage ? '1' : '',
      chassis: form.chassisDamage ? '1' : '',
      majorAccident: form.majorAccident ? '1' : '',
      fullService: form.fullServiceHistory ? '1' : '',
      battery: form.batteryHealth,
      batteryWarranty: form.batteryWarranty,
      batteryReplaced: form.batteryReplaced,
    });
  }

  function calculate(current = form) {
    const stepErrors = {
      ...validateResaleStep(current, 0),
      ...validateResaleStep(current, 1),
      ...validateResaleStep(current, 2),
    };
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setCalcError('Some details are missing. Check the highlighted fields.');
      if (
        stepErrors.manufacturer ||
        stepErrors.model ||
        stepErrors.variant ||
        stepErrors.registrationYear
      ) {
        setStep(0);
      } else if (stepErrors.kilometres || stepErrors.state || stepErrors.city) setStep(1);
      else setStep(2);
      return;
    }
    try {
      const next = calculateResaleValue(toValuationInput(current), settings);
      setResult(next);
      setErrors({});
      setCalcError(null);
      setStep(3);
      const qs = serializeResaleShare({
        make: current.manufacturerSlug,
        model: current.modelSlug,
        variant: current.variantSlug,
        year: current.registrationYear,
        month: current.registrationMonth,
        km: current.kilometres,
        owners: current.owners,
        state: current.stateSlug,
        city: current.citySlug,
        fuel: current.fuel,
        transmission: current.transmission,
        condition: current.overall,
        insurance: current.insurance,
        service: current.serviceHistory,
        accident: current.accidentHistory,
        rc: current.rcStatus,
        price: current.catalogPrice == null ? current.manualPrice : '',
        paint: current.originalPaint ? '1' : '',
        recentTyres: current.recentTyres ? '1' : '',
        flood: current.floodDamage ? '1' : '',
        chassis: current.chassisDamage ? '1' : '',
        majorAccident: current.majorAccident ? '1' : '',
        fullService: current.fullServiceHistory ? '1' : '',
        battery: current.batteryHealth,
        batteryWarranty: current.batteryWarranty,
        batteryReplaced: current.batteryReplaced,
      });
      window.history.replaceState(null, '', `${window.location.pathname}${qs}`);
      trackAutomobileEvent('resale_calculator_completed', {
        manufacturer: current.manufacturerSlug,
        model: current.modelSlug,
        variant: current.variantSlug,
        registration_year: current.registrationYear,
        fuel_type: current.fuel,
        city: current.citySlug,
        confidence_level: next.confidenceLevel,
      });
      trackAutomobileEvent('resale_result_viewed', {
        manufacturer: current.manufacturerSlug,
        model: current.modelSlug,
        confidence_level: next.confidenceLevel,
      });
    } catch (error) {
      setCalcError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to calculate a value from these details.',
      );
    }
  }

  useEffect(() => {
    if (autoRan.current || !share.year || !share.km) return;
    if (!form.manufacturerId || !form.modelId || !form.registrationYear || !form.kilometres) return;
    if (form.variantsAvailable && !form.variantId) return;
    if (variantsLoading) return;
    if (form.catalogPrice == null && !form.manualPrice) return;
    autoRan.current = true;
    calculate(form);
  }, [
    form.manufacturerId,
    form.modelId,
    form.variantId,
    form.catalogPrice,
    form.manualPrice,
    form.variantsAvailable,
    variantsLoading,
    share.year,
    share.km,
  ]);

  function next() {
    const stepErrors = validateResaleStep(form, step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;
    if (step === 2) calculate();
    else setStep((value) => Math.min(3, value + 1));
  }

  async function copyLink() {
    const qs = shareQuery();
    const url = `${window.location.origin}${window.location.pathname}${qs}`;
    window.history.replaceState(null, '', `${window.location.pathname}${qs}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCalcError('Copy the address from the browser bar to share this result.');
    }
  }

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
    slug: brand.slug,
  }));
  const modelOptions = models.map((model) => ({
    value: model.id,
    label: model.name,
    slug: model.slug,
  }));
  const variantOptions = variants.map((variant) => ({
    value: variant.id,
    label: variant.name,
    slug: variant.slug,
  }));

  return (
    <section id="calculator" className="scroll-mt-24 mx-auto w-full max-w-[960px]">
      <ol className="mb-4 grid grid-cols-4 gap-2" aria-label="Valuation steps">
        {STEPS.map((item, index) => {
          const current = index === step;
          const done = index < step;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center justify-center rounded-lg px-1 text-center text-xs font-semibold sm:text-sm ${
                  current
                    ? 'bg-[#0b1f3a] text-white'
                    : done
                      ? 'bg-slate-200 text-[#0b1f3a]'
                      : 'bg-slate-100 text-slate-500'
                }`}
                aria-current={current ? 'step' : undefined}
                onClick={() => {
                  if (index < step) setStep(index);
                }}
              >
                <span className="sm:hidden">
                  {index + 1}. {item.short}
                </span>
                <span className="hidden sm:inline">
                  {index + 1}. {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {step === 0 ? (
          <VehicleSelectionStep
            form={form}
            errors={errors}
            brands={brandOptions}
            models={modelOptions}
            variants={variantOptions}
            brandsLoading={brandsLoading}
            modelsLoading={modelsLoading}
            variantsLoading={variantsLoading}
            detailLoading={detailLoading}
            brandsError={brandsError}
            onRetryBrands={loadBrands}
            onChange={update}
          />
        ) : null}
        {step === 1 ? <VehicleUsageStep form={form} errors={errors} onChange={update} /> : null}
        {step === 2 ? <VehicleConditionStep form={form} errors={errors} onChange={update} /> : null}
        {modelsError && step === 0 ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {modelsError}
          </p>
        ) : null}
        {calcError ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {calcError}
          </p>
        ) : null}
        {step < 3 ? (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a]"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea580c] px-4 text-sm font-semibold text-white hover:bg-[#c2410c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:opacity-60 sm:w-auto"
              disabled={
                step === 0 && (brandsLoading || modelsLoading || variantsLoading || detailLoading)
              }
              onClick={next}
            >
              {step === 2 ? 'Calculate car value' : 'Continue'}
            </button>
          </div>
        ) : result ? (
          <ResaleResult
            result={result}
            form={form}
            copied={copied}
            onCopy={() => void copyLink()}
            onReset={() => {
              setForm(emptyResaleForm());
              setResult(null);
              setStep(0);
              setErrors({});
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
