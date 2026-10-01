'use client';

import { FieldError, resaleInputClass, resaleLabelClass } from './fields';
import { DETAIL_OPTIONS, OVERALL_OPTIONS, type ResaleFormState } from './form';

type Props = {
  form: ResaleFormState;
  errors: Record<string, string>;
  onChange: (patch: Partial<ResaleFormState>) => void;
};

const DETAILS: Array<{ key: keyof ResaleFormState; label: string }> = [
  { key: 'exterior', label: 'Exterior' },
  { key: 'interior', label: 'Interior' },
  { key: 'tyres', label: 'Tyres' },
  { key: 'engineCondition', label: 'Engine / mechanical condition' },
  { key: 'gearbox', label: 'Transmission' },
  { key: 'electrical', label: 'Electrical systems' },
  { key: 'ac', label: 'AC condition' },
];

const TOGGLES: Array<{ key: keyof ResaleFormState; label: string }> = [
  { key: 'fullServiceHistory', label: 'Full service history' },
  { key: 'originalPaint', label: 'Original paint' },
  { key: 'recentTyres', label: 'Recently replaced tyres' },
  { key: 'validInsurance', label: 'Valid insurance' },
  { key: 'majorAccident', label: 'Major accident history' },
  { key: 'floodDamage', label: 'Flood damage' },
  { key: 'chassisDamage', label: 'Chassis damage' },
];

export function VehicleConditionStep({ form, errors, onChange }: Props) {
  const electric = form.fuel === 'electric';
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="resale-overall" className={resaleLabelClass}>
          Overall condition
        </label>
        <select
          id="resale-overall"
          className={resaleInputClass}
          value={form.overall}
          aria-invalid={errors.overall ? true : undefined}
          aria-describedby="resale-overall-error"
          onChange={(event) => onChange({ overall: event.target.value })}
        >
          <option value="">Select condition</option>
          {OVERALL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id="resale-overall-error" message={errors.overall} />
      </div>
      <fieldset>
        <legend className="text-sm font-semibold text-[#0b1f3a]">
          Detailed ratings (optional)
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {DETAILS.map((detail) => (
            <div key={detail.key}>
              <label htmlFor={`resale-${detail.key}`} className={resaleLabelClass}>
                {detail.label}
              </label>
              <select
                id={`resale-${detail.key}`}
                className={resaleInputClass}
                value={String(form[detail.key] ?? '')}
                onChange={(event) => onChange({ [detail.key]: event.target.value })}
              >
                {DETAIL_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold text-[#0b1f3a]">
          Additional notes (optional)
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex min-h-11 items-center gap-2 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#ea580c]"
                checked={Boolean(form[toggle.key])}
                onChange={(event) => onChange({ [toggle.key]: event.target.checked })}
              />
              {toggle.label}
            </label>
          ))}
        </div>
      </fieldset>
      {electric ? (
        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-sm font-semibold text-[#0b1f3a]">Battery (optional)</legend>
          <p className="text-xs text-slate-500">
            Battery health is not required. If you know it, it can refine an electric-car estimate.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="resale-battery" className={resaleLabelClass}>
                Battery health if known (%)
              </label>
              <input
                id="resale-battery"
                inputMode="numeric"
                className={resaleInputClass}
                value={form.batteryHealth}
                aria-invalid={errors.batteryHealth ? true : undefined}
                aria-describedby="resale-battery-error"
                onChange={(event) => onChange({ batteryHealth: event.target.value })}
              />
              <FieldError id="resale-battery-error" message={errors.batteryHealth} />
            </div>
            <div>
              <label htmlFor="resale-warranty" className={resaleLabelClass}>
                Battery warranty remaining (years)
              </label>
              <input
                id="resale-warranty"
                inputMode="numeric"
                className={resaleInputClass}
                value={form.batteryWarranty}
                onChange={(event) => onChange({ batteryWarranty: event.target.value })}
              />
            </div>
          </div>
          <div>
            <label htmlFor="resale-replaced" className={resaleLabelClass}>
              Battery replaced?
            </label>
            <select
              id="resale-replaced"
              className={resaleInputClass}
              value={form.batteryReplaced}
              onChange={(event) => onChange({ batteryReplaced: event.target.value })}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
