'use client';

import { FieldError, FieldHint, resaleInputClass, resaleLabelClass } from './fields';
import {
  FUEL_OPTIONS,
  MONTH_OPTIONS,
  TRANSMISSION_OPTIONS,
  registrationYears,
  type ResaleFormState,
} from './form';
import { SearchableSelect, type SelectOption } from './searchable-select';

type Props = {
  form: ResaleFormState;
  errors: Record<string, string>;
  brands: SelectOption[];
  models: SelectOption[];
  variants: SelectOption[];
  brandsLoading: boolean;
  modelsLoading: boolean;
  variantsLoading: boolean;
  detailLoading: boolean;
  brandsError: string | null;
  onRetryBrands: () => void;
  onChange: (patch: Partial<ResaleFormState>) => void;
};

export function VehicleSelectionStep({
  form,
  errors,
  brands,
  models,
  variants,
  brandsLoading,
  modelsLoading,
  variantsLoading,
  detailLoading,
  brandsError,
  onRetryBrands,
  onChange,
}: Props) {
  const years = registrationYears();
  return (
    <div className="space-y-4">
      {brandsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p>{brandsError}</p>
          <button
            type="button"
            onClick={onRetryBrands}
            className="mt-2 min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      ) : null}
      {!brandsLoading && !brandsError && brands.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          No manufacturers are published yet. Check back after the catalogue is updated.
        </p>
      ) : null}
      <SearchableSelect
        label="Manufacturer"
        value={form.manufacturerId}
        options={brands}
        loading={brandsLoading}
        placeholder="Search manufacturer"
        error={errors.manufacturer}
        onChange={(manufacturerId) => {
          const brand = brands.find((item) => item.value === manufacturerId);
          onChange({
            manufacturerId,
            manufacturerName: brand?.label ?? '',
            manufacturerSlug: brand?.slug ?? '',
            modelId: '',
            modelSlug: '',
            modelName: '',
            variantId: '',
            variantSlug: '',
            variantName: '',
            catalogPrice: null,
            specLines: [],
            discontinued: false,
            variantsAvailable: false,
          });
        }}
      />
      <SearchableSelect
        label="Model"
        value={form.modelId}
        options={models}
        loading={modelsLoading}
        disabled={!form.manufacturerId}
        placeholder={form.manufacturerId ? 'Search model' : 'Select a manufacturer first'}
        emptyLabel={form.manufacturerId ? 'No models found' : 'Select a manufacturer first'}
        error={errors.model}
        onChange={(modelId) => {
          const model = models.find((item) => item.value === modelId);
          onChange({
            modelId,
            modelSlug: model?.slug ?? '',
            modelName: model?.label ?? '',
            variantId: '',
            variantSlug: '',
            variantName: '',
            catalogPrice: null,
            specLines: [],
            variantsAvailable: false,
          });
        }}
      />
      <SearchableSelect
        label="Variant"
        value={form.variantId}
        options={variants}
        loading={variantsLoading}
        disabled={!form.modelId}
        placeholder={
          !form.modelId
            ? 'Select a model first'
            : variants.length
              ? 'Search variant'
              : 'No published variants'
        }
        emptyLabel={variantsLoading ? 'Loading variants…' : 'No published variants for this model'}
        error={errors.variant}
        hint={
          form.modelId && !variantsLoading && variants.length === 0
            ? 'This model has no published variants. Enter an approximate new price below.'
            : undefined
        }
        onChange={(variantId) => onChange({ variantId })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="resale-year" className={resaleLabelClass}>
            Registration year
          </label>
          <select
            id="resale-year"
            className={resaleInputClass}
            value={form.registrationYear}
            aria-invalid={errors.registrationYear ? true : undefined}
            aria-describedby="resale-year-hint resale-year-error"
            onChange={(event) => onChange({ registrationYear: event.target.value })}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <FieldHint id="resale-year-hint">
            If you leave the month blank, age is counted from 1 July of that year. If 1 July is
            still ahead, 1 January is used.
          </FieldHint>
          <FieldError id="resale-year-error" message={errors.registrationYear} />
        </div>
        <div>
          <label htmlFor="resale-month" className={resaleLabelClass}>
            Registration month
          </label>
          <select
            id="resale-month"
            className={resaleInputClass}
            value={form.registrationMonth}
            aria-invalid={errors.registrationMonth ? true : undefined}
            aria-describedby="resale-month-error"
            onChange={(event) => onChange({ registrationMonth: event.target.value })}
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value || 'unknown'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="resale-month-error" message={errors.registrationMonth} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="resale-fuel" className={resaleLabelClass}>
            Fuel type
          </label>
          <select
            id="resale-fuel"
            className={resaleInputClass}
            value={form.fuel}
            aria-invalid={errors.fuel ? true : undefined}
            aria-describedby="resale-fuel-hint resale-fuel-error"
            onChange={(event) => onChange({ fuel: event.target.value })}
          >
            <option value="">Select fuel</option>
            {FUEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldHint id="resale-fuel-hint">
            Filled from the variant when the catalogue has it. Change it if your car differs.
          </FieldHint>
          <FieldError id="resale-fuel-error" message={errors.fuel} />
        </div>
        <div>
          <label htmlFor="resale-transmission" className={resaleLabelClass}>
            Transmission
          </label>
          <select
            id="resale-transmission"
            className={resaleInputClass}
            value={form.transmission}
            aria-invalid={errors.transmission ? true : undefined}
            aria-describedby="resale-transmission-error"
            onChange={(event) => onChange({ transmission: event.target.value })}
          >
            <option value="">Select transmission</option>
            {TRANSMISSION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="resale-transmission-error" message={errors.transmission} />
        </div>
      </div>
      {form.catalogPrice != null ? (
        <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700">
          Ex-showroom price from the Varnarc catalogue:{' '}
          <span className="font-semibold text-[#0b1f3a]">
            ₹{form.catalogPrice.toLocaleString('en-IN')}
          </span>
          . This is a catalogue figure, not a live market quote.
        </p>
      ) : form.modelId &&
        !variantsLoading &&
        !detailLoading &&
        (form.variantId || !form.variantsAvailable) ? (
        <div>
          <label htmlFor="resale-price" className={resaleLabelClass}>
            Original purchase price / approximate new price
          </label>
          <input
            id="resale-price"
            inputMode="numeric"
            className={resaleInputClass}
            value={form.manualPrice}
            aria-invalid={errors.manualPrice ? true : undefined}
            aria-describedby="resale-price-hint resale-price-error"
            onChange={(event) => onChange({ manualPrice: event.target.value })}
          />
          <FieldHint id="resale-price-hint">
            Varnarc does not have an ex-showroom price for this variant. The estimate needs an
            approximate price when the car was new.
          </FieldHint>
          <FieldError id="resale-price-error" message={errors.manualPrice} />
        </div>
      ) : null}
      {form.specLines.length ? (
        <dl className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          {form.specLines.map((line) => (
            <div key={line.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {line.label}
              </dt>
              <dd className="text-sm font-medium text-[#0b1f3a]">{line.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {form.discontinued ? (
        <p className="text-sm text-slate-600">
          This model is marked discontinued in the catalogue. The estimate includes a modest
          discontinued-model adjustment.
        </p>
      ) : null}
    </div>
  );
}
