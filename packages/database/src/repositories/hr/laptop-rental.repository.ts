import type { Prisma, PrismaClient } from '@prisma/client';

const agreementInclude = {
  units: { orderBy: { createdAt: 'asc' as const } },
  invoices: { orderBy: { createdAt: 'asc' as const } },
  cases: {
    orderBy: { reportedAt: 'desc' as const },
    include: { unit: { select: { assetTag: true } } },
  },
  charges: {
    orderBy: { reportedOn: 'desc' as const },
    include: { unit: { select: { assetTag: true } } },
  },
} satisfies Prisma.LaptopRentalAgreementInclude;

export class LaptopRentalRepository {
  constructor(private readonly db: PrismaClient) {}

  getByProposal(proposalId: string) {
    return this.db.laptopRentalAgreement.findUnique({
      where: { proposalId },
      include: agreementInclude,
    });
  }

  getById(id: string) {
    return this.db.laptopRentalAgreement.findUnique({
      where: { id },
      include: agreementInclude,
    });
  }

  async createAgreement(
    data: Omit<Prisma.LaptopRentalAgreementUncheckedCreateInput, 'agreementNumber'>,
  ) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.db.$transaction(async (tx) => {
          const agreementNumber = await nextNumber(tx, 'LRA', 'agreement');
          return tx.laptopRentalAgreement.create({
            data: { ...data, agreementNumber },
            include: agreementInclude,
          });
        });
      } catch (error) {
        if (attempt === 0 && isUniqueConflict(error)) continue;
        throw error;
      }
    }
    throw new Error('Could not assign an agreement number.');
  }

  updateAgreement(id: string, data: Prisma.LaptopRentalAgreementUpdateInput) {
    return this.db.laptopRentalAgreement.update({
      where: { id },
      data,
      include: agreementInclude,
    });
  }

  createUnit(data: Prisma.LaptopRentalUnitUncheckedCreateInput) {
    return this.db.laptopRentalUnit.create({ data });
  }

  updateUnit(id: string, data: Prisma.LaptopRentalUnitUpdateInput) {
    return this.db.laptopRentalUnit.update({ where: { id }, data });
  }

  deleteUnit(id: string) {
    return this.db.laptopRentalUnit.delete({ where: { id } });
  }

  async generateRentalInvoices(
    agreementId: string,
    periods: string[],
    amounts: { rentalAmount: number; gstAmount: number; totalAmount: number },
  ) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.laptopRentalInvoice.findMany({
        where: { agreementId, kind: 'RENTAL' },
        select: { period: true },
      });
      const have = new Set(existing.map((invoice) => invoice.period));
      let created = 0;
      for (const period of periods) {
        if (have.has(period)) continue;
        const invoiceNumber = await nextNumber(tx, 'INV', 'invoice');
        await tx.laptopRentalInvoice.create({
          data: {
            agreementId,
            invoiceNumber,
            kind: 'RENTAL',
            period,
            ...amounts,
            status: 'DRAFT',
          },
        });
        created += 1;
      }
      return created;
    });
  }

  async billCharges(
    agreementId: string,
    chargeIds: string[],
    amounts: { rentalAmount: number; gstAmount: number; totalAmount: number },
  ) {
    return this.db.$transaction(async (tx) => {
      const invoiceNumber = await nextNumber(tx, 'INV', 'invoice');
      const invoice = await tx.laptopRentalInvoice.create({
        data: {
          agreementId,
          invoiceNumber,
          kind: 'CHARGE',
          period: invoiceNumber,
          ...amounts,
          status: 'DRAFT',
        },
      });
      await tx.laptopRentalCharge.updateMany({
        where: { id: { in: chargeIds }, status: 'OPEN' },
        data: { invoiceId: invoice.id, status: 'BILLED' },
      });
      return invoice;
    });
  }

  async setInvoiceStatus(
    id: string,
    data: Prisma.LaptopRentalInvoiceUpdateInput,
    charges: 'PAID' | 'REOPEN' | null,
  ) {
    return this.db.$transaction(async (tx) => {
      const invoice = await tx.laptopRentalInvoice.update({ where: { id }, data });
      if (charges === 'PAID') {
        await tx.laptopRentalCharge.updateMany({
          where: { invoiceId: id, status: 'BILLED' },
          data: { status: 'PAID' },
        });
      }
      if (charges === 'REOPEN') {
        await tx.laptopRentalCharge.updateMany({
          where: { invoiceId: id },
          data: { status: 'OPEN', invoiceId: null },
        });
      }
      return invoice;
    });
  }

  async openCase(input: {
    agreementId: string;
    unitId: string;
    kind: 'HARDWARE_FAULT' | 'REPAIR' | 'REPLACEMENT';
    summary: string;
    reportedAt: Date;
    dueAt: Date;
    markInRepair: boolean;
  }) {
    return this.db.$transaction(async (tx) => {
      const created = await tx.laptopRentalCase.create({
        data: {
          agreementId: input.agreementId,
          unitId: input.unitId,
          kind: input.kind,
          summary: input.summary,
          reportedAt: input.reportedAt,
          dueAt: input.dueAt,
        },
      });
      if (input.markInRepair) {
        await tx.laptopRentalUnit.update({
          where: { id: input.unitId },
          data: { status: 'IN_REPAIR' },
        });
      }
      return created;
    });
  }

  async resolveCase(input: {
    caseId: string;
    unitId: string;
    resolution: string;
    resolvedAt: Date;
    returnToCustomer: boolean;
  }) {
    return this.db.$transaction(async (tx) => {
      const updated = await tx.laptopRentalCase.update({
        where: { id: input.caseId },
        data: { status: 'RESOLVED', resolution: input.resolution, resolvedAt: input.resolvedAt },
      });
      if (input.returnToCustomer) {
        await tx.laptopRentalUnit.update({
          where: { id: input.unitId },
          data: { status: 'DELIVERED' },
        });
      }
      return updated;
    });
  }

  async replaceUnit(input: {
    caseId: string;
    agreementId: string;
    unitId: string;
    assetTag: string;
    serialNumber: string;
    brand: string;
    model: string | null;
    processor: string | null;
    ram: string | null;
    storage: string | null;
    display: string | null;
    operatingSystem: string | null;
    deliveredOn: Date;
    resolution: string;
    resolvedAt: Date;
  }) {
    return this.db.$transaction(async (tx) => {
      await tx.laptopRentalUnit.update({
        where: { id: input.unitId },
        data: { status: 'REPLACED' },
      });
      const replacement = await tx.laptopRentalUnit.create({
        data: {
          agreementId: input.agreementId,
          assetTag: input.assetTag,
          serialNumber: input.serialNumber,
          brand: input.brand,
          model: input.model,
          processor: input.processor,
          ram: input.ram,
          storage: input.storage,
          display: input.display,
          operatingSystem: input.operatingSystem,
          status: 'DELIVERED',
          deliveredOn: input.deliveredOn,
          replacesUnitId: input.unitId,
        },
      });
      await tx.laptopRentalCase.update({
        where: { id: input.caseId },
        data: { status: 'RESOLVED', resolution: input.resolution, resolvedAt: input.resolvedAt },
      });
      return replacement;
    });
  }

  async createCharge(input: {
    agreementId: string;
    unitId: string | null;
    kind: 'PHYSICAL_DAMAGE' | 'LIQUID_DAMAGE' | 'THEFT' | 'LOSS';
    settlement: 'INVOICE' | 'DEPOSIT';
    amount: number;
    description: string;
    reportedOn: Date;
    status: 'OPEN' | 'DEDUCTED';
    unitStatus: 'STOLEN' | 'LOST' | null;
  }) {
    return this.db.$transaction(async (tx) => {
      const charge = await tx.laptopRentalCharge.create({
        data: {
          agreementId: input.agreementId,
          unitId: input.unitId,
          kind: input.kind,
          settlement: input.settlement,
          amount: input.amount,
          description: input.description,
          reportedOn: input.reportedOn,
          status: input.status,
        },
      });
      if (input.unitId && input.unitStatus) {
        await tx.laptopRentalUnit.update({
          where: { id: input.unitId },
          data: { status: input.unitStatus },
        });
        await tx.laptopRentalCase.updateMany({
          where: { unitId: input.unitId, status: 'OPEN' },
          data: {
            status: 'RESOLVED',
            resolution:
              input.unitStatus === 'STOLEN' ? 'Laptop reported stolen.' : 'Laptop reported lost.',
            resolvedAt: new Date(),
          },
        });
      }
      return charge;
    });
  }

  waiveCharge(id: string) {
    return this.db.laptopRentalCharge.update({
      where: { id },
      data: { status: 'WAIVED' },
    });
  }
}

async function nextNumber(
  tx: Prisma.TransactionClient,
  prefix: string,
  kind: 'agreement' | 'invoice',
) {
  const year = new Date().getUTCFullYear();
  const head = `${prefix}-${year}-`;
  const currentNumber =
    kind === 'agreement'
      ? (
          await tx.laptopRentalAgreement.findFirst({
            where: { agreementNumber: { startsWith: head } },
            orderBy: { agreementNumber: 'desc' },
            select: { agreementNumber: true },
          })
        )?.agreementNumber
      : (
          await tx.laptopRentalInvoice.findFirst({
            where: { invoiceNumber: { startsWith: head } },
            orderBy: { invoiceNumber: 'desc' },
            select: { invoiceNumber: true },
          })
        )?.invoiceNumber;
  const current = currentNumber ? Number(currentNumber.slice(head.length)) : 0;
  const sequence = Number.isFinite(current) ? current + 1 : 1;
  return `${head}${String(sequence).padStart(4, '0')}`;
}

function isUniqueConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
