import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Repositories } from '@varnarc/database';
import type {
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
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';

function dateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
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

@Injectable()
export class HrService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

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

  listEmployees() {
    return this.repos.hr.listEmployees();
  }

  async createEmployee(input: CreateHrEmployeeInput) {
    const count = await this.repos.hr.nextEmployeeCode();
    const employeeCode = `EMP-${String(count + 1).padStart(4, '0')}`;
    return this.repos.hr.createEmployee({
      employeeCode,
      fullName: input.fullName,
      email: blankToNull(input.email),
      phone: blankToNull(input.phone),
      jobTitle: input.jobTitle,
      departmentId: input.departmentId ?? null,
      status: input.status,
      joinedOn: dateOnly(input.joinedOn),
      notes: blankToNull(input.notes),
    });
  }

  async updateEmployee(id: string, input: UpdateHrEmployeeInput) {
    try {
      return await this.repos.hr.updateEmployee(id, {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.email !== undefined ? { email: blankToNull(input.email) } : {}),
        ...(input.phone !== undefined ? { phone: blankToNull(input.phone) } : {}),
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.joinedOn !== undefined ? { joinedOn: dateOnly(input.joinedOn) } : {}),
        ...(input.notes !== undefined ? { notes: blankToNull(input.notes) } : {}),
      });
    } catch {
      throw new NotFoundException('Employee not found');
    }
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
    return slip;
  }

  async generatePayroll(input: GenerateHrPayrollInput) {
    const salaries = await this.repos.hr.listSalaries();
    const active = salaries.filter((row) => row.employee.status === 'ACTIVE');
    if (active.length === 0) {
      throw new BadRequestException(
        'Add a salary for an active employee before generating payslips.',
      );
    }
    return this.repos.hr.generatePayslips(input.period);
  }
}
