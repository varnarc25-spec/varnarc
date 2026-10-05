import { z } from 'zod';

export const CRM_ACTIVITY_KINDS = ['NOTE', 'CALL', 'MEETING', 'EMAIL'] as const;
export type CrmActivityKind = (typeof CRM_ACTIVITY_KINDS)[number];

export const CRM_LAPTOP_STATUSES = ['AVAILABLE', 'RESERVED', 'RENTED', 'RETIRED'] as const;
export type CrmLaptopStatus = (typeof CRM_LAPTOP_STATUSES)[number];

export const CRM_LAPTOP_STATUS_LABELS: Record<CrmLaptopStatus, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  RENTED: 'Rented',
  RETIRED: 'Retired',
};

export const CRM_LAPTOP_CATEGORIES = ['WINDOWS_LAPTOP', 'APPLE_LAPTOP'] as const;
export type CrmLaptopCategory = (typeof CRM_LAPTOP_CATEGORIES)[number];

export const CRM_LAPTOP_CATEGORY_LABELS: Record<CrmLaptopCategory, string> = {
  WINDOWS_LAPTOP: 'Windows laptop',
  APPLE_LAPTOP: 'Apple laptop',
};

export const CRM_LAPTOP_AVAILABILITY = ['IN_STOCK', 'OUT_OF_STOCK', 'VARIES'] as const;
export type CrmLaptopAvailability = (typeof CRM_LAPTOP_AVAILABILITY)[number];

export const CRM_LAPTOP_AVAILABILITY_LABELS: Record<CrmLaptopAvailability, string> = {
  IN_STOCK: 'In stock',
  OUT_OF_STOCK: 'Out of stock',
  VARIES: 'Check availability',
};

export const CRM_ACTIVITY_KIND_LABELS: Record<CrmActivityKind, string> = {
  NOTE: 'Note',
  CALL: 'Call',
  MEETING: 'Meeting',
  EMAIL: 'Email',
};

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
  .max(200)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    'Enter a valid email.',
  );

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

export const crmCompanySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: optionalEmail,
  phone: optionalText(40),
  address: optionalText(500),
  city: optionalText(80),
  gstin: optionalGstin,
  website: optionalText(200),
  notes: optionalText(2000),
});

export const crmContactSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  designation: optionalText(120),
  email: optionalEmail,
  phone: optionalText(40),
  isPrimary: z.boolean().optional().default(false),
});

export const crmActivitySchema = z.object({
  companyId: z.string().uuid(),
  proposalId: z.string().uuid().optional().nullable(),
  kind: z.enum(CRM_ACTIVITY_KINDS).default('NOTE'),
  body: z.string().trim().min(1).max(4000),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CrmCompanyInput = z.infer<typeof crmCompanySchema>;
export type CrmContactInput = z.infer<typeof crmContactSchema>;
export type CrmActivityInput = z.infer<typeof crmActivitySchema>;

const optionalYear = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(1990).max(2100).nullable(),
);

const optionalMoney = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : value),
  z.coerce.number().min(0).max(10_000_000).nullable(),
);

export const crmLaptopSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: optionalText(120),
  category: z.enum(CRM_LAPTOP_CATEGORIES),
  brand: z.string().trim().min(1).max(120),
  model: optionalText(120),
  listedYear: optionalYear,
  generation: optionalText(40),
  processor: z.string().trim().min(1).max(120),
  processorFull: optionalText(200),
  ram: optionalText(200),
  storage: optionalText(200),
  display: optionalText(200),
  graphics: optionalText(200),
  camera: z.boolean().default(false),
  operatingSystem: z.string().trim().min(1).max(80),
  modelNumber: optionalText(200),
  ports: optionalText(300),
  adapter: optionalText(80),
  useCase: optionalText(300),
  condition: optionalText(200),
  notes: optionalText(2000),
  assetTag: optionalText(40),
  serialNumber: optionalText(80),
  monthlyRate: optionalMoney,
  commitmentMonths: z.coerce.number().int().min(1).max(60),
  commitmentRate: z.coerce.number().min(0).max(10_000_000),
  gstPercent: z.coerce.number().min(0).max(100),
  depositPerLaptop: z.coerce.number().min(0).max(10_000_000),
  taxesNote: optionalText(300),
  availability: z.enum(CRM_LAPTOP_AVAILABILITY).default('IN_STOCK'),
  status: z.enum(CRM_LAPTOP_STATUSES).default('AVAILABLE'),
});

export type CrmLaptopInput = z.infer<typeof crmLaptopSchema>;

export const crmRentalDiscountsSchema = z
  .object({
    tiers: z
      .array(
        z.object({
          months: z.coerce.number().int().min(1).max(60),
          percent: z.coerce.number().min(0).max(100),
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<number>();
    value.tiers.forEach((tier, index) => {
      if (seen.has(tier.months)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Each commitment length can appear once',
          path: ['tiers', index, 'months'],
        });
      }
      seen.add(tier.months);
    });
  });

export type CrmRentalDiscountsInput = z.infer<typeof crmRentalDiscountsSchema>;

export type CrmLaptopView = {
  id: string;
  name: string;
  slug: string | null;
  category: CrmLaptopCategory;
  assetTag: string | null;
  serialNumber: string | null;
  brand: string;
  model: string | null;
  listedYear: number | null;
  generation: string | null;
  processor: string;
  processorFull: string | null;
  ram: string | null;
  storage: string | null;
  display: string | null;
  graphics: string | null;
  camera: boolean;
  operatingSystem: string;
  modelNumber: string | null;
  ports: string | null;
  adapter: string | null;
  useCase: string | null;
  condition: string | null;
  notes: string | null;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  taxesNote: string | null;
  availability: CrmLaptopAvailability;
  status: CrmLaptopStatus;
  proposalId: string | null;
  proposalNumber: string | null;
};

export type CrmCompanyView = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  gstin: string | null;
  website: string | null;
  notes: string | null;
  contactCount: number;
  proposalCount: number;
};

export type CrmContactView = {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export type CrmActivityView = {
  id: string;
  companyId: string;
  proposalId: string | null;
  kind: CrmActivityKind;
  body: string;
  occurredOn: string;
};

export type CrmDashboard = {
  companies: number;
  contacts: number;
  proposals: { draft: number; sent: number; accepted: number; declined: number };
  activeRentals: number;
  pendingSignatures: number;
  openInvoices: number;
  openInvoiceTotal: number;
};

export type CrmRentalSummary = {
  id: string;
  agreementNumber: string;
  status: 'PENDING_SIGNATURE' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  proposalId: string;
  proposalNumber: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  quantity: number;
};
