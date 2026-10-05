import { z } from 'zod';
import { roundRupees } from './laptop-rental-proposal';

export const LAPTOP_RENTAL_AGREEMENT_STATUSES = [
  'PENDING_SIGNATURE',
  'ACTIVE',
  'CLOSED',
  'CANCELLED',
] as const;
export const LAPTOP_RENTAL_UNIT_STATUSES = [
  'READY',
  'DELIVERED',
  'IN_REPAIR',
  'REPLACED',
  'PICKED_UP',
  'LOST',
  'STOLEN',
] as const;
export const LAPTOP_RENTAL_INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'VOID'] as const;
export const LAPTOP_RENTAL_INVOICE_KINDS = ['RENTAL', 'CHARGE'] as const;
export const LAPTOP_RENTAL_CASE_KINDS = ['HARDWARE_FAULT', 'REPAIR', 'REPLACEMENT'] as const;
export const LAPTOP_RENTAL_CASE_STATUSES = ['OPEN', 'RESOLVED'] as const;
export const LAPTOP_RENTAL_CHARGE_KINDS = [
  'PHYSICAL_DAMAGE',
  'LIQUID_DAMAGE',
  'THEFT',
  'LOSS',
] as const;
export const LAPTOP_RENTAL_CHARGE_SETTLEMENTS = ['INVOICE', 'DEPOSIT'] as const;
export const LAPTOP_RENTAL_CHARGE_STATUSES = [
  'OPEN',
  'BILLED',
  'PAID',
  'WAIVED',
  'DEDUCTED',
] as const;

export type LaptopRentalAgreementStatus = (typeof LAPTOP_RENTAL_AGREEMENT_STATUSES)[number];
export type LaptopRentalUnitStatus = (typeof LAPTOP_RENTAL_UNIT_STATUSES)[number];
export type LaptopRentalInvoiceStatus = (typeof LAPTOP_RENTAL_INVOICE_STATUSES)[number];
export type LaptopRentalInvoiceKind = (typeof LAPTOP_RENTAL_INVOICE_KINDS)[number];
export type LaptopRentalCaseKind = (typeof LAPTOP_RENTAL_CASE_KINDS)[number];
export type LaptopRentalCaseStatus = (typeof LAPTOP_RENTAL_CASE_STATUSES)[number];
export type LaptopRentalChargeKind = (typeof LAPTOP_RENTAL_CHARGE_KINDS)[number];
export type LaptopRentalChargeSettlement = (typeof LAPTOP_RENTAL_CHARGE_SETTLEMENTS)[number];
export type LaptopRentalChargeStatus = (typeof LAPTOP_RENTAL_CHARGE_STATUSES)[number];

export const LAPTOP_RENTAL_AGREEMENT_LABELS: Record<LaptopRentalAgreementStatus, string> = {
  PENDING_SIGNATURE: 'Awaiting signature',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

export const LAPTOP_RENTAL_UNIT_LABELS: Record<LaptopRentalUnitStatus, string> = {
  READY: 'Ready to deliver',
  DELIVERED: 'With customer',
  IN_REPAIR: 'In repair',
  REPLACED: 'Replaced',
  PICKED_UP: 'Picked up',
  LOST: 'Lost',
  STOLEN: 'Stolen',
};

export const LAPTOP_RENTAL_INVOICE_LABELS: Record<LaptopRentalInvoiceStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PAID: 'Paid',
  VOID: 'Void',
};

export const LAPTOP_RENTAL_CASE_KIND_LABELS: Record<LaptopRentalCaseKind, string> = {
  HARDWARE_FAULT: 'Hardware fault',
  REPAIR: 'Repair',
  REPLACEMENT: 'Replacement',
};

export const LAPTOP_RENTAL_CASE_STATUS_LABELS: Record<LaptopRentalCaseStatus, string> = {
  OPEN: 'Open',
  RESOLVED: 'Resolved',
};

export const LAPTOP_RENTAL_CHARGE_KIND_LABELS: Record<LaptopRentalChargeKind, string> = {
  PHYSICAL_DAMAGE: 'Physical damage',
  LIQUID_DAMAGE: 'Liquid damage',
  THEFT: 'Theft',
  LOSS: 'Loss',
};

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDate = dateOnly.optional().nullable();
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

export const startLaptopRentalSchema = z.object({
  startDate: dateOnly,
  poNumber: optionalText(80),
  slaHours: z.coerce.number().int().min(1).max(720).default(48),
  customerSignatoryName: optionalText(120),
  customerSignatoryDesignation: optionalText(120),
  customerSignedOn: optionalDate,
  issuerSignatoryName: optionalText(120),
  issuerSignatoryDesignation: optionalText(120),
  issuerSignedOn: optionalDate,
});

export const updateLaptopRentalAgreementSchema = startLaptopRentalSchema.pick({
  poNumber: true,
  slaHours: true,
  customerSignatoryName: true,
  customerSignatoryDesignation: true,
  customerSignedOn: true,
  issuerSignatoryName: true,
  issuerSignatoryDesignation: true,
  issuerSignedOn: true,
});

const laptopDetailFields = {
  brand: optionalText(120),
  model: optionalText(120),
  processor: optionalText(120),
  ram: optionalText(80),
  storage: optionalText(80),
  display: optionalText(80),
  operatingSystem: optionalText(80),
};

export const createLaptopRentalUnitSchema = z.object({
  assetTag: z.string().trim().min(1).max(40),
  serialNumber: z.string().trim().min(1).max(80),
  ...laptopDetailFields,
});

export const updateLaptopRentalUnitSchema = createLaptopRentalUnitSchema;

export const laptopRentalUnitDateSchema = z.object({
  on: dateOnly,
  notes: optionalText(500),
});

export const recordLaptopRentalDepositSchema = z.object({
  amount: z.coerce.number().min(0).max(100_000_000),
  on: dateOnly,
  notes: optionalText(500),
});

export const createLaptopRentalCaseSchema = z.object({
  unitId: z.string().uuid(),
  kind: z.enum(LAPTOP_RENTAL_CASE_KINDS),
  summary: z.string().trim().min(1).max(1000),
});

export const resolveLaptopRentalCaseSchema = z.object({
  resolution: z.string().trim().min(1).max(1000),
});

export const replaceLaptopRentalUnitSchema = z.object({
  assetTag: z.string().trim().min(1).max(40),
  serialNumber: z.string().trim().min(1).max(80),
  resolution: z.string().trim().min(1).max(1000),
});

export const createLaptopRentalChargeSchema = z.object({
  unitId: z.string().uuid().optional().nullable(),
  kind: z.enum(LAPTOP_RENTAL_CHARGE_KINDS),
  settlement: z.enum(LAPTOP_RENTAL_CHARGE_SETTLEMENTS),
  amount: z.coerce.number().positive().max(100_000_000),
  description: z.string().trim().min(1).max(1000),
});

export const updateLaptopRentalInvoiceSchema = z.object({
  status: z.enum(['ISSUED', 'PAID', 'VOID']),
});

export type StartLaptopRentalInput = z.infer<typeof startLaptopRentalSchema>;
export type UpdateLaptopRentalAgreementInput = z.infer<typeof updateLaptopRentalAgreementSchema>;
export type CreateLaptopRentalUnitInput = z.infer<typeof createLaptopRentalUnitSchema>;
export type UpdateLaptopRentalUnitInput = z.infer<typeof updateLaptopRentalUnitSchema>;
export type LaptopRentalUnitDateInput = z.infer<typeof laptopRentalUnitDateSchema>;
export type RecordLaptopRentalDepositInput = z.infer<typeof recordLaptopRentalDepositSchema>;
export type CreateLaptopRentalCaseInput = z.infer<typeof createLaptopRentalCaseSchema>;
export type ResolveLaptopRentalCaseInput = z.infer<typeof resolveLaptopRentalCaseSchema>;
export type ReplaceLaptopRentalUnitInput = z.infer<typeof replaceLaptopRentalUnitSchema>;
export type CreateLaptopRentalChargeInput = z.infer<typeof createLaptopRentalChargeSchema>;
export type UpdateLaptopRentalInvoiceInput = z.infer<typeof updateLaptopRentalInvoiceSchema>;

export function addCalendarMonths(isoDate: string, months: number) {
  const [year, month, day] = isoDate.split('-').map(Number) as [number, number, number];
  const targetMonth = month - 1 + months;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, targetMonth, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

export function rentalInvoicePeriods(startDate: string, months: number) {
  return Array.from({ length: months }, (_, index) =>
    addCalendarMonths(startDate, index).slice(0, 7),
  );
}

export function rentalMonthInvoice(rate: number, quantity: number, gstPercent: number) {
  const rentalAmount = roundRupees(rate * quantity);
  const gstAmount = roundRupees((rentalAmount * gstPercent) / 100);
  return { rentalAmount, gstAmount, totalAmount: roundRupees(rentalAmount + gstAmount) };
}

export function slaDueAt(reportedAt: Date, slaHours: number) {
  return new Date(reportedAt.getTime() + slaHours * 60 * 60 * 1000);
}

export function withheldDeposit(
  charges: Array<{ status: LaptopRentalChargeStatus; amount: number }>,
) {
  return roundRupees(
    charges
      .filter((charge) => charge.status === 'DEDUCTED')
      .reduce((sum, charge) => sum + charge.amount, 0),
  );
}

export function refundableDeposit(received: number, withheld: number) {
  return roundRupees(Math.max(0, received - withheld));
}

export function contractUnitCount(units: Array<{ replacesUnitId: string | null }>) {
  return units.filter((unit) => unit.replacesUnitId === null).length;
}

const ACCOUNTED_UNITS = new Set<LaptopRentalUnitStatus>([
  'PICKED_UP',
  'LOST',
  'STOLEN',
  'REPLACED',
]);

export function rentalCloseReview(input: {
  units: Array<{ status: LaptopRentalUnitStatus }>;
  cases: Array<{ status: LaptopRentalCaseStatus }>;
  charges: Array<{ status: LaptopRentalChargeStatus }>;
  invoices: Array<{ status: LaptopRentalInvoiceStatus }>;
  depositReceived: number;
  depositRefundedOn: string | null;
}) {
  const blockers: string[] = [];
  if (input.units.length === 0) blockers.push('Add the laptops before closing the rental.');
  const stillOut = input.units.filter((unit) => !ACCOUNTED_UNITS.has(unit.status)).length;
  if (stillOut > 0) {
    blockers.push(
      `${stillOut} laptop${stillOut === 1 ? ' is' : 's are'} still out with the customer.`,
    );
  }
  const openCases = input.cases.filter((item) => item.status !== 'RESOLVED').length;
  if (openCases > 0)
    blockers.push(`${openCases} support case${openCases === 1 ? ' is' : 's are'} still open.`);
  const openCharges = input.charges.filter(
    (item) => item.status === 'OPEN' || item.status === 'BILLED',
  ).length;
  if (openCharges > 0) {
    blockers.push(
      `${openCharges} damage or loss charge${openCharges === 1 ? ' is' : 's are'} not settled.`,
    );
  }
  const unpaid = input.invoices.filter(
    (item) => item.status === 'DRAFT' || item.status === 'ISSUED',
  ).length;
  if (unpaid > 0)
    blockers.push(`${unpaid} invoice${unpaid === 1 ? ' is' : 's are'} not paid or void.`);
  if (input.depositReceived > 0 && !input.depositRefundedOn) {
    blockers.push('Record the security deposit refund.');
  }
  return { canClose: blockers.length === 0, blockers };
}

export function agreementIsActive(input: {
  customerSignedOn: string | null;
  issuerSignedOn: string | null;
}) {
  return Boolean(input.customerSignedOn && input.issuerSignedOn);
}

export type LaptopRentalUnitView = {
  id: string;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  display: string | null;
  operatingSystem: string | null;
  status: LaptopRentalUnitStatus;
  deliveredOn: string | null;
  pickedUpOn: string | null;
  replacesUnitId: string | null;
  notes: string | null;
};

export type LaptopRentalInvoiceView = {
  id: string;
  invoiceNumber: string;
  kind: LaptopRentalInvoiceKind;
  period: string;
  rentalAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: LaptopRentalInvoiceStatus;
  issuedOn: string | null;
  paidOn: string | null;
};

export type LaptopRentalCaseView = {
  id: string;
  unitId: string;
  assetTag: string;
  kind: LaptopRentalCaseKind;
  status: LaptopRentalCaseStatus;
  summary: string;
  resolution: string | null;
  reportedAt: string;
  dueAt: string;
  resolvedAt: string | null;
  overdue: boolean;
};

export type LaptopRentalChargeView = {
  id: string;
  unitId: string | null;
  assetTag: string | null;
  kind: LaptopRentalChargeKind;
  settlement: LaptopRentalChargeSettlement;
  amount: number;
  description: string;
  status: LaptopRentalChargeStatus;
  reportedOn: string;
};

export type LaptopRentalServiceView = {
  proposal: {
    id: string;
    proposalNumber: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED';
    customerCompanyName: string;
    quantity: number;
    commitmentMonths: number;
    commitmentRate: number;
    gstPercent: number;
    depositPerLaptop: number;
    depositTotal: number;
    monthlyRental: number;
    monthlyGst: number;
    monthlyTotal: number;
    deliveryLocation: string;
    brand: string;
    processor: string;
    ram: string;
    storage: string;
    display: string;
    operatingSystem: string;
    issuerName: string;
    issuerAddress: string | null;
    issuerPhone: string | null;
    issuerEmail: string | null;
    issuerGstin: string | null;
  };
  agreement: null | {
    id: string;
    agreementNumber: string;
    status: LaptopRentalAgreementStatus;
    poNumber: string | null;
    startDate: string;
    endDate: string;
    slaHours: number;
    customerSignatoryName: string | null;
    customerSignatoryDesignation: string | null;
    customerSignedOn: string | null;
    issuerSignatoryName: string | null;
    issuerSignatoryDesignation: string | null;
    issuerSignedOn: string | null;
    depositExpected: number;
    depositReceived: number;
    depositReceivedOn: string | null;
    depositRefunded: number;
    depositRefundedOn: string | null;
    depositWithheld: number;
    depositRefundable: number;
    depositNotes: string | null;
    units: LaptopRentalUnitView[];
    invoices: LaptopRentalInvoiceView[];
    cases: LaptopRentalCaseView[];
    charges: LaptopRentalChargeView[];
    canClose: boolean;
    closeBlockers: string[];
  };
};
