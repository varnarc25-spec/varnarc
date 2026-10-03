import { z } from 'zod';

export const hrEmployeeStatusSchema = z.enum(['ACTIVE', 'ON_LEAVE', 'EXITED']);
export const hrLeaveTypeSchema = z.enum(['ANNUAL', 'SICK', 'UNPAID']);
export const hrLeaveStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .nullable();

export const createHrDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: z.string().trim().max(40).optional().nullable(),
});

export const createHrEmployeeSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z
    .union([z.string().trim().email().max(200), z.literal('')])
    .optional()
    .nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  jobTitle: z.string().trim().min(1).max(120),
  departmentId: z.string().uuid().optional().nullable(),
  status: hrEmployeeStatusSchema.default('ACTIVE'),
  joinedOn: dateOnly,
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateHrEmployeeSchema = createHrEmployeeSchema.partial();

export const createHrLeaveSchema = z
  .object({
    employeeId: z.string().uuid(),
    leaveType: hrLeaveTypeSchema,
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().trim().max(1000).optional().nullable(),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: 'End date must be on or after the start date.',
    path: ['endDate'],
  });

export const updateHrLeaveSchema = z.object({
  status: hrLeaveStatusSchema,
});

export type CreateHrDepartmentInput = z.infer<typeof createHrDepartmentSchema>;
export type CreateHrEmployeeInput = z.infer<typeof createHrEmployeeSchema>;
export type UpdateHrEmployeeInput = z.infer<typeof updateHrEmployeeSchema>;
export type CreateHrLeaveInput = z.infer<typeof createHrLeaveSchema>;
export type UpdateHrLeaveInput = z.infer<typeof updateHrLeaveSchema>;

const optionalUuid = z.string().uuid().optional().nullable();
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const money = z.coerce.number().min(0).max(100_000_000);

export const createHrOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  code: optionalText(40),
  kind: z.enum(['COMPANY', 'BRANCH', 'UNIT']).default('UNIT'),
  parentId: optionalUuid,
});

export const createHrExitSchema = z.object({
  employeeId: z.string().uuid(),
  lastWorkingDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(1).max(240),
  notes: optionalText(2000),
});

export const updateHrStatusSchema = z.object({
  status: z.string().trim().min(1).max(40),
  result: optionalText(240),
});

export const createHrOpeningSchema = z.object({
  title: z.string().trim().min(1).max(160),
  departmentId: optionalUuid,
  location: optionalText(120),
  openings: z.coerce.number().int().min(1).max(500).default(1),
  description: optionalText(4000),
});

export const createHrCandidateSchema = z.object({
  openingId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(160),
  email: z
    .union([z.string().trim().email().max(200), z.literal('')])
    .optional()
    .nullable(),
  phone: optionalText(40),
});

export const createHrInterviewSchema = z.object({
  candidateId: z.string().uuid(),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)),
  interviewer: z.string().trim().min(1).max(160),
  notes: optionalText(2000),
});

export const createHrAssetMasterSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
});

export const createHrAssetSchema = z.object({
  masterId: z.string().uuid(),
});

export const assignHrAssetSchema = z.object({
  employeeId: optionalUuid,
});

export const createHrFolderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  parentId: optionalUuid,
});

export const createHrDocumentTypeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: optionalText(40),
});

export const createHrDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  folderId: optionalUuid,
  typeId: optionalUuid,
  employeeId: optionalUuid,
  reference: optionalText(500),
});

export const createHrAccountSchema = z.object({
  employeeId: z.string().uuid(),
  email: z.string().trim().email().max(200),
});

export const createHrSessionSchema = z.object({
  accountId: z.string().uuid(),
  ipAddress: optionalText(64),
});

export const createHrEssRequestSchema = z.object({
  employeeId: z.string().uuid(),
  requestType: z.enum(['LEAVE', 'ATTENDANCE', 'DOCUMENT', 'OTHER']),
  subject: z.string().trim().min(1).max(200),
  details: optionalText(2000),
});

export const createHrAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(4000),
  publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createHrNotificationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
});

export const createHrRoleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: optionalText(400),
});

export const assignHrRoleSchema = z.object({
  roleId: z.string().uuid(),
  employeeId: z.string().uuid(),
});

export const createHrClientSchema = z.object({
  name: z.string().trim().min(1).max(160),
});

export const assignHrClientSchema = z.object({
  clientId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: dateOnly,
});

export const upsertHrSalarySchema = z.object({
  employeeId: z.string().uuid(),
  basic: money,
  hra: money.default(0),
  allowances: money.default(0),
  deductions: money.default(0),
});

export const generateHrPayrollSchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

export type CreateHrOrganizationInput = z.infer<typeof createHrOrganizationSchema>;
export type CreateHrExitInput = z.infer<typeof createHrExitSchema>;
export type UpdateHrStatusInput = z.infer<typeof updateHrStatusSchema>;
export type CreateHrOpeningInput = z.infer<typeof createHrOpeningSchema>;
export type CreateHrCandidateInput = z.infer<typeof createHrCandidateSchema>;
export type CreateHrInterviewInput = z.infer<typeof createHrInterviewSchema>;
export type CreateHrAssetMasterInput = z.infer<typeof createHrAssetMasterSchema>;
export type CreateHrAssetInput = z.infer<typeof createHrAssetSchema>;
export type AssignHrAssetInput = z.infer<typeof assignHrAssetSchema>;
export type CreateHrFolderInput = z.infer<typeof createHrFolderSchema>;
export type CreateHrDocumentTypeInput = z.infer<typeof createHrDocumentTypeSchema>;
export type CreateHrDocumentInput = z.infer<typeof createHrDocumentSchema>;
export type CreateHrAccountInput = z.infer<typeof createHrAccountSchema>;
export type CreateHrSessionInput = z.infer<typeof createHrSessionSchema>;
export type CreateHrEssRequestInput = z.infer<typeof createHrEssRequestSchema>;
export type CreateHrAnnouncementInput = z.infer<typeof createHrAnnouncementSchema>;
export type CreateHrNotificationInput = z.infer<typeof createHrNotificationSchema>;
export type CreateHrRoleInput = z.infer<typeof createHrRoleSchema>;
export type AssignHrRoleInput = z.infer<typeof assignHrRoleSchema>;
export type CreateHrClientInput = z.infer<typeof createHrClientSchema>;
export type AssignHrClientInput = z.infer<typeof assignHrClientSchema>;
export type UpsertHrSalaryInput = z.infer<typeof upsertHrSalarySchema>;
export type GenerateHrPayrollInput = z.infer<typeof generateHrPayrollSchema>;
