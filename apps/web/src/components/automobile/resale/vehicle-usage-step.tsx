'use client';

import { FieldError, FieldHint, resaleInputClass, resaleLabelClass } from './fields';
import {
  ACCIDENT_OPTIONS,
  INSURANCE_OPTIONS,
  MONTH_OPTIONS,
  OWNER_OPTIONS,
  RC_OPTIONS,
  SERVICE_OPTIONS,
  registrationYears,
  type ResaleFormState,
} from './form';
import { citiesForRegion, indiaRegions } from './locations';
import { SearchableSelect } from './searchable-select';

type Props = {
  form: ResaleFormState;
  errors: Record<string, string>;
  onChange: (patch: Partial<ResaleFormState>) => void;
};

export function VehicleUsageStep({ form, errors, onChange }: Props) {
  const states = indiaRegions();
  const cities = form.stateSlug ? citiesForRegion(form.stateSlug) : [];
  const years = registrationYears();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="resale-km" className={resaleLabelClass}>
          Kilometres driven
        </label>
        <input
          id="resale-km"
          inputMode="numeric"
          className={resaleInputClass}
          value={form.kilometres}
          aria-invalid={errors.kilometres ? true : undefined}
          aria-describedby="resale-km-error"
          onChange={(event) => onChange({ kilometres: event.target.value })}
        />
        <FieldError id="resale-km-error" message={errors.kilometres} />
      </div>
      <div>
        <label htmlFor="resale-owners" className={resaleLabelClass}>
          Number of owners
        </label>
        <select
          id="resale-owners"
          className={resaleInputClass}
          value={form.owners}
          aria-invalid={errors.owners ? true : undefined}
          aria-describedby="resale-owners-error"
          onChange={(event) => onChange({ owners: event.target.value })}
        >
          {OWNER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id="resale-owners-error" message={errors.owners} />
      </div>
      <SearchableSelect
        label="State"
        value={form.stateSlug}
        options={states.map((state) => ({ value: state.slug, label: state.name }))}
        placeholder="Search state"
        error={errors.state}
        onChange={(stateSlug) => onChange({ stateSlug, citySlug: '' })}
      />
      <SearchableSelect
        label="City"
        value={form.citySlug}
        options={cities.map((city) => ({ value: city.slug, label: city.name }))}
        disabled={!form.stateSlug}
        placeholder={form.stateSlug ? 'Search city' : 'Select a state first'}
        error={errors.city}
        hint="City lists can grow. Choose Other if your city is not listed yet. Location adjustment stays neutral until a verified city factor exists."
        onChange={(citySlug) => onChange({ citySlug })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="resale-insurance" className={resaleLabelClass}>
            Insurance status
          </label>
          <select
            id="resale-insurance"
            className={resaleInputClass}
            value={form.insurance}
            onChange={(event) => onChange({ insurance: event.target.value })}
          >
            {INSURANCE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="resale-rc" className={resaleLabelClass}>
            Registration validity
          </label>
          <select
            id="resale-rc"
            className={resaleInputClass}
            value={form.rcStatus}
            onChange={(event) => onChange({ rcStatus: event.target.value })}
          >
            {RC_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className={resaleLabelClass}>Purchase month and year (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            aria-label="Purchase month"
            className={resaleInputClass}
            value={form.purchaseMonth}
            onChange={(event) => onChange({ purchaseMonth: event.target.value })}
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={`purchase-${option.label}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Purchase year"
            className={resaleInputClass}
            value={form.purchaseYear}
            onChange={(event) => onChange({ purchaseYear: event.target.value })}
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <FieldHint id="resale-purchase-hint">
          Used only when the registration month is blank and the purchase year matches the
          registration year.
        </FieldHint>
      </fieldset>
      <div>
        <label htmlFor="resale-service" className={resaleLabelClass}>
          Service history
        </label>
        <select
          id="resale-service"
          className={resaleInputClass}
          value={form.serviceHistory}
          onChange={(event) => onChange({ serviceHistory: event.target.value })}
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="resale-accident" className={resaleLabelClass}>
          Accident history
        </label>
        <select
          id="resale-accident"
          className={resaleInputClass}
          value={form.accidentHistory}
          onChange={(event) => onChange({ accidentHistory: event.target.value })}
        >
          {ACCIDENT_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
