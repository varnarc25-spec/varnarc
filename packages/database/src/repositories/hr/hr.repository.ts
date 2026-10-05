import type { Prisma, PrismaClient } from '@prisma/client';
import { STANDARD_HR_DEPARTMENTS, type LaptopRentalStatus } from '@varnarc/validation';

const employeeInclude = {
  department: { select: { id: true, name: true, code: true } },
  salary: {
    select: {
      basic: true,
      hra: true,
      specialAllowance: true,
      leaveTravelAllowance: true,
      professionalTax: true,
      providentFund: true,
    },
  },
  salaryHikes: {
    orderBy: { effectiveOn: 'desc' as const },
    take: 20,
    select: {
      id: true,
      effectiveOn: true,
      percentage: true,
      previousBasic: true,
      previousHra: true,
      previousSpecialAllowance: true,
      previousLeaveTravelAllowance: true,
      previousProfessionalTax: true,
      previousProvidentFund: true,
      basic: true,
      hra: true,
      specialAllowance: true,
      leaveTravelAllowance: true,
      professionalTax: true,
      providentFund: true,
      notes: true,
    },
  },
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

  async listDepartments() {
    await this.db.hrDepartment.createMany({
      data: STANDARD_HR_DEPARTMENTS.map((department) => ({
        name: department.name,
        code: department.code,
      })),
      skipDuplicates: true,
    });
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
    dateOfBirth: Date | null;
    pan: string | null;
    bankAccountNo: string | null;
    ifscCode: string | null;
    taxRegime: string;
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
      dateOfBirth?: Date | null;
      pan?: string | null;
      bankAccountNo?: string | null;
      ifscCode?: string | null;
      taxRegime?: string;
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

  findClient(id: string) {
    return this.db.hrClient.findFirst({ where: { id, deletedAt: null } });
  }

  findClientByName(name: string) {
    return this.db.hrClient.findFirst({
      where: { deletedAt: null, name: { equals: name, mode: 'insensitive' } },
    });
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
    specialAllowance: number;
    leaveTravelAllowance: number;
    professionalTax: number;
    providentFund: number;
  }) {
    const amounts = {
      basic: data.basic,
      hra: data.hra,
      specialAllowance: data.specialAllowance,
      leaveTravelAllowance: data.leaveTravelAllowance,
      professionalTax: data.professionalTax,
      providentFund: data.providentFund,
      allowances: roundMoney(data.specialAllowance + data.leaveTravelAllowance),
      deductions: roundMoney(data.professionalTax + data.providentFund),
    };
    return this.db.hrSalary.upsert({
      where: { employeeId: data.employeeId },
      update: amounts,
      create: { employeeId: data.employeeId, ...amounts },
    });
  }

  createSalaryHike(data: {
    employeeId: string;
    effectiveOn: Date;
    percentage: number;
    previousBasic: number;
    previousHra: number;
    previousSpecialAllowance: number;
    previousLeaveTravelAllowance: number;
    previousProfessionalTax: number;
    previousProvidentFund: number;
    basic: number;
    hra: number;
    specialAllowance: number;
    leaveTravelAllowance: number;
    professionalTax: number;
    providentFund: number;
    notes: string | null;
  }) {
    return this.db.hrSalaryHike.create({ data });
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

  payslipYearToDate(employeeId: string, period: string) {
    const [yearText, monthText] = period.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const startYear = month >= 4 ? year : year - 1;
    const start = `${startYear}-04`;
    return this.db.hrPayslip.findMany({
      where: {
        employeeId,
        payrollRun: { period: { gte: start, lte: period } },
      },
      select: { grossPay: true, deductions: true, providentFund: true },
    });
  }

  getPayslip(id: string) {
    return this.db.hrPayslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
            jobTitle: true,
            email: true,
            dateOfBirth: true,
            pan: true,
            bankAccountNo: true,
            ifscCode: true,
            taxRegime: true,
            joinedOn: true,
            department: { select: { name: true } },
          },
        },
        payrollRun: {
          select: {
            period: true,
            status: true,
            companyName: true,
            companyAddress: true,
            generatedBy: true,
          },
        },
      },
    });
  }

  async generatePayslips(
    period: string,
    header: { companyName: string; companyAddress: string; generatedBy: string },
  ) {
    const salaries = await this.db.hrSalary.findMany({
      where: { employee: { deletedAt: null, status: 'ACTIVE' } },
    });
    const run = await this.db.hrPayrollRun.upsert({
      where: { period },
      update: {
        status: 'PROCESSED',
        companyName: header.companyName,
        companyAddress: header.companyAddress,
        generatedBy: header.generatedBy,
      },
      create: {
        period,
        status: 'PROCESSED',
        companyName: header.companyName,
        companyAddress: header.companyAddress,
        generatedBy: header.generatedBy,
      },
    });
    const payslips: Array<
      Prisma.HrPayslipGetPayload<{
        include: {
          employee: { select: { fullName: true; email: true; employeeCode: true } };
        };
      }>
    > = [];
    for (const salary of salaries) {
      const basic = Number(salary.basic);
      const hra = Number(salary.hra);
      const specialAllowance = Number(salary.specialAllowance);
      const leaveTravelAllowance = Number(salary.leaveTravelAllowance);
      const professionalTax = Number(salary.professionalTax);
      const providentFund = Number(salary.providentFund);
      const grossPay = roundMoney(basic + hra + specialAllowance + leaveTravelAllowance);
      const deductions = roundMoney(professionalTax + providentFund);
      const netPay = roundMoney(grossPay - deductions);
      const line = {
        basic,
        hra,
        specialAllowance,
        leaveTravelAllowance,
        professionalTax,
        providentFund,
        grossPay,
        allowances: roundMoney(specialAllowance + leaveTravelAllowance),
        deductions,
        netPay,
      };
      payslips.push(
        await this.db.hrPayslip.upsert({
          where: {
            payrollRunId_employeeId: { payrollRunId: run.id, employeeId: salary.employeeId },
          },
          update: line,
          create: { payrollRunId: run.id, employeeId: salary.employeeId, ...line },
          include: {
            employee: { select: { fullName: true, email: true, employeeCode: true } },
          },
        }),
      );
    }
    return { runId: run.id, period, count: salaries.length, payslips };
  }

  listLaptopRentals() {
    return this.db.laptopRentalProposal.findMany({
      where: { deletedAt: null },
      orderBy: [{ proposalDate: 'desc' }, { createdAt: 'desc' }],
      include: laptopRentalInclude,
    });
  }

  getLaptopRental(id: string) {
    return this.db.laptopRentalProposal.findFirst({
      where: { id, deletedAt: null },
      include: laptopRentalInclude,
    });
  }

  async createLaptopRental(data: LaptopRentalWrite) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.db.$transaction(async (tx) => {
          const proposalNumber = await nextLaptopRentalNumber(tx, data.proposalDate);
          return tx.laptopRentalProposal.create({
            data: { ...data, proposalNumber },
            include: laptopRentalInclude,
          });
        });
      } catch (error) {
        if (attempt === 0 && isUniqueConflict(error)) continue;
        throw error;
      }
    }
    throw new Error('Could not assign a proposal number.');
  }

  updateLaptopRental(id: string, data: LaptopRentalWrite & { status: LaptopRentalStatus }) {
    return this.db.laptopRentalProposal.update({
      where: { id },
      data,
      include: laptopRentalInclude,
    });
  }

  updateLaptopRentalStatus(id: string, status: LaptopRentalStatus) {
    return this.db.laptopRentalProposal.update({
      where: { id },
      data: { status },
      include: laptopRentalInclude,
    });
  }

  async deleteLaptopRental(id: string) {
    const result = await this.db.laptopRentalProposal.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

const laptopRentalInclude = {
  company: { select: { id: true, name: true } },
  laptops: {
    include: {
      laptop: {
        select: {
          id: true,
          name: true,
          assetTag: true,
          serialNumber: true,
          brand: true,
          model: true,
          processor: true,
          ram: true,
          storage: true,
          display: true,
          operatingSystem: true,
          deletedAt: true,
        },
      },
    },
  },
} as const;

export type LaptopRentalWrite = {
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
  monthlyRate: number;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  discountPercent: number;
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
};

async function nextLaptopRentalNumber(tx: Prisma.TransactionClient, proposalDate: Date) {
  const year = proposalDate.getUTCFullYear();
  const prefix = `LRP-${year}-`;
  const latest = await tx.laptopRentalProposal.findFirst({
    where: { proposalNumber: { startsWith: prefix } },
    orderBy: { proposalNumber: 'desc' },
    select: { proposalNumber: true },
  });
  const current = latest ? Number(latest.proposalNumber.slice(prefix.length)) : 0;
  const sequence = Number.isFinite(current) ? current + 1 : 1;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

function isUniqueConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
