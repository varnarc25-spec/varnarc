import type { PrismaClient } from '@prisma/client';

const employeeInclude = {
  department: { select: { id: true, name: true, code: true } },
} as const;

const leaveInclude = {
  employee: { select: { id: true, fullName: true, employeeCode: true } },
} as const;

export class HrRepository {
  constructor(private readonly db: PrismaClient) {}

  summary() {
    return this.db.$transaction([
      this.db.hrDepartment.count({ where: { deletedAt: null } }),
      this.db.hrEmployee.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.db.hrEmployee.count({ where: { deletedAt: null } }),
      this.db.hrLeaveRequest.count({ where: { deletedAt: null, status: 'PENDING' } }),
    ]);
  }

  listDepartments() {
    return this.db.hrDepartment.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { employees: { where: { deletedAt: null } } } } },
    });
  }

  createDepartment(data: { name: string; code: string | null }) {
    return this.db.hrDepartment.create({ data });
  }

  listEmployees() {
    return this.db.hrEmployee.findMany({
      where: { deletedAt: null },
      orderBy: { fullName: 'asc' },
      include: employeeInclude,
    });
  }

  nextEmployeeCode() {
    return this.db.hrEmployee.count();
  }

  createEmployee(data: {
    employeeCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    jobTitle: string;
    departmentId: string | null;
    status: string;
    joinedOn: Date | null;
    notes: string | null;
  }) {
    return this.db.hrEmployee.create({ data, include: employeeInclude });
  }

  updateEmployee(
    id: string,
    data: {
      fullName?: string;
      email?: string | null;
      phone?: string | null;
      jobTitle?: string;
      departmentId?: string | null;
      status?: string;
      joinedOn?: Date | null;
      notes?: string | null;
    },
  ) {
    return this.db.hrEmployee.update({
      where: { id },
      data,
      include: employeeInclude,
    });
  }

  softDeleteEmployee(id: string) {
    return this.db.hrEmployee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'EXITED' },
    });
  }

  listLeave() {
    return this.db.hrLeaveRequest.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: 'desc' },
      include: leaveInclude,
    });
  }

  createLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string | null;
  }) {
    return this.db.hrLeaveRequest.create({ data, include: leaveInclude });
  }

  updateLeaveStatus(id: string, status: string) {
    return this.db.hrLeaveRequest.update({
      where: { id },
      data: { status },
      include: leaveInclude,
    });
  }

  reports() {
    return this.db.$transaction([
      this.db.hrEmployee.count({ where: { deletedAt: null } }),
      this.db.hrEmployee.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.db.hrExit.count({ where: { deletedAt: null, status: { not: 'COMPLETED' } } }),
      this.db.hrJobOpening.count({ where: { deletedAt: null, status: 'OPEN' } }),
      this.db.hrCandidate.count({ where: { deletedAt: null } }),
      this.db.hrAsset.count({ where: { deletedAt: null } }),
      this.db.hrAsset.count({ where: { deletedAt: null, status: 'ASSIGNED' } }),
      this.db.hrLeaveRequest.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.db.hrEssRequest.count({ where: { deletedAt: null, status: 'OPEN' } }),
      this.db.hrPayslip.count(),
      this.db.hrNotification.count({ where: { readAt: null } }),
    ]);
  }

  listOrganizations() {
    return this.db.hrOrganization.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { parent: { select: { id: true, name: true } } },
    });
  }

  createOrganization(data: {
    name: string;
    code: string | null;
    kind: string;
    parentId: string | null;
  }) {
    return this.db.hrOrganization.create({ data });
  }

  listExits() {
    return this.db.hrExit.findMany({
      where: { deletedAt: null },
      orderBy: { lastWorkingDay: 'desc' },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  createExit(data: {
    employeeId: string;
    lastWorkingDay: Date;
    reason: string;
    notes: string | null;
  }) {
    return this.db.hrExit.create({
      data,
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  updateExitStatus(id: string, status: string) {
    return this.db.hrExit.update({ where: { id }, data: { status } });
  }

  listOpenings() {
    return this.db.hrJobOpening.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { name: true } },
        _count: { select: { candidates: { where: { deletedAt: null } } } },
      },
    });
  }

  createOpening(data: {
    title: string;
    departmentId: string | null;
    location: string | null;
    openings: number;
    description: string | null;
  }) {
    return this.db.hrJobOpening.create({ data });
  }

  updateOpeningStatus(id: string, status: string) {
    return this.db.hrJobOpening.update({ where: { id }, data: { status } });
  }

  listCandidates() {
    return this.db.hrCandidate.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { opening: { select: { title: true } } },
    });
  }

  createCandidate(data: {
    openingId: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  }) {
    return this.db.hrCandidate.create({
      data,
      include: { opening: { select: { title: true } } },
    });
  }

  updateCandidateStatus(id: string, status: string) {
    return this.db.hrCandidate.update({ where: { id }, data: { status } });
  }

  listInterviews() {
    return this.db.hrInterview.findMany({
      where: { deletedAt: null },
      orderBy: { scheduledAt: 'desc' },
      include: { candidate: { select: { fullName: true } } },
    });
  }

  createInterview(data: {
    candidateId: string;
    scheduledAt: Date;
    interviewer: string;
    notes: string | null;
  }) {
    return this.db.hrInterview.create({
      data,
      include: { candidate: { select: { fullName: true } } },
    });
  }

  updateInterview(id: string, data: { status: string; result?: string | null }) {
    return this.db.hrInterview.update({ where: { id }, data });
  }

  listAssetMasters() {
    return this.db.hrAssetMaster.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
    });
  }

  createAssetMaster(data: { name: string; category: string }) {
    return this.db.hrAssetMaster.create({ data });
  }

  listAssets() {
    return this.db.hrAsset.findMany({
      where: { deletedAt: null },
      orderBy: { assetTag: 'asc' },
      include: {
        master: { select: { name: true, category: true } },
        employee: { select: { fullName: true, employeeCode: true } },
      },
    });
  }

  nextAssetTag() {
    return this.db.hrAsset.count();
  }

  createAsset(data: { masterId: string; assetTag: string }) {
    return this.db.hrAsset.create({ data });
  }

  assignAsset(id: string, employeeId: string | null, assignedOn: Date | null, status: string) {
    return this.db.hrAsset.update({
      where: { id },
      data: { employeeId, assignedOn, status },
    });
  }

  listFolders() {
    return this.db.hrDocumentFolder.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { parent: { select: { name: true } } },
    });
  }

  createFolder(data: { name: string; parentId: string | null }) {
    return this.db.hrDocumentFolder.create({ data });
  }

  listDocumentTypes() {
    return this.db.hrDocumentType.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  createDocumentType(data: { name: string; code: string | null }) {
    return this.db.hrDocumentType.create({ data });
  }

  listDocuments() {
    return this.db.hrDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        folder: { select: { name: true } },
        type: { select: { name: true } },
        employee: { select: { fullName: true } },
      },
    });
  }

  createDocument(data: {
    title: string;
    folderId: string | null;
    typeId: string | null;
    employeeId: string | null;
    reference: string | null;
  }) {
    return this.db.hrDocument.create({ data });
  }

  listAccounts() {
    return this.db.hrPortalAccount.findMany({
      where: { deletedAt: null },
      orderBy: { email: 'asc' },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  createAccount(data: { employeeId: string; email: string }) {
    return this.db.hrPortalAccount.create({
      data,
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  updateAccountStatus(id: string, status: string) {
    return this.db.hrPortalAccount.update({ where: { id }, data: { status } });
  }

  listSessions() {
    return this.db.hrLoginSession.findMany({
      orderBy: { startedAt: 'desc' },
      include: { account: { select: { email: true } } },
    });
  }

  createSession(data: { accountId: string; ipAddress: string | null }) {
    return this.db.hrLoginSession.create({
      data,
      include: { account: { select: { email: true } } },
    });
  }

  endSession(id: string) {
    return this.db.hrLoginSession.update({
      where: { id },
      data: { status: 'ENDED', endedAt: new Date() },
    });
  }

  listEssRequests() {
    return this.db.hrEssRequest.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  createEssRequest(data: {
    employeeId: string;
    requestType: string;
    subject: string;
    details: string | null;
  }) {
    return this.db.hrEssRequest.create({
      data,
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  updateEssStatus(id: string, status: string) {
    return this.db.hrEssRequest.update({ where: { id }, data: { status } });
  }

  listAnnouncements() {
    return this.db.hrAnnouncement.findMany({
      where: { deletedAt: null },
      orderBy: { publishedOn: 'desc' },
    });
  }

  createAnnouncement(data: { title: string; body: string; publishedOn: Date }) {
    return this.db.hrAnnouncement.create({ data });
  }

  listNotifications() {
    return this.db.hrNotification.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createNotification(data: { title: string; body: string }) {
    return this.db.hrNotification.create({ data });
  }

  markNotificationRead(id: string) {
    return this.db.hrNotification.update({ where: { id }, data: { readAt: new Date() } });
  }

  listRoles() {
    return this.db.hrRole.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          include: { employee: { select: { fullName: true, employeeCode: true } } },
        },
      },
    });
  }

  createRole(data: { name: string; description: string | null }) {
    return this.db.hrRole.create({ data });
  }

  assignRole(data: { roleId: string; employeeId: string }) {
    return this.db.hrRoleAssignment.upsert({
      where: { roleId_employeeId: data },
      update: {},
      create: data,
    });
  }

  listClients() {
    return this.db.hrClient.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  createClient(data: { name: string }) {
    return this.db.hrClient.create({ data });
  }

  listAssignments() {
    return this.db.hrClientAssignment.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        client: { select: { name: true } },
        employee: { select: { fullName: true, employeeCode: true } },
      },
    });
  }

  assignClient(data: {
    clientId: string;
    employeeId: string;
    startDate: Date;
    endDate: Date | null;
  }) {
    return this.db.hrClientAssignment.create({ data });
  }

  listSalaries() {
    return this.db.hrSalary.findMany({
      orderBy: { employee: { fullName: 'asc' } },
      include: { employee: { select: { fullName: true, employeeCode: true, status: true } } },
    });
  }

  upsertSalary(data: {
    employeeId: string;
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  }) {
    const amounts = {
      basic: data.basic,
      hra: data.hra,
      allowances: data.allowances,
      deductions: data.deductions,
    };
    return this.db.hrSalary.upsert({
      where: { employeeId: data.employeeId },
      update: amounts,
      create: { employeeId: data.employeeId, ...amounts },
    });
  }

  listPayrollRuns() {
    return this.db.hrPayrollRun.findMany({
      orderBy: { period: 'desc' },
      include: { _count: { select: { payslips: true } } },
    });
  }

  listPayslips(period?: string) {
    return this.db.hrPayslip.findMany({
      where: period ? { payrollRun: { period } } : undefined,
      orderBy: { employee: { fullName: 'asc' } },
      include: {
        employee: { select: { fullName: true, employeeCode: true, jobTitle: true } },
        payrollRun: { select: { period: true, status: true } },
      },
    });
  }

  getPayslip(id: string) {
    return this.db.hrPayslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: { fullName: true, employeeCode: true, jobTitle: true, email: true },
        },
        payrollRun: { select: { period: true, status: true } },
      },
    });
  }

  async generatePayslips(period: string) {
    const salaries = await this.db.hrSalary.findMany({
      where: { employee: { deletedAt: null, status: 'ACTIVE' } },
    });
    const run = await this.db.hrPayrollRun.upsert({
      where: { period },
      update: { status: 'PROCESSED' },
      create: { period, status: 'PROCESSED' },
    });
    for (const salary of salaries) {
      const basic = Number(salary.basic);
      const hra = Number(salary.hra);
      const allowances = Number(salary.allowances);
      const deductions = Number(salary.deductions);
      const netPay = Math.round((basic + hra + allowances - deductions) * 100) / 100;
      await this.db.hrPayslip.upsert({
        where: { payrollRunId_employeeId: { payrollRunId: run.id, employeeId: salary.employeeId } },
        update: { basic, hra, allowances, deductions, netPay },
        create: {
          payrollRunId: run.id,
          employeeId: salary.employeeId,
          basic,
          hra,
          allowances,
          deductions,
          netPay,
        },
      });
    }
    return { runId: run.id, period, count: salaries.length };
  }
}
