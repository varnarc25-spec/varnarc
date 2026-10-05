import {
  formatInrCompact,
  formatInrExact,
  formatKm,
  formatSignedInr,
  formatVehicleAge,
  type ResaleConfidenceLevel,
  type ResaleValuationResult,
} from '@varnarc/validation';
import { cityName, regionName } from './locations';
import {
  ACCIDENT_OPTIONS,
  FUEL_OPTIONS,
  INSURANCE_OPTIONS,
  MONTH_OPTIONS,
  OVERALL_OPTIONS,
  RC_OPTIONS,
  SERVICE_OPTIONS,
  TRANSMISSION_OPTIONS,
  type ResaleFormState,
} from './form';

export type ResalePdfRow = {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
  emphasis?: boolean;
};

export type ResalePdfSection = {
  title: string;
  intro?: string;
  rows: ResalePdfRow[];
  bulletLabel?: string;
  bullets?: string[];
};

export type ResalePdfDocument = {
  fileName: string;
  vehicle: string;
  subtitle: string;
  rangeLabel: string;
  range: string;
  marketLabel: string;
  market: string;
  exact: string;
  sections: ResalePdfSection[];
  notes: string[];
};

const CONFIDENCE_LABEL: Record<ResaleConfidenceLevel, string> = {
  HIGH: 'High confidence',
  MEDIUM: 'Medium confidence',
  LIMITED: 'Limited confidence',
};

/** Helvetica cannot draw the rupee sign or typographic dashes. */
export function pdfPlain(value: string): string {
  const normalized = value
    .replaceAll('₹', 'Rs. ')
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('−', '-')
    .replaceAll('’', "'")
    .replaceAll('‘', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('…', '...')
    .replaceAll('\u00a0', ' ')
    .replaceAll('\u202f', ' ');
  let latin1 = '';
  for (const char of normalized) {
    if (char.charCodeAt(0) <= 255) latin1 += char;
  }
  return latin1;
}

function fileSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resalePdfFileName(
  form: Pick<ResaleFormState, 'manufacturerName' | 'modelName' | 'variantName'>,
): string {
  const parts = [form.manufacturerName, form.modelName, form.variantName]
    .map((part) => fileSlug(part))
    .filter(Boolean);
  return `varnarc-car-resale-${parts.length ? parts.join('-') : 'estimate'}.pdf`;
}

function optionLabel(
  options: Array<{ value: string; label: string }>,
  value: string,
): string | null {
  const match = options.find((option) => option.value === value);
  if (!match?.value) return null;
  return match.label;
}

function locationLabel(form: ResaleFormState): string {
  if (form.citySlug)
    return `${cityName(form.stateSlug, form.citySlug)}, ${regionName(form.stateSlug)}`;
  if (form.stateSlug) return regionName(form.stateSlug);
  return '';
}

function registrationLabel(form: ResaleFormState): string | null {
  if (!form.registrationYear.trim()) return null;
  const month = MONTH_OPTIONS.find((option) => option.value === form.registrationMonth);
  if (month?.value) return `${month.label} ${form.registrationYear}`;
  return form.registrationYear;
}

function pushRow(rows: ResalePdfRow[], label: string, value: string | null) {
  if (!value?.trim()) return;
  rows.push({ label, value });
}

export function buildResalePdfDocument(input: {
  result: ResaleValuationResult;
  form: ResaleFormState;
  generatedAt: Date;
  shareUrl: string;
}): ResalePdfDocument {
  const { result, form, generatedAt, shareUrl } = input;
  const vehicle =
    [form.manufacturerName, form.modelName, form.variantName]
      .filter((part) => part.trim())
      .join(' ') || 'Your car';
  const generated = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(generatedAt);
  const place = locationLabel(form);
  const vehicleRows: ResalePdfRow[] = [];
  pushRow(vehicleRows, 'Manufacturer', form.manufacturerName);
  pushRow(vehicleRows, 'Model', form.modelName);
  pushRow(vehicleRows, 'Variant', form.variantName);
  pushRow(vehicleRows, 'Fuel', optionLabel(FUEL_OPTIONS, form.fuel));
  pushRow(vehicleRows, 'Transmission', optionLabel(TRANSMISSION_OPTIONS, form.transmission));
  pushRow(vehicleRows, 'Registered', registrationLabel(form));
  pushRow(vehicleRows, 'Overall condition', optionLabel(OVERALL_OPTIONS, form.overall));
  pushRow(vehicleRows, 'Service history', optionLabel(SERVICE_OPTIONS, form.serviceHistory));
  pushRow(vehicleRows, 'Accident history', optionLabel(ACCIDENT_OPTIONS, form.accidentHistory));
  pushRow(vehicleRows, 'Insurance', optionLabel(INSURANCE_OPTIONS, form.insurance));
  pushRow(vehicleRows, 'RC status', optionLabel(RC_OPTIONS, form.rcStatus));
  if (result.discontinued) vehicleRows.push({ label: 'Model status', value: 'Discontinued' });

  const ownerLabel = result.owners >= 4 ? '4 or more' : String(result.owners);
  const summary: ResalePdfRow[] = [
    { label: 'Original new-car price', value: formatInrCompact(result.originalPrice) },
    { label: 'Estimated depreciation', value: formatInrCompact(result.depreciationAmount) },
    { label: 'Value retained', value: `${result.valueRetentionPercentage.toFixed(1)}%` },
    { label: 'Value lost', value: `${result.valueLostPercentage.toFixed(1)}%` },
    {
      label: 'Vehicle age',
      value: formatVehicleAge(result.vehicleAgeYears, result.ageApproximate),
    },
    { label: 'Kilometres driven', value: formatKm(result.kilometres) },
    { label: 'Number of owners', value: ownerLabel },
    { label: 'Location', value: place || 'Not specified' },
  ];

  const adjustments: ResalePdfRow[] = [
    { label: 'Base depreciated value', value: formatInrExact(result.baseDepreciatedValue) },
    ...result.adjustmentLines.map((line) => ({
      label: line.label,
      value: formatSignedInr(line.amount),
      tone:
        line.amount > 0
          ? ('positive' as const)
          : line.amount < 0
            ? ('negative' as const)
            : undefined,
    })),
    {
      label: 'Estimated market value',
      value: formatInrExact(result.marketValue),
      emphasis: true,
    },
  ];

  const future: ResalePdfRow[] = [
    { label: 'Today', value: formatInrCompact(result.futureValues.today) },
    { label: '1 year', value: formatInrCompact(result.futureValues.year1) },
    { label: '2 years', value: formatInrCompact(result.futureValues.year2) },
    { label: '3 years', value: formatInrCompact(result.futureValues.year3) },
    { label: '5 years', value: formatInrCompact(result.futureValues.year5) },
    {
      label: 'Estimated value after 12 months',
      value: formatInrCompact(result.next12Months.value),
    },
    {
      label: 'Potential depreciation over next year',
      value: formatInrExact(result.next12Months.depreciation),
    },
    {
      label: 'Approximate depreciation per month',
      value: `${formatInrExact(result.next12Months.perMonth)}/month`,
    },
  ];

  const sections: ResalePdfSection[] = [
    { title: 'Vehicle', rows: vehicleRows },
    { title: 'Valuation summary', rows: summary },
    {
      title: 'Valuation confidence',
      intro: `${result.confidenceScore}% · ${CONFIDENCE_LABEL[result.confidenceLevel]}. ${result.confidenceNote}`,
      rows: [],
      bulletLabel: result.confidenceSuggestions.length ? 'To improve confidence' : undefined,
      bullets: result.confidenceSuggestions,
    },
  ];

  if (result.resaleValueScore != null) {
    sections.push({
      title: 'Resale value score',
      intro: `${result.resaleValueScore.toFixed(1)} / 10. A model-level score from configured Varnarc data, separate from this car's condition.`,
      rows: [],
    });
  }

  sections.push(
    { title: "What affected this car's value", rows: adjustments },
    {
      title: 'Estimated future value',
      intro:
        'Illustrative depreciation forecast. Actual future resale value depends on market conditions, kilometres driven and vehicle condition.',
      rows: future,
    },
    {
      title: 'Vehicle value timeline',
      rows: result.timeline.map((point) => ({
        label: point.label,
        value: formatInrCompact(point.value),
      })),
    },
  );

  const notes = [
    result.assumptionsNote,
    'Estimates are indicative. A physical inspection can change the final sale price, especially after accident, flood or chassis damage.',
  ];
  if (shareUrl.trim()) notes.push(`Result link: ${shareUrl.trim()}`);

  return {
    fileName: resalePdfFileName(form),
    vehicle,
    subtitle: place ? `${place} | ${generated}` : generated,
    rangeLabel: "Your car's estimated value",
    range: `${formatInrCompact(result.lowEstimate)} – ${formatInrCompact(result.highEstimate)}`,
    marketLabel: 'Expected market value',
    market: formatInrCompact(result.marketValue),
    exact: formatInrExact(result.marketValue),
    sections: sections.filter(
      (section) => section.rows.length > 0 || section.intro || section.bullets?.length,
    ),
    notes,
  };
}
