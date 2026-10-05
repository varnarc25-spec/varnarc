import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Repositories } from '@varnarc/database';
import type {
  ContactSettingsInput,
  EmailHrPayslipInput,
  AssignHrAssetInput,
  AssignHrClientInput,
  AssignHrRoleInput,
  CreateHrAccountInput,
  CreateHrAnnouncementInput,
  CreateHrAssetInput,
  CreateHrAssetMasterInput,
  CreateHrCandidateInput,
  CreateHrClientInput,
  CreateHrDepartmentInput,
  CreateHrDocumentInput,
  CreateHrDocumentTypeInput,
  CreateHrEmployeeInput,
  CreateHrEssRequestInput,
  CreateHrExitInput,
  CreateHrFolderInput,
  CreateHrInterviewInput,
  CreateHrLeaveInput,
  CreateHrNotificationInput,
  CreateHrOpeningInput,
  CreateHrOrganizationInput,
  CreateHrRoleInput,
  CreateHrSessionInput,
  GenerateHrPayrollInput,
  UpdateHrEmployeeInput,
  UpdateHrLeaveInput,
  UpdateHrStatusInput,
  UpsertHrSalaryInput,
  CreateLaptopRentalProposalInput,
  LaptopRentalDocumentInput,
  LaptopRentalProposalSummary,
  LaptopRentalProposalView,
  LaptopRentalStatus,
  UpdateLaptopRentalProposalInput,
} from '@varnarc/validation';
import {
  buildLaptopRentalDocument,
  DEFAULT_RENTAL_DISCOUNTS,
  quoteLaptopRental,
  quoteLaptopSelection,
  rateForCommitment,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';
import { formatCompanyAddress, SettingsService } from '../settings/settings.service';

function dateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function salaryAmount(value: number | '' | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function hasSalaryInput(input: {
  basic?: number | '' | null;
  hra?: number | '' | null;
  specialAllowance?: number | '' | null;
  leaveTravelAllowance?: number | '' | null;
  professionalTax?: number | '' | null;
  providentFund?: number | '' | null;
}): boolean {
  return [
    input.basic,
    input.hra,
    input.specialAllowance,
    input.leaveTravelAllowance,
    input.professionalTax,
    input.providentFund,
  ].some((value) => value !== undefined && value !== '' && value !== null);
}

function hikePercentage(value: number | '' | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

async function logoDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > 2_000_000) return null;
    return `data:${type.split(';')[0]};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

function plainMoney(value: { toString(): string } | number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function dateTime(value: string): Date {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const hasZone = withSeconds.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(withSeconds);
  return new Date(hasZone ? withSeconds : `${withSeconds}Z`);
}

async function found<T>(work: Promise<T>, message: string): Promise<T> {
  try {
    return await work;
  } catch {
    throw new NotFoundException(message);
  }
}

function payslipPdf(value: string) {
  const comma = value.indexOf(',');
  const encoded = value.startsWith('data:') && comma >= 0 ? value.slice(comma + 1) : value;
  const raw = encoded.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(raw)) {
    throw new BadRequestException('The payslip file is not a valid PDF.');
  }
  const bytes = Buffer.from(raw, 'base64');
  if (
    bytes.length < 32 ||
    bytes.length > 2_000_000 ||
    bytes.subarray(0, 5).toString('latin1') !== '%PDF-'
  ) {
    throw new BadRequestException('The payslip file is not a valid PDF.');
  }
  return bytes;
}

function periodLabel(period: string) {
  const [year, month] = period.split('-');
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function filePart(value: string) {
  const slug = value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]+/g, '');
  return slug || 'employee';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function mailboxFrom(fromEmail: string | null | undefined, mailbox: string | null) {
  const configured =
    fromEmail?.trim() ||
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    '';
  if (mailbox?.includes('@')) {
    if (configured.toLowerCase().includes(mailbox.toLowerCase())) return configured;
    return `Varnarc <${mailbox}>`;
  }
  return configured || null;
}

function rupees(value: { toString(): string } | number | string) {
  const amount = Number(value);
  const shown = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${shown.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function payslipLines(slip: {
  basic: { toString(): string } | number | string;
  hra: { toString(): string } | number | string;
  leaveTravelAllowance: { toString(): string } | number | string;
  specialAllowance: { toString(): string } | number | string;
  providentFund: { toString(): string } | number | string;
  professionalTax: { toString(): string } | number | string;
  grossPay: { toString(): string } | number | string;
  deductions: { toString(): string } | number | string;
  netPay: { toString(): string } | number | string;
}) {
  return [
    ['Basic salary', rupees(slip.basic)],
    ['House rent allowance', rupees(slip.hra)],
    ['Leave travel allowance', rupees(slip.leaveTravelAllowance)],
    ['Special allowance', rupees(slip.specialAllowance)],
    ['Provident fund', rupees(slip.providentFund)],
    ['Professional tax', rupees(slip.professionalTax)],
    ['Gross pay', rupees(slip.grossPay)],
    ['Deductions', rupees(slip.deductions)],
    ['Net pay', rupees(slip.netPay)],
  ] as const;
}

function payslipEmailText(
  slip: Parameters<typeof payslipLines>[0] & { employee: { fullName: string } },
  month: string,
  companyName: string,
) {
  return [
    `Hello ${slip.employee.fullName},`,
    '',
    `Your payslip for ${month} is below.`,
    '',
    ...payslipLines(slip).map(([label, amount]) => `${label}: ${amount}`),
    '',
    companyName,
  ].join('\n');
}

function payslipEmailHtml(
  slip: Parameters<typeof payslipLines>[0] & { employee: { fullName: string } },
  month: string,
  companyName: string,
) {
  const rows = payslipLines(slip)
    .map(
      ([label, amount]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(label)}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;">${escapeHtml(amount)}</td></tr>`,
    )
    .join('');
  return `<p>Hello ${escapeHtml(slip.employee.fullName)},</p><p>Your payslip for ${escapeHtml(month)} is below.</p><table style="border-collapse:collapse;">${rows}</table><p>${escapeHtml(companyName)}</p>`;
}

function payslipDelivery(contact: ContactSettingsInput) {
  const provider = contact.emailProvider ?? 'resend';
  if (provider === 'smtp') {
    const host = process.env.SMTP_HOST?.trim() || contact.smtpHost?.trim() || null;
    const username = process.env.SMTP_USERNAME?.trim() || contact.smtpUsername?.trim() || null;
    const password = process.env.SMTP_PASSWORD?.trim() || contact.smtpPassword?.trim() || null;
    const from = mailboxFrom(contact.fromEmail, username);
    if (!host || !from) return null;
    return {
      provider: 'smtp' as const,
      from,
      smtp: {
        host,
        port: Number(process.env.SMTP_PORT || contact.smtpPort || 587),
        secure:
          process.env.SMTP_SECURE !== undefined
            ? process.env.SMTP_SECURE === 'true'
            : Boolean(contact.smtpSecure),
        username,
        password,
      },
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim() || contact.resendApiKey?.trim() || null;
  const from = mailboxFrom(contact.fromEmail, null);
  if (!apiKey || !from) return null;
  return { provider: 'resend' as const, from, apiKey };
}

async function sendPayslipSmtp(input: {
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  password: string | null;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  fileName: string;
  pdf: Buffer;
}) {
  const transporter = nodemailer.createTransport({
    host: input.host,
    port: input.port,
    secure: input.secure,
    auth:
      input.username && input.password ? { user: input.username, pass: input.password } : undefined,
  });
  try {
    await transporter.sendMail({
      from: input.from,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments:
        input.pdf.length > 0
          ? [
              {
                filename: input.fileName,
                content: input.pdf,
                contentType: 'application/pdf',
              },
            ]
          : undefined,
    });
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP delivery failed';
    return { ok: false as const, error: message.slice(0, 300) };
  }
}

async function sendPayslipResend(input: {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  fileName: string;
  pdfBase64: string;
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments:
        input.pdfBase64.length > 0
          ? [{ filename: input.fileName, content: input.pdfBase64 }]
          : undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false as const, error: body.slice(0, 300) || `HTTP ${res.status}` };
  }
  return { ok: true as const };
}

@Injectable()
export class HrService {
  constructor(
    @Inject(REPOS) private readonly repos: Repositories,
    private readonly settings: SettingsService,
  ) {}

  async summary() {
    const [departments, activeEmployees, employees, pendingLeave] = await this.repos.hr.summary();
    return { departments, activeEmployees, employees, pendingLeave };
  }

  listDepartments() {
    return this.repos.hr.listDepartments();
  }

  createDepartment(input: CreateHrDepartmentInput) {
    return this.repos.hr.createDepartment({
      name: input.name,
      code: blankToNull(input.code)?.toUpperCase() ?? null,
    });
  }

  async listEmployees() {
    const rows = await this.repos.hr.listEmployees();
    return rows.map((row) => ({
      ...row,
      salary: row.salary
        ? {
            basic: plainMoney(row.salary.basic),
            hra: plainMoney(row.salary.hra),
            specialAllowance: plainMoney(row.salary.specialAllowance),
            leaveTravelAllowance: plainMoney(row.salary.leaveTravelAllowance),
            professionalTax: plainMoney(row.salary.professionalTax),
            providentFund: plainMoney(row.salary.providentFund),
          }
        : null,
      salaryHikes: row.salaryHikes.map((hike) => ({
        id: hike.id,
        effectiveOn: hike.effectiveOn,
        percentage: plainMoney(hike.percentage),
        previousBasic: plainMoney(hike.previousBasic),
        previousHra: plainMoney(hike.previousHra),
        previousSpecialAllowance: plainMoney(hike.previousSpecialAllowance),
        previousLeaveTravelAllowance: plainMoney(hike.previousLeaveTravelAllowance),
        previousProfessionalTax: plainMoney(hike.previousProfessionalTax),
        previousProvidentFund: plainMoney(hike.previousProvidentFund),
        basic: plainMoney(hike.basic),
        hra: plainMoney(hike.hra),
        specialAllowance: plainMoney(hike.specialAllowance),
        leaveTravelAllowance: plainMoney(hike.leaveTravelAllowance),
        professionalTax: plainMoney(hike.professionalTax),
        providentFund: plainMoney(hike.providentFund),
        notes: hike.notes,
      })),
    }));
  }

  async createEmployee(input: CreateHrEmployeeInput) {
    const count = await this.repos.hr.nextEmployeeCode();
    const employeeCode = `EMP-${String(count + 1).padStart(4, '0')}`;
    const employee = await this.repos.hr.createEmployee({
      employeeCode,
      fullName: input.fullName,
      email: blankToNull(input.email),
      phone: blankToNull(input.phone),
      jobTitle: input.jobTitle,
      departmentId: input.departmentId ?? null,
      status: input.status,
      joinedOn: dateOnly(input.joinedOn),
      dateOfBirth: dateOnly(input.dateOfBirth),
      pan: blankToNull(input.pan)?.toUpperCase() ?? null,
      bankAccountNo: blankToNull(input.bankAccountNo),
      ifscCode: blankToNull(input.ifscCode)?.toUpperCase() ?? null,
      taxRegime: input.taxRegime,
      notes: blankToNull(input.notes),
    });
    if (hasSalaryInput(input)) {
      await this.repos.hr.upsertSalary({
        employeeId: employee.id,
        basic: salaryAmount(input.basic),
        hra: salaryAmount(input.hra),
        specialAllowance: salaryAmount(input.specialAllowance),
        leaveTravelAllowance: salaryAmount(input.leaveTravelAllowance),
        professionalTax: salaryAmount(input.professionalTax),
        providentFund: salaryAmount(input.providentFund),
      });
    }
    return employee;
  }

  async updateEmployee(id: string, input: UpdateHrEmployeeInput) {
    let employee;
    try {
      employee = await this.repos.hr.updateEmployee(id, {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.email !== undefined ? { email: blankToNull(input.email) } : {}),
        ...(input.phone !== undefined ? { phone: blankToNull(input.phone) } : {}),
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.joinedOn !== undefined ? { joinedOn: dateOnly(input.joinedOn) } : {}),
        ...(input.dateOfBirth !== undefined ? { dateOfBirth: dateOnly(input.dateOfBirth) } : {}),
        ...(input.pan !== undefined ? { pan: blankToNull(input.pan)?.toUpperCase() ?? null } : {}),
        ...(input.bankAccountNo !== undefined
          ? { bankAccountNo: blankToNull(input.bankAccountNo) }
          : {}),
        ...(input.ifscCode !== undefined
          ? { ifscCode: blankToNull(input.ifscCode)?.toUpperCase() ?? null }
          : {}),
        ...(input.taxRegime !== undefined ? { taxRegime: input.taxRegime } : {}),
        ...(input.notes !== undefined ? { notes: blankToNull(input.notes) } : {}),
      });
    } catch {
      throw new NotFoundException('Employee not found');
    }
    const percentage = hikePercentage(input.hikePercentage);
    if (percentage != null) {
      if (!input.hikeEffectiveOn) {
        throw new BadRequestException('Enter the date this hike takes effect.');
      }
      const previous = {
        basic: salaryAmount(input.basic),
        hra: salaryAmount(input.hra),
        specialAllowance: salaryAmount(input.specialAllowance),
        leaveTravelAllowance: salaryAmount(input.leaveTravelAllowance),
        professionalTax: salaryAmount(input.professionalTax),
        providentFund: salaryAmount(input.providentFund),
      };
      const next = {
        basic: roundMoney(previous.basic * (1 + percentage / 100)),
        hra: roundMoney(previous.hra * (1 + percentage / 100)),
        specialAllowance: roundMoney(previous.specialAllowance * (1 + percentage / 100)),
        leaveTravelAllowance: roundMoney(previous.leaveTravelAllowance * (1 + percentage / 100)),
        professionalTax: previous.professionalTax,
        providentFund: previous.providentFund,
      };
      await this.repos.hr.upsertSalary({ employeeId: id, ...next });
      await this.repos.hr.createSalaryHike({
        employeeId: id,
        effectiveOn: dateOnly(input.hikeEffectiveOn) ?? new Date(),
        percentage,
        previousBasic: previous.basic,
        previousHra: previous.hra,
        previousSpecialAllowance: previous.specialAllowance,
        previousLeaveTravelAllowance: previous.leaveTravelAllowance,
        previousProfessionalTax: previous.professionalTax,
        previousProvidentFund: previous.providentFund,
        ...next,
        notes: blankToNull(input.hikeNotes),
      });
    } else if (hasSalaryInput(input)) {
      await this.repos.hr.upsertSalary({
        employeeId: id,
        basic: salaryAmount(input.basic),
        hra: salaryAmount(input.hra),
        specialAllowance: salaryAmount(input.specialAllowance),
        leaveTravelAllowance: salaryAmount(input.leaveTravelAllowance),
        professionalTax: salaryAmount(input.professionalTax),
        providentFund: salaryAmount(input.providentFund),
      });
    }
    return employee;
  }

  async deleteEmployee(id: string) {
    try {
      await this.repos.hr.softDeleteEmployee(id);
    } catch {
      throw new NotFoundException('Employee not found');
    }
  }

  listLeave() {
    return this.repos.hr.listLeave();
  }

  createLeave(input: CreateHrLeaveInput) {
    return this.repos.hr.createLeave({
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      startDate: dateOnly(input.startDate) as Date,
      endDate: dateOnly(input.endDate) as Date,
      reason: blankToNull(input.reason),
    });
  }

  async updateLeave(id: string, input: UpdateHrLeaveInput) {
    return found(this.repos.hr.updateLeaveStatus(id, input.status), 'Leave request not found');
  }

  async reports() {
    const [
      employees,
      activeEmployees,
      openExits,
      openJobs,
      candidates,
      assets,
      assignedAssets,
      pendingLeave,
      openEss,
      payslips,
      unreadNotifications,
    ] = await this.repos.hr.reports();
    return {
      employees,
      activeEmployees,
      openExits,
      openJobs,
      candidates,
      assets,
      assignedAssets,
      pendingLeave,
      openEss,
      payslips,
      unreadNotifications,
    };
  }

  listOrganizations() {
    return this.repos.hr.listOrganizations();
  }

  createOrganization(input: CreateHrOrganizationInput) {
    return this.repos.hr.createOrganization({
      name: input.name,
      code: blankToNull(input.code)?.toUpperCase() ?? null,
      kind: input.kind,
      parentId: input.parentId ?? null,
    });
  }

  listExits() {
    return this.repos.hr.listExits();
  }

  createExit(input: CreateHrExitInput) {
    return this.repos.hr.createExit({
      employeeId: input.employeeId,
      lastWorkingDay: dateOnly(input.lastWorkingDay) as Date,
      reason: input.reason,
      notes: blankToNull(input.notes),
    });
  }

  updateExit(id: string, input: UpdateHrStatusInput) {
    return found(this.repos.hr.updateExitStatus(id, input.status), 'Exit record not found');
  }

  listOpenings() {
    return this.repos.hr.listOpenings();
  }

  createOpening(input: CreateHrOpeningInput) {
    return this.repos.hr.createOpening({
      title: input.title,
      departmentId: input.departmentId ?? null,
      location: blankToNull(input.location),
      openings: input.openings,
      description: blankToNull(input.description),
    });
  }

  updateOpening(id: string, input: UpdateHrStatusInput) {
    return found(this.repos.hr.updateOpeningStatus(id, input.status), 'Job opening not found');
  }

  listCandidates() {
    return this.repos.hr.listCandidates();
  }

  createCandidate(input: CreateHrCandidateInput) {
    return this.repos.hr.createCandidate({
      openingId: input.openingId,
      fullName: input.fullName,
      email: blankToNull(input.email),
      phone: blankToNull(input.phone),
    });
  }

  updateCandidate(id: string, input: UpdateHrStatusInput) {
    return found(this.repos.hr.updateCandidateStatus(id, input.status), 'Candidate not found');
  }

  listInterviews() {
    return this.repos.hr.listInterviews();
  }

  createInterview(input: CreateHrInterviewInput) {
    return this.repos.hr.createInterview({
      candidateId: input.candidateId,
      scheduledAt: dateTime(input.scheduledAt),
      interviewer: input.interviewer,
      notes: blankToNull(input.notes),
    });
  }

  updateInterview(id: string, input: UpdateHrStatusInput) {
    return found(
      this.repos.hr.updateInterview(id, {
        status: input.status,
        result: blankToNull(input.result),
      }),
      'Interview not found',
    );
  }

  listAssetMasters() {
    return this.repos.hr.listAssetMasters();
  }

  createAssetMaster(input: CreateHrAssetMasterInput) {
    return this.repos.hr.createAssetMaster(input);
  }

  listAssets() {
    return this.repos.hr.listAssets();
  }

  async createAsset(input: CreateHrAssetInput) {
    const count = await this.repos.hr.nextAssetTag();
    return this.repos.hr.createAsset({
      masterId: input.masterId,
      assetTag: `AST-${String(count + 1).padStart(4, '0')}`,
    });
  }

  assignAsset(id: string, input: AssignHrAssetInput) {
    const employeeId = input.employeeId ?? null;
    return found(
      this.repos.hr.assignAsset(
        id,
        employeeId,
        employeeId ? new Date() : null,
        employeeId ? 'ASSIGNED' : 'AVAILABLE',
      ),
      'Asset not found',
    );
  }

  listFolders() {
    return this.repos.hr.listFolders();
  }

  createFolder(input: CreateHrFolderInput) {
    return this.repos.hr.createFolder({ name: input.name, parentId: input.parentId ?? null });
  }

  listDocumentTypes() {
    return this.repos.hr.listDocumentTypes();
  }

  createDocumentType(input: CreateHrDocumentTypeInput) {
    return this.repos.hr.createDocumentType({
      name: input.name,
      code: blankToNull(input.code)?.toUpperCase() ?? null,
    });
  }

  listDocuments() {
    return this.repos.hr.listDocuments();
  }

  createDocument(input: CreateHrDocumentInput) {
    return this.repos.hr.createDocument({
      title: input.title,
      folderId: input.folderId ?? null,
      typeId: input.typeId ?? null,
      employeeId: input.employeeId ?? null,
      reference: blankToNull(input.reference),
    });
  }

  listAccounts() {
    return this.repos.hr.listAccounts();
  }

  createAccount(input: CreateHrAccountInput) {
    return this.repos.hr.createAccount({ employeeId: input.employeeId, email: input.email });
  }

  updateAccount(id: string, input: UpdateHrStatusInput) {
    return found(this.repos.hr.updateAccountStatus(id, input.status), 'Account not found');
  }

  listSessions() {
    return this.repos.hr.listSessions();
  }

  createSession(input: CreateHrSessionInput) {
    return this.repos.hr.createSession({
      accountId: input.accountId,
      ipAddress: blankToNull(input.ipAddress),
    });
  }

  endSession(id: string) {
    return found(this.repos.hr.endSession(id), 'Session not found');
  }

  listEssRequests() {
    return this.repos.hr.listEssRequests();
  }

  createEssRequest(input: CreateHrEssRequestInput) {
    return this.repos.hr.createEssRequest({
      employeeId: input.employeeId,
      requestType: input.requestType,
      subject: input.subject,
      details: blankToNull(input.details),
    });
  }

  updateEss(id: string, input: UpdateHrStatusInput) {
    return found(this.repos.hr.updateEssStatus(id, input.status), 'Request not found');
  }

  listAnnouncements() {
    return this.repos.hr.listAnnouncements();
  }

  createAnnouncement(input: CreateHrAnnouncementInput) {
    return this.repos.hr.createAnnouncement({
      title: input.title,
      body: input.body,
      publishedOn: dateOnly(input.publishedOn) as Date,
    });
  }

  listNotifications() {
    return this.repos.hr.listNotifications();
  }

  createNotification(input: CreateHrNotificationInput) {
    return this.repos.hr.createNotification(input);
  }

  markNotificationRead(id: string) {
    return found(this.repos.hr.markNotificationRead(id), 'Notification not found');
  }

  listRoles() {
    return this.repos.hr.listRoles();
  }

  createRole(input: CreateHrRoleInput) {
    return this.repos.hr.createRole({
      name: input.name,
      description: blankToNull(input.description),
    });
  }

  assignRole(input: AssignHrRoleInput) {
    return this.repos.hr.assignRole(input);
  }

  listClients() {
    return this.repos.hr.listClients();
  }

  createClient(input: CreateHrClientInput) {
    return this.repos.hr.createClient(input);
  }

  listAssignments() {
    return this.repos.hr.listAssignments();
  }

  assignClient(input: AssignHrClientInput) {
    return this.repos.hr.assignClient({
      clientId: input.clientId,
      employeeId: input.employeeId,
      startDate: dateOnly(input.startDate) as Date,
      endDate: dateOnly(input.endDate),
    });
  }

  listSalaries() {
    return this.repos.hr.listSalaries();
  }

  saveSalary(input: UpsertHrSalaryInput) {
    return this.repos.hr.upsertSalary(input);
  }

  listPayrollRuns() {
    return this.repos.hr.listPayrollRuns();
  }

  listPayslips(period?: string) {
    return this.repos.hr.listPayslips(period);
  }

  async getPayslip(id: string) {
    const slip = await this.repos.hr.getPayslip(id);
    if (!slip) throw new NotFoundException('Payslip not found');
    const company = await this.settings.getCompany();
    const ytdRows = await this.repos.hr.payslipYearToDate(slip.employeeId, slip.payrollRun.period);
    const ytd = ytdRows.reduce(
      (sum, row) => ({
        grossPay: roundMoney(sum.grossPay + Number(row.grossPay)),
        deductions: roundMoney(sum.deductions + Number(row.deductions)),
        providentFund: roundMoney(sum.providentFund + Number(row.providentFund)),
      }),
      { grossPay: 0, deductions: 0, providentFund: 0 },
    );
    return {
      ...slip,
      company: {
        phone: company.phone,
        email: company.email,
        gstin: company.gstin,
        logoDataUrl: await logoDataUrl(company.logoUrl),
      },
      ytd,
    };
  }

  async generatePayroll(input: GenerateHrPayrollInput) {
    const salaries = await this.repos.hr.listSalaries();
    const active = salaries.filter((row) => row.employee.status === 'ACTIVE');
    if (active.length === 0) {
      throw new BadRequestException(
        'Add a salary for an active employee before generating payslips.',
      );
    }
    const company = await this.settings.getCompany();
    const companyName = company.legalName?.trim() ?? '';
    if (!companyName) {
      throw new BadRequestException(
        'Add the company legal name in Settings → Company profile before generating payslips.',
      );
    }
    const result = await this.repos.hr.generatePayslips(input.period, {
      companyName,
      companyAddress: formatCompanyAddress(company) ?? '',
      generatedBy:
        blankToNull(input.generatedBy) ?? (company.payslipGeneratedBy?.trim() || 'Payroll'),
    });
    const month = periodLabel(input.period);
    const legalName = company.legalName?.trim() || companyName;
    const delivery = payslipDelivery(await this.settings.getContactRaw());
    const emailed: Array<{ name: string; email: string }> = [];
    const skipped: Array<{ name: string; reason: string }> = [];
    const failed: Array<{ name: string; error: string }> = [];

    if (!delivery) {
      return {
        runId: result.runId,
        period: result.period,
        count: result.count,
        emailed,
        skipped,
        failed,
        emailNotice:
          'Payslips were saved. Email is not set up, so nobody was emailed. In Settings → Contact, choose Google Workspace and save an App Password.',
      };
    }

    for (const slip of result.payslips) {
      const to = slip.employee.email?.trim();
      if (!to) {
        skipped.push({ name: slip.employee.fullName, reason: 'no email address' });
        continue;
      }
      const subject = `Payslip for ${month}`;
      const text = payslipEmailText(slip, month, legalName);
      const html = payslipEmailHtml(slip, month, legalName);
      const sent =
        delivery.provider === 'smtp'
          ? await sendPayslipSmtp({
              ...delivery.smtp,
              from: delivery.from,
              to,
              replyTo: company.email?.trim() || undefined,
              subject,
              text,
              html,
              fileName: '',
              pdf: Buffer.alloc(0),
            })
          : await sendPayslipResend({
              apiKey: delivery.apiKey,
              from: delivery.from,
              to,
              replyTo: company.email?.trim() || undefined,
              subject,
              text,
              html,
              fileName: '',
              pdfBase64: '',
            });
      if (!sent.ok) {
        failed.push({
          name: slip.employee.fullName,
          error: sent.error || 'Email failed',
        });
      } else {
        emailed.push({ name: slip.employee.fullName, email: to });
      }
    }

    return {
      runId: result.runId,
      period: result.period,
      count: result.count,
      emailed,
      skipped,
      failed,
      emailNotice: null,
    };
  }

  async emailPayslip(id: string, input: EmailHrPayslipInput) {
    const slip = await this.repos.hr.getPayslip(id);
    if (!slip) throw new NotFoundException('Payslip not found');
    const to = slip.employee.email?.trim();
    if (!to) {
      throw new BadRequestException(
        'Add an email address on the employee before sending the payslip.',
      );
    }

    const pdf = payslipPdf(input.pdfBase64);
    const contact = await this.settings.getContactRaw();
    const delivery = payslipDelivery(contact);
    if (!delivery) {
      throw new BadRequestException(
        'Email is not set up. In Settings → Contact, choose Google Workspace, enter business@varnarc.com, and save a Google App Password.',
      );
    }

    const company = await this.settings.getCompany();
    const month = periodLabel(slip.payrollRun.period);
    const fileName = `payslip-${slip.employee.employeeCode}-${filePart(slip.employee.fullName)}-${slip.payrollRun.period}.pdf`;
    const subject = `Payslip for ${month}`;
    const text = [
      `Hello ${slip.employee.fullName},`,
      '',
      `Your payslip for ${month} is attached.`,
      '',
      company.legalName?.trim() || slip.payrollRun.companyName,
    ].join('\n');
    const html = `<p>Hello ${escapeHtml(slip.employee.fullName)},</p><p>Your payslip for ${escapeHtml(month)} is attached.</p><p>${escapeHtml(company.legalName?.trim() || slip.payrollRun.companyName)}</p>`;

    const sent =
      delivery.provider === 'smtp'
        ? await sendPayslipSmtp({
            ...delivery.smtp,
            from: delivery.from,
            to,
            replyTo: company.email?.trim() || undefined,
            subject,
            text,
            html,
            fileName,
            pdf,
          })
        : await sendPayslipResend({
            apiKey: delivery.apiKey,
            from: delivery.from,
            to,
            replyTo: company.email?.trim() || undefined,
            subject,
            text,
            html,
            fileName,
            pdfBase64: pdf.toString('base64'),
          });

    if (!sent.ok) {
      throw new BadRequestException(sent.error || 'Could not send the payslip email.');
    }
    return { emailed: true, to };
  }

  private async rentalDiscountTiers(): Promise<RentalDiscountTier[]> {
    const rows = await this.repos.crm.listRentalDiscounts().catch(() => []);
    if (rows.length === 0) return DEFAULT_RENTAL_DISCOUNTS.map((tier) => ({ ...tier }));
    return rows.map((row) => ({ months: row.months, percent: Number(row.percent) }));
  }

  async listLaptopRentals(): Promise<LaptopRentalProposalSummary[]> {
    const rows = await this.repos.hr.listLaptopRentals();
    return rows.map(summarizeLaptopRental);
  }

  async getLaptopRental(id: string): Promise<LaptopRentalProposalView> {
    const row = await this.repos.hr.getLaptopRental(id);
    if (!row) throw new NotFoundException('Proposal not found');
    const company = await this.settings.getCompany();
    return presentLaptopRental(
      row,
      await logoDataUrl(company.logoUrl),
      await this.rentalDiscountTiers(),
    );
  }

  async createLaptopRental(input: CreateLaptopRentalProposalInput) {
    const priced = await this.priceFromLaptops(input);
    const company = await this.resolveLaptopCompany(
      priced.input.companyId,
      priced.input.customerCompanyName,
    );
    const row = await this.repos.hr.createLaptopRental(laptopRentalWrite(priced.input, company.id));
    await this.syncProposalLaptops(row.id, priced.lines);
    const saved = await this.repos.hr.getLaptopRental(row.id);
    return presentLaptopRental(saved ?? row, null, await this.rentalDiscountTiers());
  }

  async updateLaptopRental(id: string, input: UpdateLaptopRentalProposalInput) {
    const existing = await this.repos.hr.getLaptopRental(id);
    if (!existing) throw new NotFoundException('Proposal not found');
    const priced = await this.priceFromLaptops(input);
    const company = await this.resolveLaptopCompany(
      priced.input.companyId,
      priced.input.customerCompanyName,
    );
    await this.repos.hr.updateLaptopRental(id, {
      ...laptopRentalWrite(priced.input, company.id),
      status: input.status,
    });
    await this.syncProposalLaptops(id, priced.lines);
    if (input.status === 'DECLINED') await this.repos.crm.releaseReservedLaptops(id);
    const saved = await this.repos.hr.getLaptopRental(id);
    const issuer = await this.settings.getCompany();
    return presentLaptopRental(
      saved ?? existing,
      await logoDataUrl(issuer.logoUrl),
      await this.rentalDiscountTiers(),
    );
  }

  async updateLaptopRentalStatus(id: string, status: LaptopRentalStatus) {
    const existing = await this.repos.hr.getLaptopRental(id);
    if (!existing) throw new NotFoundException('Proposal not found');
    const row = await this.repos.hr.updateLaptopRentalStatus(id, status);
    if (status === 'DECLINED') await this.repos.crm.releaseReservedLaptops(id);
    else if (existing.status === 'DECLINED') {
      await this.syncProposalLaptops(
        id,
        existing.laptops.map((link) => ({
          laptopId: link.laptop.id,
          quantity: link.quantity,
          monthlyRate: Number(link.monthlyRate),
          commitmentRate: Number(link.commitmentRate),
          depositPerLaptop: Number(link.depositPerLaptop),
        })),
      );
    }
    const company = await this.settings.getCompany();
    const saved = await this.repos.hr.getLaptopRental(id);
    return presentLaptopRental(
      saved ?? row,
      await logoDataUrl(company.logoUrl),
      await this.rentalDiscountTiers(),
    );
  }

  async deleteLaptopRental(id: string) {
    const existing = await this.repos.hr.getLaptopRental(id);
    if (!existing) throw new NotFoundException('Proposal not found');
    await this.repos.crm.releaseReservedLaptops(id);
    const deleted = await this.repos.hr.deleteLaptopRental(id);
    if (!deleted) throw new NotFoundException('Proposal not found');
    return { deleted: true };
  }

  private async resolveLaptopCompany(companyId: string | null | undefined, name: string) {
    if (companyId) {
      const company = await this.repos.crm.getCompany(companyId);
      if (!company) throw new NotFoundException('Company not found');
      return company;
    }
    const existing = await this.repos.crm.findCompanyByName(name);
    if (existing) return existing;
    return this.repos.crm.createCompany({ name });
  }

  private async priceFromLaptops(input: CreateLaptopRentalProposalInput) {
    const requested = input.laptopLines.length
      ? input.laptopLines
      : input.laptopIds.map((laptopId) => ({ laptopId, quantity: 1 }));
    if (requested.length === 0)
      return { input: { ...input, laptopLines: [], laptopIds: [] }, lines: [] };
    const rows = await this.repos.crm.proposalLaptops([
      ...new Set(requested.map((line) => line.laptopId)),
    ]);
    if (rows.length !== new Set(requested.map((line) => line.laptopId)).size) {
      throw new NotFoundException('One of the selected laptops was not found.');
    }
    if (rows.some((row) => row.status === 'RETIRED')) {
      throw new BadRequestException('A retired laptop cannot be added to a proposal.');
    }
    const byId = new Map(rows.map((row) => [row.id, row]));
    const chosen = requested.map((line) => ({ line, laptop: byId.get(line.laptopId)! }));
    const first = chosen[0];
    if (!first) throw new NotFoundException('One of the selected laptops was not found.');
    const quote = quoteLaptopSelection({
      commitmentMonths: input.commitmentMonths,
      discountPercent: input.discountPercent,
      lines: chosen.map(({ line, laptop }) => ({
        monthlyRate: Number(laptop.monthlyRate ?? 0),
        commitmentRate: rateForCommitment({
          months: input.commitmentMonths,
          monthlyRate: Number(laptop.monthlyRate ?? 0),
          commitmentMonths: laptop.commitmentMonths,
          commitmentRate: Number(laptop.commitmentRate),
        }),
        depositPerLaptop: Number(laptop.depositPerLaptop),
        quantity: line.quantity,
        gstPercent: Number(laptop.gstPercent),
      })),
    });
    const joined = (values: Array<string | null | undefined>, max: number, fallback: string) => {
      const text = [...new Set(values.filter((value): value is string => Boolean(value)))].join(
        ' / ',
      );
      return (text || fallback).slice(0, max);
    };
    return {
      input: {
        ...input,
        laptopIds: chosen.map(({ line }) => line.laptopId),
        laptopLines: chosen.map(({ line }) => ({
          laptopId: line.laptopId,
          quantity: line.quantity,
        })),
        quantity: Math.max(1, quote.quantity),
        monthlyRate: quote.monthlyRate,
        commitmentRate: quote.commitmentRate,
        depositPerLaptop: quote.depositPerLaptop,
        commitmentMonths: input.commitmentMonths,
        gstPercent: Number(first.laptop.gstPercent),
        processor: joined(
          chosen.map(({ laptop }) => laptop.processor),
          120,
          input.processor,
        ),
        ram: joined(
          chosen.map(({ laptop }) => laptop.ram),
          80,
          input.ram,
        ),
        storage: joined(
          chosen.map(({ laptop }) => laptop.storage),
          80,
          input.storage,
        ),
        display: joined(
          chosen.map(({ laptop }) => laptop.display),
          80,
          input.display,
        ),
        operatingSystem: joined(
          chosen.map(({ laptop }) => laptop.operatingSystem),
          80,
          input.operatingSystem,
        ),
        brand: joined(
          chosen.map(({ laptop }) => laptop.brand),
          120,
          input.brand,
        ),
        condition: joined(
          chosen.map(({ laptop }) => laptop.condition),
          200,
          input.condition,
        ),
      },
      lines: chosen.map(({ line, laptop }) => ({
        laptopId: line.laptopId,
        quantity: line.quantity,
        monthlyRate: Number(laptop.monthlyRate ?? 0),
        commitmentRate: rateForCommitment({
          months: input.commitmentMonths,
          monthlyRate: Number(laptop.monthlyRate ?? 0),
          commitmentMonths: laptop.commitmentMonths,
          commitmentRate: Number(laptop.commitmentRate),
        }),
        depositPerLaptop: Number(laptop.depositPerLaptop),
      })),
    };
  }

  private async syncProposalLaptops(
    proposalId: string,
    lines: Array<{
      laptopId: string;
      quantity: number;
      monthlyRate: number;
      commitmentRate: number;
      depositPerLaptop: number;
    }>,
  ) {
    try {
      await this.repos.crm.replaceProposalLaptops(proposalId, lines);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'LAPTOP_MISSING')
        throw new NotFoundException('One of the selected laptops was not found.');
      if (message === 'LAPTOP_RETIRED')
        throw new BadRequestException('A retired laptop cannot be added to a proposal.');
      if (message.startsWith('LAPTOP_TAKEN:')) {
        throw new BadRequestException(
          `These laptops are already on another proposal: ${message.slice('LAPTOP_TAKEN:'.length)}`,
        );
      }
      throw error;
    }
  }
}

type LaptopRentalRow = {
  id: string;
  proposalNumber: string;
  status: LaptopRentalStatus;
  companyId: string;
  customerCompanyName: string;
  proposalDate: Date;
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
  monthlyRate: { toString(): string } | number | string;
  commitmentMonths: number;
  commitmentRate: { toString(): string } | number | string;
  gstPercent: { toString(): string } | number | string;
  depositPerLaptop: { toString(): string } | number | string;
  discountPercent: { toString(): string } | number | string;
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
  company: { id: string; name: string };
  laptops: Array<{
    quantity: number;
    monthlyRate: { toString(): string } | number | string;
    commitmentRate: { toString(): string } | number | string;
    depositPerLaptop: { toString(): string } | number | string;
    laptop: {
      id: string;
      name: string;
      assetTag: string | null;
      serialNumber: string | null;
      brand: string;
      model: string | null;
      processor: string;
      ram: string | null;
      storage: string | null;
      display: string | null;
      operatingSystem: string;
      gstPercent?: { toString(): string } | number | string;
      deletedAt: Date | null;
    };
  }>;
};

function proposalLaptopLinks(row: LaptopRentalRow) {
  return row.laptops.filter((link) => link.laptop.deletedAt === null);
}

function assignedLaptopLines(row: LaptopRentalRow) {
  return proposalLaptopLinks(row).map((link) =>
    [
      `${link.laptop.name} × ${link.quantity}`,
      link.laptop.assetTag,
      link.laptop.serialNumber,
      [link.laptop.brand, link.laptop.model].filter(Boolean).join(' '),
      link.laptop.processor,
      link.laptop.ram,
      link.laptop.storage,
      link.laptop.display,
      link.laptop.operatingSystem,
    ]
      .filter(Boolean)
      .join(' · '),
  );
}

function laptopRentalWrite(input: CreateLaptopRentalProposalInput, companyId: string) {
  return {
    companyId,
    customerCompanyName: input.customerCompanyName,
    proposalDate: new Date(`${input.proposalDate}T00:00:00.000Z`),
    title: input.title,
    proposalSummary: input.proposalSummary,
    quantity: input.quantity,
    processor: input.processor,
    ram: input.ram,
    storage: input.storage,
    display: input.display,
    operatingSystem: input.operatingSystem,
    brand: input.brand,
    condition: input.condition,
    accessories: input.accessories,
    monthlyRate: input.monthlyRate,
    commitmentMonths: input.commitmentMonths,
    commitmentRate: input.commitmentRate,
    gstPercent: input.gstPercent,
    depositPerLaptop: input.depositPerLaptop,
    discountPercent: input.discountPercent,
    deliveryLocation: input.deliveryLocation,
    services: input.services,
    supportText: input.supportText,
    responsibilities: input.responsibilities,
    paymentDueText: input.paymentDueText,
    depositNote: input.depositNote,
    returnIntro: input.returnIntro,
    returnChecks: input.returnChecks,
    wearNote: input.wearNote,
    acceptanceText: input.acceptanceText,
    gstNote: input.gstNote,
    customerSignatoryName: input.customerSignatoryName,
    customerSignatoryDesignation: input.customerSignatoryDesignation,
    issuerSignatoryName: input.issuerSignatoryName,
    issuerSignatoryDesignation: input.issuerSignatoryDesignation,
    issuerName: input.issuerName,
    issuerAddress: input.issuerAddress,
    issuerPhone: input.issuerPhone,
    issuerEmail: input.issuerEmail,
    issuerGstin: input.issuerGstin,
  };
}

function laptopRentalDocumentInput(row: LaptopRentalRow): LaptopRentalDocumentInput {
  return {
    proposalNumber: row.proposalNumber,
    status: row.status,
    customerCompanyName: row.customerCompanyName,
    proposalDate: row.proposalDate.toISOString().slice(0, 10),
    title: row.title,
    proposalSummary: row.proposalSummary,
    quantity: row.quantity,
    processor: row.processor,
    ram: row.ram,
    storage: row.storage,
    display: row.display,
    operatingSystem: row.operatingSystem,
    brand: row.brand,
    condition: row.condition,
    accessories: row.accessories,
    monthlyRate: plainMoney(row.monthlyRate),
    commitmentMonths: row.commitmentMonths,
    commitmentRate: plainMoney(row.commitmentRate),
    gstPercent: plainMoney(row.gstPercent),
    depositPerLaptop: plainMoney(row.depositPerLaptop),
    deliveryLocation: row.deliveryLocation,
    services: row.services,
    supportText: row.supportText,
    responsibilities: row.responsibilities,
    paymentDueText: row.paymentDueText,
    depositNote: row.depositNote,
    returnIntro: row.returnIntro,
    returnChecks: row.returnChecks,
    wearNote: row.wearNote,
    acceptanceText: row.acceptanceText,
    gstNote: row.gstNote,
    customerSignatoryName: row.customerSignatoryName,
    customerSignatoryDesignation: row.customerSignatoryDesignation,
    issuerSignatoryName: row.issuerSignatoryName,
    issuerSignatoryDesignation: row.issuerSignatoryDesignation,
    issuerName: row.issuerName,
    issuerAddress: row.issuerAddress,
    issuerPhone: row.issuerPhone,
    issuerEmail: row.issuerEmail,
    issuerGstin: row.issuerGstin,
    assignedLaptops: assignedLaptopLines(row),
    discountPercent: plainMoney(row.discountPercent),
    selection: proposalLaptopLinks(row).map((link) => ({
      name: link.laptop.name,
      quantity: link.quantity,
      monthlyRate: plainMoney(link.monthlyRate),
      commitmentRate: plainMoney(link.commitmentRate),
      depositPerLaptop: plainMoney(link.depositPerLaptop),
      gstPercent: plainMoney(row.gstPercent),
      detail: [
        link.laptop.processor,
        link.laptop.ram,
        link.laptop.storage,
        link.laptop.display,
        link.laptop.operatingSystem,
      ]
        .filter(Boolean)
        .join(' · '),
    })),
  };
}

function presentLaptopRental(
  row: LaptopRentalRow,
  logo: string | null,
  discountTiers?: RentalDiscountTier[],
): LaptopRentalProposalView {
  const input = { ...laptopRentalDocumentInput(row), discountTiers };
  return {
    ...input,
    id: row.id,
    companyId: row.companyId,
    companyName: row.company.name,
    laptopIds: proposalLaptopLinks(row).map((link) => link.laptop.id),
    laptopLines: proposalLaptopLinks(row).map((link) => ({
      laptopId: link.laptop.id,
      quantity: link.quantity,
    })),
    discountPercent: plainMoney(row.discountPercent),
    document: buildLaptopRentalDocument(input),
    logoDataUrl: logo,
  };
}

function summarizeLaptopRental(row: LaptopRentalRow): LaptopRentalProposalSummary {
  const quote = quoteLaptopRental({
    quantity: row.quantity,
    monthlyRate: plainMoney(row.monthlyRate),
    commitmentMonths: row.commitmentMonths,
    commitmentRate: plainMoney(row.commitmentRate),
    gstPercent: plainMoney(row.gstPercent),
    depositPerLaptop: plainMoney(row.depositPerLaptop),
    discountPercent: plainMoney(row.discountPercent),
  });
  return {
    id: row.id,
    proposalNumber: row.proposalNumber,
    status: row.status,
    companyId: row.companyId,
    customerCompanyName: row.customerCompanyName,
    proposalDate: row.proposalDate.toISOString().slice(0, 10),
    quantity: row.quantity,
    commitmentMonths: row.commitmentMonths,
    commitmentMonthly: quote.commitmentMonthly,
    monthlyWithGst: quote.monthlyWithGst,
    depositTotal: quote.depositTotal,
  };
}
