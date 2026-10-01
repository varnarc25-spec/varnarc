import {
  normalizeResaleFuel,
  normalizeResaleSegment,
  normalizeResaleTransmission,
  parseInrAmount,
  vehicleAgeYears,
  type ResaleDetailCondition,
  type ResaleValuationInput,
} from '@varnarc/validation';

export const MIN_REGISTRATION_YEAR = 1990;
export const MAX_KILOMETRES = 10_00_000;
export const MAX_PRICE = 50_00_00_000;

export type ResaleFormState = {
  manufacturerId: string;
  manufacturerSlug: string;
  manufacturerName: string;
  modelId: string;
  modelSlug: string;
  modelName: string;
  bodyType: string;
  category: string;
  discontinued: boolean;
  variantId: string;
  variantSlug: string;
  variantName: string;
  variantsAvailable: boolean;
  registrationYear: string;
  registrationMonth: string;
  fuel: string;
  transmission: string;
  catalogPrice: number | null;
  manualPrice: string;
  kilometres: string;
  owners: string;
  stateSlug: string;
  citySlug: string;
  insurance: string;
  rcStatus: string;
  purchaseYear: string;
  purchaseMonth: string;
  serviceHistory: string;
  accidentHistory: string;
  overall: string;
  exterior: string;
  interior: string;
  tyres: string;
  engineCondition: string;
  gearbox: string;
  electrical: string;
  ac: string;
  fullServiceHistory: boolean;
  originalPaint: boolean;
  recentTyres: boolean;
  validInsurance: boolean;
  majorAccident: boolean;
  floodDamage: boolean;
  chassisDamage: boolean;
  batteryHealth: string;
  batteryWarranty: string;
  batteryReplaced: string;
  specLines: Array<{ label: string; value: string }>;
};

export function emptyResaleForm(): ResaleFormState {
  return {
    manufacturerId: '',
    manufacturerSlug: '',
    manufacturerName: '',
    modelId: '',
    modelSlug: '',
    modelName: '',
    bodyType: '',
    category: '',
    discontinued: false,
    variantId: '',
    variantSlug: '',
    variantName: '',
    variantsAvailable: false,
    registrationYear: '',
    registrationMonth: '',
    fuel: '',
    transmission: '',
    catalogPrice: null,
    manualPrice: '',
    kilometres: '',
    owners: '1',
    stateSlug: '',
    citySlug: '',
    insurance: '',
    rcStatus: '',
    purchaseYear: '',
    purchaseMonth: '',
    serviceHistory: '',
    accidentHistory: '',
    overall: '',
    exterior: '',
    interior: '',
    tyres: '',
    engineCondition: '',
    gearbox: '',
    electrical: '',
    ac: '',
    fullServiceHistory: false,
    originalPaint: false,
    recentTyres: false,
    validInsurance: false,
    majorAccident: false,
    floodDamage: false,
    chassisDamage: false,
    batteryHealth: '',
    batteryWarranty: '',
    batteryReplaced: '',
    specLines: [],
  };
}

export const FUEL_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'lpg', label: 'LPG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugin_hybrid', label: 'Plug-in hybrid' },
];

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'single_speed', label: 'Single speed' },
];

export const OWNER_OPTIONS = [
  { value: '1', label: 'First owner' },
  { value: '2', label: 'Second owner' },
  { value: '3', label: 'Third owner' },
  { value: '4', label: 'Fourth owner or more' },
];

export const INSURANCE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'comprehensive', label: 'Comprehensive' },
  { value: 'third_party', label: 'Third party' },
  { value: 'expired', label: 'Expired / No active insurance' },
];

export const RC_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'valid', label: 'Valid' },
  { value: 'expired', label: 'Expired' },
];

export const SERVICE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'authorised', label: 'Complete authorised service history' },
  { value: 'complete', label: 'Complete service history' },
  { value: 'partial', label: 'Partial service history' },
  { value: 'none', label: 'No records' },
];

export const ACCIDENT_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'none', label: 'No known accident' },
  { value: 'minor', label: 'Minor cosmetic repairs' },
  { value: 'major', label: 'Major repaired accident' },
  { value: 'structural', label: 'Structural/chassis damage' },
];

export const OVERALL_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const DETAIL_OPTIONS = [
  { value: '', label: 'Not rated' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' },
];

export function registrationYears(now = new Date()): number[] {
  const current = now.getFullYear();
  const years: number[] = [];
  for (let year = current; year >= MIN_REGISTRATION_YEAR; year -= 1) years.push(year);
  return years;
}

export const MONTH_OPTIONS = [
  { value: '', label: 'Month unknown' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function detailOrNull(value: string): ResaleDetailCondition | null {
  if (value === 'excellent' || value === 'good' || value === 'average' || value === 'poor') {
    return value;
  }
  return null;
}

export function validateResaleStep(
  form: ResaleFormState,
  step: number,
  now = new Date(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!form.manufacturerId) errors.manufacturer = 'Select a manufacturer.';
    if (!form.modelId) errors.model = 'Select a model.';
    if (form.variantsAvailable && !form.variantId) errors.variant = 'Select a variant.';
    const year = Number(form.registrationYear);
    if (!form.registrationYear || !Number.isInteger(year)) {
      errors.registrationYear = 'Select the registration year.';
    } else if (year > now.getFullYear() || year < MIN_REGISTRATION_YEAR) {
      errors.registrationYear = 'Registration year cannot be in the future.';
    }
    if (!form.fuel) errors.fuel = 'Select the fuel type.';
    if (!form.transmission) errors.transmission = 'Select the transmission.';
    if (form.catalogPrice == null) {
      const price = parseInrAmount(form.manualPrice);
      if (price == null)
        errors.manualPrice = 'Enter an approximate new-car price greater than zero.';
      else if (price > MAX_PRICE)
        errors.manualPrice = 'That price looks too high. Check the amount.';
    }
    const month = form.registrationMonth ? Number(form.registrationMonth) : null;
    if (form.registrationYear && !errors.registrationYear) {
      try {
        vehicleAgeYears({
          year: Number(form.registrationYear),
          month,
          now,
        });
      } catch {
        errors.registrationMonth = 'That registration month is still in the future.';
      }
    }
  }
  if (step === 1) {
    if (form.kilometres.trim() === '') errors.kilometres = 'Enter kilometres driven.';
    else {
      const km = Number(form.kilometres);
      if (!Number.isFinite(km) || km < 0) errors.kilometres = 'Kilometres cannot be negative.';
      else if (km > MAX_KILOMETRES)
        errors.kilometres = 'Enter a kilometre reading under 10,00,000.';
    }
    if (!['1', '2', '3', '4'].includes(form.owners)) errors.owners = 'Select the number of owners.';
    if (!form.stateSlug) errors.state = 'Select a state.';
    if (!form.citySlug) errors.city = 'Select a city, or choose other city in this state.';
  }
  if (step === 2) {
    if (!form.overall) errors.overall = 'Select the overall condition.';
    if (form.batteryHealth.trim()) {
      const health = Number(form.batteryHealth);
      if (!Number.isFinite(health) || health < 0 || health > 100) {
        errors.batteryHealth = 'Battery health should be between 0 and 100.';
      }
    }
  }
  return errors;
}

export function toValuationInput(form: ResaleFormState, now = new Date()): ResaleValuationInput {
  const price = form.catalogPrice ?? parseInrAmount(form.manualPrice);
  if (price == null) throw new Error('Original vehicle price must be greater than zero.');
  const year = Number(form.registrationYear);
  const monthFromPurchase =
    !form.registrationMonth && form.purchaseMonth && form.purchaseYear === form.registrationYear
      ? Number(form.purchaseMonth)
      : null;
  const month = form.registrationMonth ? Number(form.registrationMonth) : monthFromPurchase;
  const ageYears = vehicleAgeYears({ year, month, now });
  const fuel = normalizeResaleFuel(form.fuel);
  const owners = Number(form.owners);
  return {
    originalPrice: price,
    priceSource: form.catalogPrice != null ? 'catalog' : 'manual',
    ageYears,
    ageApproximate: !month,
    kilometres: Number(form.kilometres),
    owners: owners === 2 || owners === 3 || owners === 4 ? owners : 1,
    fuel,
    transmission: normalizeResaleTransmission(form.transmission),
    segment: normalizeResaleSegment(form.bodyType, fuel, form.category),
    citySlug: form.citySlug || null,
    stateSlug: form.stateSlug || null,
    overallCondition:
      form.overall === 'excellent' ||
      form.overall === 'very_good' ||
      form.overall === 'good' ||
      form.overall === 'fair' ||
      form.overall === 'poor'
        ? form.overall
        : null,
    details: {
      exterior: detailOrNull(form.exterior),
      interior: detailOrNull(form.interior),
      tyres: detailOrNull(form.tyres),
      engine: detailOrNull(form.engineCondition),
      transmission: detailOrNull(form.gearbox),
      electrical: detailOrNull(form.electrical),
      ac: detailOrNull(form.ac),
    },
    toggles: {
      fullServiceHistory: form.fullServiceHistory,
      originalPaint: form.originalPaint,
      recentTyres: form.recentTyres,
      validInsurance: form.validInsurance,
      majorAccident: form.majorAccident,
      floodDamage: form.floodDamage,
      chassisDamage: form.chassisDamage,
    },
    serviceHistory:
      form.serviceHistory === 'authorised' ||
      form.serviceHistory === 'complete' ||
      form.serviceHistory === 'partial' ||
      form.serviceHistory === 'none'
        ? form.serviceHistory
        : null,
    accidentHistory:
      form.accidentHistory === 'none' ||
      form.accidentHistory === 'minor' ||
      form.accidentHistory === 'major' ||
      form.accidentHistory === 'structural'
        ? form.accidentHistory
        : null,
    insuranceStatus:
      form.insurance === 'comprehensive' ||
      form.insurance === 'third_party' ||
      form.insurance === 'expired'
        ? form.insurance
        : null,
    rcStatus: form.rcStatus === 'valid' || form.rcStatus === 'expired' ? form.rcStatus : null,
    discontinued: form.discontinued,
    variantIdentified: Boolean(form.variantId),
    manufacturerId: form.manufacturerId || null,
    manufacturerSlug: form.manufacturerSlug || null,
    modelId: form.modelId || null,
    variantId: form.variantId || null,
    batteryHealthPercent: form.batteryHealth.trim() ? Number(form.batteryHealth) : null,
    batteryWarrantyYearsRemaining: form.batteryWarranty.trim()
      ? Number(form.batteryWarranty)
      : null,
    batteryReplaced:
      form.batteryReplaced === 'yes' ? true : form.batteryReplaced === 'no' ? false : null,
  };
}
