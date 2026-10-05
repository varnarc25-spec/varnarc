import { z } from 'zod';

export const LAPTOP_RENTAL_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED'] as const;

export type LaptopRentalStatus = (typeof LAPTOP_RENTAL_STATUSES)[number];

export const LAPTOP_RENTAL_STATUS_LABELS: Record<LaptopRentalStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
};

const line = z.string().trim().min(1).max(300);
const shortLine = z.string().trim().min(1).max(160);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Enter a valid email address.',
  });

const optionalGstin = z
  .string()
  .trim()
  .max(15)
  .optional()
  .nullable()
  .transform((value) => (value ? value.toUpperCase() : null))
  .refine(
    (value) => value === null || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(value),
    'GSTIN must be 15 characters, such as 29AAAAA0000A1Z5.',
  );

export const laptopRentalProposalSchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  customerCompanyName: z.string().trim().min(1).max(200),
  proposalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1).max(160),
  proposalSummary: z.string().trim().min(1).max(2000),
  quantity: z.coerce.number().int().min(1).max(500),
  processor: z.string().trim().min(1).max(120),
  ram: z.string().trim().min(1).max(80),
  storage: z.string().trim().min(1).max(80),
  display: z.string().trim().min(1).max(80),
  operatingSystem: z.string().trim().min(1).max(80),
  brand: z.string().trim().min(1).max(120),
  condition: z.string().trim().min(1).max(200),
  accessories: z.string().trim().min(1).max(200),
  monthlyRate: z.coerce.number().min(0).max(10_000_000),
  commitmentMonths: z.coerce.number().int().min(1).max(60),
  commitmentRate: z.coerce.number().min(0).max(10_000_000),
  gstPercent: z.coerce.number().min(0).max(100),
  depositPerLaptop: z.coerce.number().min(0).max(10_000_000),
  deliveryLocation: z.string().trim().min(1).max(120),
  services: z.array(line).min(1).max(20),
  supportText: z.string().trim().min(1).max(4000),
  responsibilities: z.array(line).min(1).max(20),
  paymentDueText: z.string().trim().min(1).max(300),
  depositNote: z.string().trim().min(1).max(1000),
  returnIntro: z.string().trim().min(1).max(500),
  returnChecks: z.array(shortLine).min(1).max(20),
  wearNote: z.string().trim().min(1).max(300),
  acceptanceText: z.string().trim().min(1).max(2000),
  gstNote: z.string().trim().min(1).max(200),
  customerSignatoryName: optionalText(120),
  customerSignatoryDesignation: optionalText(120),
  issuerSignatoryName: optionalText(120),
  issuerSignatoryDesignation: optionalText(120),
  issuerName: z.string().trim().min(1).max(200),
  issuerAddress: optionalText(500),
  issuerPhone: optionalText(40),
  issuerEmail: optionalEmail,
  issuerGstin: optionalGstin,
  laptopIds: z.array(z.string().uuid()).max(500).default([]),
  laptopLines: z
    .array(
      z.object({
        laptopId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(500),
      }),
    )
    .max(100)
    .default([]),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
});

export const updateLaptopRentalProposalSchema = laptopRentalProposalSchema.and(
  z.object({ status: z.enum(LAPTOP_RENTAL_STATUSES) }),
);

export const laptopRentalStatusSchema = z.object({
  status: z.enum(LAPTOP_RENTAL_STATUSES),
});

export type CreateLaptopRentalProposalInput = z.infer<typeof laptopRentalProposalSchema>;
export type UpdateLaptopRentalProposalInput = z.infer<typeof updateLaptopRentalProposalSchema>;
export type LaptopRentalStatusInput = z.infer<typeof laptopRentalStatusSchema>;

export function roundRupees(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatProposalInr(amount: number) {
  const rounded = roundRupees(amount);
  const negative = rounded < 0;
  const [whole, fraction] = Math.abs(rounded).toFixed(2).split('.') as [string, string];
  const grouped = groupIndianDigits(whole);
  const body = fraction === '00' ? grouped : `${grouped}.${fraction}`;
  return `${negative ? '-' : ''}₹${body}`;
}

function groupIndianDigits(digits: string) {
  if (digits.length <= 3) return digits;
  const tail = digits.slice(-3);
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${head},${tail}`;
}

export function formatProposalDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function proposalBlocks(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function formatGstPercent(value: number) {
  const rounded = roundRupees(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
}

export type LaptopRentalQuote = {
  monthlyTotal: number;
  commitmentMonthly: number;
  gstAmount: number;
  monthlyWithGst: number;
  termBeforeGst: number;
  depositTotal: number;
  discountAmount: number;
};

export const VOLUME_DISCOUNT_MIN_QUANTITY = 10;
export const VOLUME_DISCOUNT_PERCENT = 5;

export function volumeDiscountPercent(quantity: number) {
  return quantity > VOLUME_DISCOUNT_MIN_QUANTITY ? VOLUME_DISCOUNT_PERCENT : 0;
}

export type RentalDiscountTier = { months: number; percent: number };

export const DEFAULT_RENTAL_DISCOUNTS: RentalDiscountTier[] = [
  { months: 3, percent: 5 },
  { months: 6, percent: 10 },
  { months: 9, percent: 15 },
  { months: 12, percent: 20 },
];

export function rentalDiscountForMonths(months: number, tiers: readonly RentalDiscountTier[]) {
  let matched: RentalDiscountTier | null = null;
  for (const tier of tiers) {
    if (months >= tier.months && (matched === null || tier.months > matched.months)) matched = tier;
  }
  return matched;
}

export function discountPercentForMonths(months: number, tiers: readonly RentalDiscountTier[]) {
  return rentalDiscountForMonths(months, tiers)?.percent ?? 0;
}

export function discountedMonthlyRate(monthlyRate: number | null, percent: number) {
  if (monthlyRate == null) return null;
  const discount = Math.min(100, Math.max(0, percent));
  return roundRupees(monthlyRate * (1 - discount / 100));
}

export function rateForCommitment(input: {
  months: number;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
}) {
  const monthly = input.monthlyRate ?? input.commitmentRate;
  return input.months >= input.commitmentMonths ? input.commitmentRate : monthly;
}

export function quoteLaptopRental(input: {
  quantity: number;
  monthlyRate: number;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  discountPercent?: number;
}): LaptopRentalQuote {
  const discount = Math.min(100, Math.max(0, input.discountPercent ?? 0));
  const factor = 1 - discount / 100;
  const monthlyBefore = roundRupees(input.monthlyRate * input.quantity);
  const commitmentBefore = roundRupees(input.commitmentRate * input.quantity);
  const monthlyTotal = roundRupees(monthlyBefore * factor);
  const commitmentMonthly = roundRupees(commitmentBefore * factor);
  const gstAmount = roundRupees((commitmentMonthly * input.gstPercent) / 100);
  return {
    monthlyTotal,
    commitmentMonthly,
    gstAmount,
    monthlyWithGst: roundRupees(commitmentMonthly + gstAmount),
    termBeforeGst: roundRupees(commitmentMonthly * input.commitmentMonths),
    depositTotal: roundRupees(input.depositPerLaptop * input.quantity),
    discountAmount: roundRupees(commitmentBefore - commitmentMonthly),
  };
}

export type LaptopSelectionQuoteLine = {
  monthlyRate: number;
  commitmentRate: number;
  depositPerLaptop: number;
  quantity: number;
  gstPercent: number;
};

export function quoteLaptopSelection(input: {
  lines: LaptopSelectionQuoteLine[];
  commitmentMonths: number;
  discountPercent: number;
}) {
  const quantity = input.lines.reduce((sum, line) => sum + line.quantity, 0);
  const monthlyBefore = roundRupees(
    input.lines.reduce((sum, line) => sum + line.monthlyRate * line.quantity, 0),
  );
  const commitmentBefore = roundRupees(
    input.lines.reduce((sum, line) => sum + line.commitmentRate * line.quantity, 0),
  );
  const depositTotal = roundRupees(
    input.lines.reduce((sum, line) => sum + line.depositPerLaptop * line.quantity, 0),
  );
  const discount = Math.min(100, Math.max(0, input.discountPercent));
  const factor = 1 - discount / 100;
  const monthlyTotal = roundRupees(monthlyBefore * factor);
  const commitmentMonthly = roundRupees(commitmentBefore * factor);
  const gstAmount = roundRupees(
    input.lines.reduce(
      (sum, line) => sum + (line.commitmentRate * line.quantity * factor * line.gstPercent) / 100,
      0,
    ),
  );
  return {
    quantity,
    monthlyBefore,
    commitmentBefore,
    discountPercent: discount,
    discountAmount: roundRupees(commitmentBefore - commitmentMonthly),
    monthlyTotal,
    commitmentMonthly,
    gstAmount,
    monthlyWithGst: roundRupees(commitmentMonthly + gstAmount),
    termBeforeGst: roundRupees(commitmentMonthly * input.commitmentMonths),
    depositTotal,
    monthlyRate: quantity ? roundRupees(monthlyBefore / quantity) : 0,
    commitmentRate: quantity ? roundRupees(commitmentBefore / quantity) : 0,
    depositPerLaptop: quantity ? roundRupees(depositTotal / quantity) : 0,
    gstPercent: quantity
      ? roundRupees(
          input.lines.reduce((sum, line) => sum + line.gstPercent * line.quantity, 0) / quantity,
        )
      : 0,
  };
}

export type LaptopRentalRun = { text: string; strong?: boolean };

export type LaptopRentalDocument = {
  fileName: string;
  proposalNumber: string;
  statusLabel: string;
  kicker: string;
  headline: string;
  preparedFor: string;
  preparedBy: string;
  dateLabel: string;
  intro: string[];
  specifications: Array<{ label: string; value: string }>;
  gstNote: string;
  plans: Array<{ name: string; perLaptop: string; quantity: string; monthly: string }>;
  recommended: Array<{ label: string; amount: string | null }>;
  depositRows: Array<{ label: string; value: string; emphasis?: boolean }>;
  depositNote: string;
  services: string[];
  support: string[];
  responsibilitiesIntro: string;
  responsibilities: string[];
  paymentTerms: LaptopRentalRun[][];
  returnIntro: string;
  returnInspectLabel: string;
  returnChecks: string[];
  wearNote: string;
  acceptance: string[];
  signatures: {
    customerHeading: string;
    customerName: string;
    customerDesignation: string;
    issuerHeading: string;
    issuerName: string;
    issuerDesignation: string;
  };
  footer: {
    name: string;
    addressLines: string[];
    contact: string;
    gstin: string;
  };
  assignedLaptops: string[];
};

export type LaptopRentalDocumentInput = {
  proposalNumber: string;
  status: LaptopRentalStatus;
  customerCompanyName: string;
  proposalDate: string;
  title: string;
  proposalSummary: string;
  quantity: number;
  processor: string;
  ram: string;
  storage: string;
  display: string;
  operatingSystem: string;
  brand: string;
  condition: string;
  accessories: string;
  monthlyRate: number;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  deliveryLocation: string;
  services: string[];
  supportText: string;
  responsibilities: string[];
  paymentDueText: string;
  depositNote: string;
  returnIntro: string;
  returnChecks: string[];
  wearNote: string;
  acceptanceText: string;
  gstNote: string;
  customerSignatoryName: string | null;
  customerSignatoryDesignation: string | null;
  issuerSignatoryName: string | null;
  issuerSignatoryDesignation: string | null;
  issuerName: string;
  issuerAddress: string | null;
  issuerPhone: string | null;
  issuerEmail: string | null;
  issuerGstin: string | null;
  assignedLaptops?: string[];
  discountPercent?: number;
  selection?: LaptopRentalSelectionLine[];
  discountTiers?: RentalDiscountTier[];
};

export type LaptopRentalSelectionLine = {
  name: string;
  quantity: number;
  monthlyRate: number;
  commitmentRate: number;
  depositPerLaptop: number;
  gstPercent: number;
  detail: string;
};

function rentalPricingPlans(input: LaptopRentalDocumentInput) {
  const selected = input.selection ?? [];
  const tiers = [
    ...(input.discountTiers?.length ? input.discountTiers : DEFAULT_RENTAL_DISCOUNTS),
  ].sort((left, right) => left.months - right.months);
  const sameMonthly =
    selected.length === 0 ||
    selected.every((line) => line.monthlyRate === selected[0]?.monthlyRate);
  const baseRate = selected[0]?.monthlyRate ?? input.monthlyRate;
  const baseFleet = selected.length
    ? roundRupees(selected.reduce((sum, line) => sum + line.monthlyRate * line.quantity, 0))
    : roundRupees(input.monthlyRate * input.quantity);
  const rows = [{ months: 0, percent: 0 }, ...tiers];
  return rows.map((tier) => {
    const percent = Math.min(100, Math.max(0, tier.percent));
    const perLaptop = discountedMonthlyRate(baseRate, percent);
    const fleet = roundRupees(baseFleet * (1 - percent / 100));
    return {
      name: tier.months === 0 ? 'Monthly Rental' : `${tier.months}-Month Rental`,
      perLaptop:
        sameMonthly && perLaptop != null ? formatProposalInr(perLaptop) : 'Selected models',
      quantity: String(input.quantity),
      monthly: formatProposalInr(fleet),
    };
  });
}

function laptopLabel(quantity: number) {
  return quantity === 1 ? 'Laptop' : 'Laptops';
}

function fileSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || 'client';
}

export function buildLaptopRentalDocument(input: LaptopRentalDocumentInput): LaptopRentalDocument {
  const discountPercent = input.discountPercent ?? 0;
  const selected = input.selection ?? [];
  const selectionQuote = selected.length
    ? quoteLaptopSelection({
        lines: selected,
        commitmentMonths: input.commitmentMonths,
        discountPercent,
      })
    : null;
  const quote = selectionQuote ?? quoteLaptopRental({ ...input, discountPercent });
  const laptops = laptopLabel(input.quantity);
  const months = input.commitmentMonths;
  const monthWord = months === 1 ? 'month' : 'months';
  const sameRate =
    selected.length === 0 ||
    selected.every((line) => line.commitmentRate === selected[0]?.commitmentRate);
  const perLaptop = sameRate
    ? formatProposalInr(selected[0]?.commitmentRate ?? input.commitmentRate)
    : 'Selected models';
  const fleet = formatProposalInr(quote.commitmentMonthly);
  const commitmentBefore =
    selectionQuote?.commitmentBefore ?? roundRupees(input.commitmentRate * input.quantity);
  const gst = formatProposalInr(quote.gstAmount);
  const withGst = formatProposalInr(quote.monthlyWithGst);
  const term = formatProposalInr(quote.termBeforeGst);
  const deposit = formatProposalInr(quote.depositTotal);
  const gstPercent = formatGstPercent(selectionQuote?.gstPercent ?? input.gstPercent);
  const contact = [input.issuerPhone, input.issuerEmail].filter(Boolean).join(' | ');
  const subject =
    selected.length > 1
      ? `${input.quantity} business ${laptops.toLowerCase()}`
      : `${input.quantity} ${input.processor} business ${laptops.toLowerCase()}`;
  const sameDeposit =
    selected.length === 0 ||
    selected.every((line) => line.depositPerLaptop === selected[0]?.depositPerLaptop);
  const recommended: Array<{ label: string; amount: string | null }> = [
    {
      label: `For a ${months}-${monthWord} commitment:`,
      amount: `${perLaptop} + GST per laptop per month`,
    },
    {
      label: `For ${input.quantity} ${laptops.toLowerCase()}:`,
      amount: `${formatProposalInr(commitmentBefore)} + GST per month`,
    },
  ];
  if (discountPercent > 0) {
    recommended.push(
      {
        label: `Discount @ ${formatGstPercent(discountPercent)}%:`,
        amount: `${formatProposalInr(quote.discountAmount)} per month`,
      },
      { label: 'Commitment rental after discount:', amount: `${fleet} per month` },
    );
  }
  recommended.push(
    { label: `GST @ ${gstPercent}%:`, amount: `${gst} per month` },
    { label: `Total monthly invoice including GST: ${withGst}`, amount: null },
    { label: `Total rental for ${months} ${monthWord} before GST: ${term}`, amount: null },
  );

  return {
    fileName: `laptop-rental-proposal-${input.proposalNumber}-${fileSlug(input.customerCompanyName)}.pdf`,
    proposalNumber: input.proposalNumber,
    statusLabel: LAPTOP_RENTAL_STATUS_LABELS[input.status],
    kicker: 'LAPTOP RENTAL PROPOSAL',
    headline: `${input.title} – ${input.quantity} ${laptops}`,
    preparedFor: input.customerCompanyName,
    preparedBy: input.issuerName,
    dateLabel: formatProposalDate(input.proposalDate),
    intro: [
      `We are pleased to submit this proposal for providing ${subject} on a rental basis.`,
      ...proposalBlocks(input.proposalSummary),
    ],
    specifications: selected.length
      ? [
          { label: 'Quantity', value: `${input.quantity} ${laptops}` },
          ...selected.map((line) => ({
            label: `${line.name} × ${line.quantity}`,
            value: line.detail || formatProposalInr(line.commitmentRate),
          })),
        ]
      : [
          { label: 'Quantity', value: `${input.quantity} ${laptops}` },
          { label: 'Processor', value: input.processor },
          { label: 'RAM', value: input.ram },
          { label: 'Storage', value: input.storage },
          { label: 'Display', value: input.display },
          { label: 'Operating System', value: input.operatingSystem },
          { label: 'Brand', value: input.brand },
          { label: 'Condition', value: input.condition },
          { label: 'Accessories', value: input.accessories },
        ],
    gstNote: input.gstNote,
    plans: rentalPricingPlans(input),
    recommended,
    depositRows: sameDeposit
      ? [
          {
            label: 'Security deposit per laptop',
            value: formatProposalInr(selected[0]?.depositPerLaptop ?? input.depositPerLaptop),
          },
          { label: 'Number of laptops', value: String(input.quantity) },
          { label: 'Total refundable security deposit', value: deposit, emphasis: true },
        ]
      : [
          { label: 'Number of laptops', value: String(input.quantity) },
          { label: 'Total refundable security deposit', value: deposit, emphasis: true },
        ],
    depositNote: input.depositNote,
    services: input.services,
    support: proposalBlocks(input.supportText),
    responsibilitiesIntro: 'The customer shall:',
    responsibilities: input.responsibilities,
    paymentTerms: [
      [{ text: 'Rental charges will be billed monthly.' }],
      [{ text: 'GST will be charged as applicable.' }],
      [
        { text: 'Security deposit: ' },
        { text: `${deposit} refundable`, strong: true },
        { text: '.' },
      ],
      [{ text: `Payment due date: ${input.paymentDueText}` }],
      [
        { text: 'Rental period: ' },
        { text: `${months} ${monthWord}`, strong: true },
        { text: ` for the discounted rental rate of ${perLaptop} per laptop/month.` },
      ],
    ],
    returnIntro: input.returnIntro,
    returnInspectLabel: 'The equipment will be inspected for:',
    returnChecks: input.returnChecks,
    wearNote: input.wearNote,
    acceptance: proposalBlocks(input.acceptanceText),
    signatures: {
      customerHeading: 'For Customer',
      customerName: input.customerSignatoryName ?? '',
      customerDesignation: input.customerSignatoryDesignation ?? '',
      issuerHeading: `For ${input.issuerName}`,
      issuerName: input.issuerSignatoryName ?? '',
      issuerDesignation: input.issuerSignatoryDesignation ?? '',
    },
    footer: {
      name: input.issuerName,
      addressLines: input.issuerAddress
        ? input.issuerAddress
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : [],
      contact,
      gstin: input.issuerGstin ?? '',
    },
    assignedLaptops: input.assignedLaptops ?? [],
  };
}

const DEFAULT_SERVICES = [
  'Delivery of laptops to the agreed Bengaluru location',
  'Basic laptop setup and functional testing',
  'Asset identification/tagging',
  'Power adapter/charger',
  'Technical support for hardware-related issues',
  'Repair/replacement support for hardware failure',
  'Pickup of laptops at the end of the rental period',
];

const DEFAULT_RESPONSIBILITIES = [
  'Use the laptops with reasonable care.',
  'Not dismantle or modify the equipment without prior approval.',
  'Report loss, theft or damage immediately.',
  'Return all laptops and accessories at the end of the rental period.',
  'Maintain responsibility for customer-installed software and data.',
  'Ensure that the equipment is used only for lawful business purposes.',
];

const DEFAULT_RETURN_CHECKS = [
  'Physical condition',
  'Screen/display condition',
  'Keyboard and touchpad',
  'Ports',
  'Charger/adapter',
  'Functional condition',
  'Missing components',
];

const DEFAULT_SUPPORT = [
  'Hardware-related issues reported by the customer will be assessed and resolved within the agreed support period.',
  'Where required, the laptop may be repaired or replaced with an equivalent specification unit, subject to the agreed SLA and availability.',
  'Physical damage, liquid damage, theft or loss will be chargeable separately.',
].join('\n\n');

const DEFAULT_ACCEPTANCE = [
  'We look forward to providing reliable and flexible laptop rental services to your organization.',
  'Upon acceptance of this proposal, the final rental agreement, Purchase Order and detailed SLA can be completed.',
].join('\n\n');

export function laptopRentalDefaults(proposalDate: string) {
  return {
    companyId: null as string | null,
    customerCompanyName: '',
    proposalDate,
    title: 'Corporate Laptop Rental',
    proposalSummary:
      'The rental service includes laptop supply, basic setup, delivery, technical support and replacement support for hardware-related issues during the rental period.',
    quantity: 10,
    processor: 'Intel Core i5',
    ram: '16 GB',
    storage: '512 GB SSD',
    display: '14" / 15.6" Full HD',
    operatingSystem: 'Windows 11 Pro',
    brand: 'Dell / HP / Lenovo',
    condition: 'Professionally tested business-class laptop',
    accessories: 'Power adapter/charger',
    monthlyRate: 4000,
    commitmentMonths: 6,
    commitmentRate: 3600,
    gstPercent: 18,
    depositPerLaptop: 25000,
    deliveryLocation: 'Bengaluru',
    services: [...DEFAULT_SERVICES],
    supportText: DEFAULT_SUPPORT,
    responsibilities: [...DEFAULT_RESPONSIBILITIES],
    paymentDueText: 'As mutually agreed / as specified in the Purchase Order.',
    depositNote:
      'The security deposit will be refundable after the equipment is returned and inspected, subject to clearance of any outstanding rental, loss, theft or chargeable damage.',
    returnIntro:
      'At the end of the rental period, all laptops and supplied accessories shall be returned.',
    returnChecks: [...DEFAULT_RETURN_CHECKS],
    wearNote: 'Normal wear and tear will not be treated as chargeable damage.',
    acceptanceText: DEFAULT_ACCEPTANCE,
    gstNote: 'Applicable at the prevailing rate.',
    customerSignatoryName: '',
    customerSignatoryDesignation: '',
    issuerSignatoryName: '',
    issuerSignatoryDesignation: '',
    issuerName: '',
    issuerAddress: '',
    issuerPhone: '',
    issuerEmail: '',
    issuerGstin: '',
    laptopIds: [] as string[],
    laptopLines: [] as Array<{ laptopId: string; quantity: number }>,
    discountPercent: 0,
  };
}

export type LaptopRentalFormValues = ReturnType<typeof laptopRentalDefaults> & {
  status?: LaptopRentalStatus;
};

export type LaptopRentalProposalSummary = {
  id: string;
  proposalNumber: string;
  status: LaptopRentalStatus;
  companyId: string;
  customerCompanyName: string;
  proposalDate: string;
  quantity: number;
  commitmentMonths: number;
  commitmentMonthly: number;
  monthlyWithGst: number;
  depositTotal: number;
};

export type LaptopRentalProposalView = LaptopRentalDocumentInput & {
  id: string;
  companyId: string;
  companyName: string;
  laptopIds: string[];
  laptopLines: Array<{ laptopId: string; quantity: number }>;
  discountPercent: number;
  document: LaptopRentalDocument;
  logoDataUrl: string | null;
};
