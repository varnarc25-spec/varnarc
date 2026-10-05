import type { Prisma, PrismaClient } from '@prisma/client';

export class CrmRepository {
  constructor(private readonly db: PrismaClient) {}

  listCompanies() {
    return this.db.crmCompany.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            contacts: { where: { deletedAt: null } },
            proposals: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  listContacts() {
    return this.db.crmContact.findMany({
      where: { deletedAt: null, company: { deletedAt: null } },
      orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
      include: { company: { select: { id: true, name: true } } },
    });
  }

  getCompany(id: string) {
    return this.db.crmCompany.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null }, orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }] },
        activities: { orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }] },
        proposals: {
          where: { deletedAt: null },
          orderBy: [{ proposalDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  findCompanyByName(name: string) {
    return this.db.crmCompany.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, deletedAt: null },
    });
  }

  createCompany(data: Prisma.CrmCompanyCreateInput) {
    return this.db.crmCompany.create({ data });
  }

  updateCompany(id: string, data: Prisma.CrmCompanyUpdateInput) {
    return this.db.crmCompany.update({ where: { id }, data });
  }

  async deleteCompany(id: string) {
    const proposals = await this.db.laptopRentalProposal.count({
      where: { companyId: id, deletedAt: null },
    });
    if (proposals > 0) return false;
    const result = await this.db.crmCompany.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }

  async createContact(data: Prisma.CrmContactUncheckedCreateInput) {
    return this.db.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.crmContact.updateMany({
          where: { companyId: data.companyId, deletedAt: null },
          data: { isPrimary: false },
        });
      }
      return tx.crmContact.create({
        data,
        include: { company: { select: { id: true, name: true } } },
      });
    });
  }

  async deleteContact(id: string) {
    const result = await this.db.crmContact.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }

  createActivity(data: Prisma.CrmActivityUncheckedCreateInput) {
    return this.db.crmActivity.create({ data });
  }

  async dashboard() {
    const [companies, contacts, proposalGroups, activeRentals, pendingSignatures, openInvoices] =
      await Promise.all([
        this.db.crmCompany.count({ where: { deletedAt: null } }),
        this.db.crmContact.count({ where: { deletedAt: null, company: { deletedAt: null } } }),
        this.db.laptopRentalProposal.groupBy({
          by: ['status'],
          where: { deletedAt: null },
          _count: true,
        }),
        this.db.laptopRentalAgreement.count({ where: { status: 'ACTIVE' } }),
        this.db.laptopRentalAgreement.count({ where: { status: 'PENDING_SIGNATURE' } }),
        this.db.laptopRentalInvoice.aggregate({
          where: { status: 'ISSUED' },
          _count: true,
          _sum: { totalAmount: true },
        }),
      ]);
    return { companies, contacts, proposalGroups, activeRentals, pendingSignatures, openInvoices };
  }

  listRentals() {
    return this.db.laptopRentalAgreement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        proposal: {
          select: {
            id: true,
            proposalNumber: true,
            customerCompanyName: true,
            companyId: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  listLaptops() {
    return this.db.crmLaptop.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        proposals: {
          where: { proposal: { deletedAt: null, status: { not: 'DECLINED' } } },
          include: { proposal: { select: { id: true, proposalNumber: true } } },
          take: 1,
        },
      },
    });
  }

  getLaptop(id: string) {
    return this.db.crmLaptop.findFirst({
      where: { id, deletedAt: null },
      include: {
        proposals: {
          where: { proposal: { deletedAt: null, status: { not: 'DECLINED' } } },
          include: { proposal: { select: { id: true, proposalNumber: true } } },
          take: 1,
        },
      },
    });
  }

  createLaptop(data: Prisma.CrmLaptopCreateInput) {
    return this.db.crmLaptop.create({ data });
  }

  updateLaptop(id: string, data: Prisma.CrmLaptopUpdateInput) {
    return this.db.crmLaptop.update({ where: { id }, data });
  }

  async deleteLaptop(id: string) {
    const linked = await this.db.laptopRentalProposalLaptop.count({
      where: { laptopId: id, proposal: { deletedAt: null } },
    });
    if (linked > 0) return false;
    const result = await this.db.crmLaptop.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }

  proposalLaptops(ids: string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.db.crmLaptop.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        status: true,
        name: true,
        brand: true,
        model: true,
        processor: true,
        ram: true,
        storage: true,
        display: true,
        operatingSystem: true,
        condition: true,
        monthlyRate: true,
        commitmentMonths: true,
        commitmentRate: true,
        gstPercent: true,
        depositPerLaptop: true,
      },
    });
  }

  async replaceProposalLaptops(
    proposalId: string,
    lines: Array<{
      laptopId: string;
      quantity: number;
      monthlyRate: number;
      commitmentRate: number;
      depositPerLaptop: number;
    }>,
  ) {
    const unique = [...new Map(lines.map((line) => [line.laptopId, line])).values()];
    const laptopIds = unique.map((line) => line.laptopId);
    const laptops = laptopIds.length
      ? await this.db.crmLaptop.findMany({ where: { id: { in: laptopIds }, deletedAt: null } })
      : [];
    if (laptops.length !== laptopIds.length) {
      throw new Error('LAPTOP_MISSING');
    }
    if (laptops.some((laptop) => laptop.status === 'RETIRED')) {
      throw new Error('LAPTOP_RETIRED');
    }
    const taken = laptopIds.length
      ? await this.db.laptopRentalProposalLaptop.findMany({
          where: {
            laptopId: { in: laptopIds },
            proposalId: { not: proposalId },
            proposal: { deletedAt: null, status: { not: 'DECLINED' } },
            laptop: { assetTag: { not: null } },
          },
          include: { laptop: { select: { assetTag: true, name: true } } },
        })
      : [];
    if (taken.length > 0) {
      throw new Error(
        `LAPTOP_TAKEN:${taken.map((row) => row.laptop.assetTag ?? row.laptop.name).join(', ')}`,
      );
    }

    await this.db.$transaction(async (tx) => {
      const previous = await tx.laptopRentalProposalLaptop.findMany({ where: { proposalId } });
      const previousIds = new Set(previous.map((row) => row.laptopId));
      const nextIds = new Set(laptopIds);
      const removed = [...previousIds].filter((id) => !nextIds.has(id));
      await tx.laptopRentalProposalLaptop.deleteMany({ where: { proposalId } });
      if (unique.length > 0) {
        await tx.laptopRentalProposalLaptop.createMany({
          data: unique.map((line) => ({
            proposalId,
            laptopId: line.laptopId,
            quantity: line.quantity,
            monthlyRate: line.monthlyRate,
            commitmentRate: line.commitmentRate,
            depositPerLaptop: line.depositPerLaptop,
          })),
        });
        await tx.crmLaptop.updateMany({
          where: { id: { in: laptopIds }, status: 'AVAILABLE', assetTag: { not: null } },
          data: { status: 'RESERVED' },
        });
      }
      if (removed.length === 0) return;
      const stillUsed = await tx.laptopRentalProposalLaptop.findMany({
        where: {
          laptopId: { in: removed },
          proposal: { deletedAt: null, status: { not: 'DECLINED' } },
        },
        select: { laptopId: true },
      });
      const still = new Set(stillUsed.map((row) => row.laptopId));
      const free = removed.filter((id) => !still.has(id));
      if (free.length > 0) {
        await tx.crmLaptop.updateMany({
          where: { id: { in: free }, status: 'RESERVED' },
          data: { status: 'AVAILABLE' },
        });
      }
    });
  }

  async releaseReservedLaptops(proposalId: string) {
    const links = await this.db.laptopRentalProposalLaptop.findMany({
      where: { proposalId },
      select: { laptopId: true },
    });
    const ids = links.map((link) => link.laptopId);
    if (ids.length === 0) return;
    const stillUsed = await this.db.laptopRentalProposalLaptop.findMany({
      where: {
        laptopId: { in: ids },
        proposalId: { not: proposalId },
        proposal: { deletedAt: null, status: { not: 'DECLINED' } },
      },
      select: { laptopId: true },
    });
    const still = new Set(stillUsed.map((row) => row.laptopId));
    const free = ids.filter((id) => !still.has(id));
    if (free.length === 0) return;
    await this.db.crmLaptop.updateMany({
      where: { id: { in: free }, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });
  }

  listRentalDiscounts() {
    return this.db.crmRentalDiscount.findMany({
      orderBy: [{ sortOrder: 'asc' }, { months: 'asc' }],
    });
  }

  async saveRentalDiscounts(tiers: { months: number; percent: number }[]) {
    const ordered = [...tiers].sort((left, right) => left.months - right.months);
    await this.db.$transaction(async (tx) => {
      await tx.crmRentalDiscount.deleteMany();
      await tx.crmRentalDiscount.createMany({
        data: ordered.map((tier, index) => ({
          months: tier.months,
          percent: tier.percent,
          sortOrder: index,
        })),
      });
    });
    return this.listRentalDiscounts();
  }

  markLaptopsRented(ids: string[]) {
    if (ids.length === 0) return Promise.resolve();
    return this.db.crmLaptop.updateMany({
      where: { id: { in: ids }, status: { in: ['AVAILABLE', 'RESERVED'] } },
      data: { status: 'RENTED' },
    });
  }
}
