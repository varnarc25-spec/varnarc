import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CrmActivityInput,
  CrmActivityView,
  CrmCompanyInput,
  CrmCompanyView,
  CrmContactInput,
  CrmContactView,
  CrmDashboard,
  CrmLaptopInput,
  CrmLaptopView,
  CrmRentalDiscountsInput,
  CrmRentalSummary,
  LaptopRentalProposalSummary,
  RentalDiscountTier,
} from '@varnarc/validation';
import { DEFAULT_RENTAL_DISCOUNTS, quoteLaptopRental } from '@varnarc/validation';
import type { Repositories } from '@varnarc/database';
import { REPOS } from '../../database/database.module';

@Injectable()
export class CrmService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  async listCompanies(): Promise<CrmCompanyView[]> {
    const rows = await this.repos.crm.listCompanies();
    return rows.map(presentCompany);
  }

  async getCompany(id: string) {
    const row = await this.repos.crm.getCompany(id);
    if (!row) throw new NotFoundException('Company not found');
    return {
      ...presentCompany({
        ...row,
        _count: { contacts: row.contacts.length, proposals: row.proposals.length },
      }),
      contacts: row.contacts.map((contact) =>
        presentContact({ ...contact, company: { name: row.name } }),
      ),
      activities: row.activities.map(presentActivity),
      proposals: row.proposals.map(summarizeProposal),
    };
  }

  async createCompany(input: CrmCompanyInput) {
    const existing = await this.repos.crm.findCompanyByName(input.name);
    if (existing) throw new BadRequestException('A company with this name already exists.');
    const row = await this.repos.crm.createCompany(input);
    return presentCompany({ ...row, _count: { contacts: 0, proposals: 0 } });
  }

  async updateCompany(id: string, input: CrmCompanyInput) {
    const existing = await this.repos.crm.getCompany(id);
    if (!existing) throw new NotFoundException('Company not found');
    const duplicate = await this.repos.crm.findCompanyByName(input.name);
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException('A company with this name already exists.');
    }
    const row = await this.repos.crm.updateCompany(id, input);
    return presentCompany({
      ...row,
      _count: { contacts: existing.contacts.length, proposals: existing.proposals.length },
    });
  }

  async deleteCompany(id: string) {
    const existing = await this.repos.crm.getCompany(id);
    if (!existing) throw new NotFoundException('Company not found');
    const deleted = await this.repos.crm.deleteCompany(id);
    if (!deleted) {
      throw new BadRequestException('Delete the company proposals before removing the company.');
    }
    return { deleted: true };
  }

  async listContacts(): Promise<CrmContactView[]> {
    const rows = await this.repos.crm.listContacts();
    return rows.map(presentContact);
  }

  async createContact(input: CrmContactInput) {
    const company = await this.repos.crm.getCompany(input.companyId);
    if (!company) throw new NotFoundException('Company not found');
    const row = await this.repos.crm.createContact({
      companyId: input.companyId,
      name: input.name,
      designation: input.designation,
      email: input.email,
      phone: input.phone,
      isPrimary: input.isPrimary,
    });
    return presentContact(row);
  }

  async deleteContact(id: string) {
    const deleted = await this.repos.crm.deleteContact(id);
    if (!deleted) throw new NotFoundException('Contact not found');
    return { deleted: true };
  }

  async createActivity(input: CrmActivityInput): Promise<CrmActivityView> {
    const company = await this.repos.crm.getCompany(input.companyId);
    if (!company) throw new NotFoundException('Company not found');
    if (
      input.proposalId &&
      !company.proposals.some((proposal) => proposal.id === input.proposalId)
    ) {
      throw new BadRequestException('That proposal does not belong to this company.');
    }
    const row = await this.repos.crm.createActivity({
      companyId: input.companyId,
      proposalId: input.proposalId ?? null,
      kind: input.kind,
      body: input.body,
      occurredOn: new Date(`${input.occurredOn}T00:00:00.000Z`),
    });
    return presentActivity(row);
  }

  async dashboard(): Promise<CrmDashboard> {
    const stats = await this.repos.crm.dashboard();
    const proposals = { draft: 0, sent: 0, accepted: 0, declined: 0 };
    for (const group of stats.proposalGroups) {
      if (group.status === 'DRAFT') proposals.draft = group._count;
      if (group.status === 'SENT') proposals.sent = group._count;
      if (group.status === 'ACCEPTED') proposals.accepted = group._count;
      if (group.status === 'DECLINED') proposals.declined = group._count;
    }
    return {
      companies: stats.companies,
      contacts: stats.contacts,
      proposals,
      activeRentals: stats.activeRentals,
      pendingSignatures: stats.pendingSignatures,
      openInvoices: stats.openInvoices._count,
      openInvoiceTotal: Number(stats.openInvoices._sum.totalAmount ?? 0),
    };
  }

  async listRentals(): Promise<CrmRentalSummary[]> {
    const rows = await this.repos.crm.listRentals();
    return rows
      .filter((row) => row.proposal.deletedAt === null)
      .map((row) => ({
        id: row.id,
        agreementNumber: row.agreementNumber,
        status: row.status,
        proposalId: row.proposal.id,
        proposalNumber: row.proposal.proposalNumber,
        companyId: row.proposal.companyId,
        companyName: row.proposal.customerCompanyName,
        startDate: row.startDate.toISOString().slice(0, 10),
        endDate: row.endDate.toISOString().slice(0, 10),
        quantity: row.quantity,
      }));
  }

  async listLaptops(): Promise<CrmLaptopView[]> {
    const rows = await this.repos.crm.listLaptops();
    return rows.map(presentLaptop);
  }

  async getLaptop(id: string) {
    const row = await this.repos.crm.getLaptop(id);
    if (!row) throw new NotFoundException('Laptop not found');
    return presentLaptop(row);
  }

  async createLaptop(input: CrmLaptopInput) {
    try {
      const row = await this.repos.crm.createLaptop({
        ...input,
        slug: input.slug ?? slugify(input.name),
      });
      return presentLaptop({ ...row, proposals: [] });
    } catch (error) {
      const message = duplicateLaptopMessage(error);
      if (message) throw new BadRequestException(message);
      throw error;
    }
  }

  async updateLaptop(id: string, input: CrmLaptopInput) {
    const existing = await this.repos.crm.getLaptop(id);
    if (!existing) throw new NotFoundException('Laptop not found');
    const { slug, ...rest } = input;
    try {
      const row = await this.repos.crm.updateLaptop(id, slug ? { ...rest, slug } : rest);
      return presentLaptop({ ...row, proposals: existing.proposals });
    } catch (error) {
      const message = duplicateLaptopMessage(error);
      if (message) throw new BadRequestException(message);
      throw error;
    }
  }

  async listRentalDiscounts(): Promise<RentalDiscountTier[]> {
    const rows = await this.repos.crm.listRentalDiscounts();
    if (rows.length === 0) return DEFAULT_RENTAL_DISCOUNTS.map((tier) => ({ ...tier }));
    return rows.map((row) => ({ months: row.months, percent: Number(row.percent) }));
  }

  async saveRentalDiscounts(input: CrmRentalDiscountsInput): Promise<RentalDiscountTier[]> {
    const rows = await this.repos.crm.saveRentalDiscounts(input.tiers);
    return rows.map((row) => ({ months: row.months, percent: Number(row.percent) }));
  }

  async deleteLaptop(id: string) {
    const existing = await this.repos.crm.getLaptop(id);
    if (!existing) throw new NotFoundException('Laptop not found');
    const deleted = await this.repos.crm.deleteLaptop(id);
    if (!deleted)
      throw new BadRequestException('Remove this laptop from its proposal before deleting it.');
    return { deleted: true };
  }
}

function presentLaptop(row: {
  id: string;
  name: string;
  slug: string | null;
  category: CrmLaptopView['category'];
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
  monthlyRate: { toString(): string } | number | string | null;
  commitmentMonths: number;
  commitmentRate: { toString(): string } | number | string;
  gstPercent: { toString(): string } | number | string;
  depositPerLaptop: { toString(): string } | number | string;
  taxesNote: string | null;
  availability: CrmLaptopView['availability'];
  status: CrmLaptopView['status'];
  proposals: Array<{ proposal: { id: string; proposalNumber: string } }>;
}): CrmLaptopView {
  const proposal = row.assetTag ? row.proposals[0]?.proposal : undefined;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    assetTag: row.assetTag,
    serialNumber: row.serialNumber,
    brand: row.brand,
    model: row.model,
    listedYear: row.listedYear,
    generation: row.generation,
    processor: row.processor,
    processorFull: row.processorFull,
    ram: row.ram,
    storage: row.storage,
    display: row.display,
    graphics: row.graphics,
    camera: row.camera,
    operatingSystem: row.operatingSystem,
    modelNumber: row.modelNumber,
    ports: row.ports,
    adapter: row.adapter,
    useCase: row.useCase,
    condition: row.condition,
    notes: row.notes,
    monthlyRate: row.monthlyRate == null ? null : Number(row.monthlyRate),
    commitmentMonths: row.commitmentMonths,
    commitmentRate: Number(row.commitmentRate),
    gstPercent: Number(row.gstPercent),
    depositPerLaptop: Number(row.depositPerLaptop),
    taxesNote: row.taxesNote,
    availability: row.availability,
    status: row.status,
    proposalId: proposal?.id ?? null,
    proposalNumber: proposal?.proposalNumber ?? null,
  };
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return slug || 'laptop';
}

function duplicateLaptopMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'P2002')
    return null;
  const target =
    'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta
      ? JSON.stringify(error.meta.target)
      : '';
  if (target.includes('serial')) return 'A laptop with this serial number already exists.';
  if (target.includes('slug')) return 'A laptop with this name already exists.';
  if (target.includes('asset')) return 'A laptop with this asset tag already exists.';
  return 'A laptop with these details already exists.';
}

function presentCompany(row: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  gstin: string | null;
  website: string | null;
  notes: string | null;
  _count: { contacts: number; proposals: number };
}): CrmCompanyView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    gstin: row.gstin,
    website: row.website,
    notes: row.notes,
    contactCount: row._count.contacts,
    proposalCount: row._count.proposals,
  };
}

function presentContact(row: {
  id: string;
  companyId: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  company: { name: string };
}): CrmContactView {
  return {
    id: row.id,
    companyId: row.companyId,
    companyName: row.company.name,
    name: row.name,
    designation: row.designation,
    email: row.email,
    phone: row.phone,
    isPrimary: row.isPrimary,
  };
}

function presentActivity(row: {
  id: string;
  companyId: string;
  proposalId: string | null;
  kind: CrmActivityView['kind'];
  body: string;
  occurredOn: Date;
}): CrmActivityView {
  return {
    id: row.id,
    companyId: row.companyId,
    proposalId: row.proposalId,
    kind: row.kind,
    body: row.body,
    occurredOn: row.occurredOn.toISOString().slice(0, 10),
  };
}

function summarizeProposal(row: {
  id: string;
  proposalNumber: string;
  status: LaptopRentalProposalSummary['status'];
  companyId: string;
  customerCompanyName: string;
  proposalDate: Date;
  quantity: number;
  commitmentMonths: number;
  monthlyRate: { toString(): string } | number | string;
  commitmentRate: { toString(): string } | number | string;
  gstPercent: { toString(): string } | number | string;
  depositPerLaptop: { toString(): string } | number | string;
}): LaptopRentalProposalSummary {
  const quote = quoteLaptopRental({
    quantity: row.quantity,
    monthlyRate: Number(row.monthlyRate),
    commitmentMonths: row.commitmentMonths,
    commitmentRate: Number(row.commitmentRate),
    gstPercent: Number(row.gstPercent),
    depositPerLaptop: Number(row.depositPerLaptop),
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
