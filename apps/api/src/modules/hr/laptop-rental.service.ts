import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Repositories } from '@varnarc/database';
import {
  addCalendarMonths,
  agreementIsActive,
  contractUnitCount,
  refundableDeposit,
  rentalCloseReview,
  rentalInvoicePeriods,
  rentalMonthInvoice,
  slaDueAt,
  withheldDeposit,
  type CreateLaptopRentalCaseInput,
  type CreateLaptopRentalChargeInput,
  type CreateLaptopRentalUnitInput,
  type UpdateLaptopRentalUnitInput,
  type LaptopRentalChargeStatus,
  type LaptopRentalInvoiceStatus,
  type LaptopRentalServiceView,
  type LaptopRentalUnitDateInput,
  type LaptopRentalUnitStatus,
  type RecordLaptopRentalDepositInput,
  type ReplaceLaptopRentalUnitInput,
  type ResolveLaptopRentalCaseInput,
  type StartLaptopRentalInput,
  type UpdateLaptopRentalAgreementInput,
  type UpdateLaptopRentalInvoiceInput,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';

@Injectable()
export class LaptopRentalService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  async get(proposalId: string): Promise<LaptopRentalServiceView> {
    const proposal = await this.proposal(proposalId);
    const agreement = await this.repos.laptopRentals.getByProposal(proposalId);
    return toView(proposal, agreement);
  }

  async start(proposalId: string, input: StartLaptopRentalInput) {
    const proposal = await this.proposal(proposalId);
    if (proposal.status !== 'ACCEPTED') {
      throw new BadRequestException('Accept the proposal before starting the rental.');
    }
    const existing = await this.repos.laptopRentals.getByProposal(proposalId);
    if (existing) throw new BadRequestException('This proposal already has a rental.');
    const signed = agreementIsActive({
      customerSignedOn: input.customerSignedOn ?? null,
      issuerSignedOn: input.issuerSignedOn ?? null,
    });
    const agreement = await this.unique(() =>
      this.repos.laptopRentals.createAgreement({
        proposalId,
        status: signed ? 'ACTIVE' : 'PENDING_SIGNATURE',
        poNumber: input.poNumber,
        startDate: asDate(input.startDate),
        endDate: asDate(addCalendarMonths(input.startDate, proposal.commitmentMonths)),
        slaHours: input.slaHours,
        quantity: proposal.quantity,
        commitmentMonths: proposal.commitmentMonths,
        commitmentRate: roundMoney(
          money(proposal.commitmentRate) * (1 - money(proposal.discountPercent) / 100),
        ),
        gstPercent: money(proposal.gstPercent),
        depositPerLaptop: money(proposal.depositPerLaptop),
        deliveryLocation: proposal.deliveryLocation,
        brand: proposal.brand,
        customerSignatoryName: input.customerSignatoryName,
        customerSignatoryDesignation: input.customerSignatoryDesignation,
        customerSignedOn: input.customerSignedOn ? asDate(input.customerSignedOn) : null,
        issuerSignatoryName: input.issuerSignatoryName,
        issuerSignatoryDesignation: input.issuerSignatoryDesignation,
        issuerSignedOn: input.issuerSignedOn ? asDate(input.issuerSignedOn) : null,
      }),
    );
    const selected = proposal.laptops.filter((link) => link.laptop.deletedAt === null);
    const physical = selected.filter((link) => link.laptop.assetTag);
    for (const link of physical) {
      const assetTag = link.laptop.assetTag;
      if (!assetTag) continue;
      await this.repos.laptopRentals.createUnit({
        agreementId: agreement.id,
        assetTag,
        serialNumber: link.laptop.serialNumber ?? '',
        brand: link.laptop.brand,
        model: link.laptop.model,
        processor: link.laptop.processor,
        ram: link.laptop.ram,
        storage: link.laptop.storage,
        display: link.laptop.display,
        operatingSystem: link.laptop.operatingSystem,
      });
    }
    await this.repos.crm.markLaptopsRented(physical.map((link) => link.laptop.id));
    return { saved: true };
  }

  async updateAgreement(agreementId: string, input: UpdateLaptopRentalAgreementInput) {
    const agreement = await this.mutable(agreementId);
    const signed = agreementIsActive({
      customerSignedOn: input.customerSignedOn ?? null,
      issuerSignedOn: input.issuerSignedOn ?? null,
    });
    await this.repos.laptopRentals.updateAgreement(agreement.id, {
      poNumber: input.poNumber,
      slaHours: input.slaHours,
      customerSignatoryName: input.customerSignatoryName,
      customerSignatoryDesignation: input.customerSignatoryDesignation,
      customerSignedOn: input.customerSignedOn ? asDate(input.customerSignedOn) : null,
      issuerSignatoryName: input.issuerSignatoryName,
      issuerSignatoryDesignation: input.issuerSignatoryDesignation,
      issuerSignedOn: input.issuerSignedOn ? asDate(input.issuerSignedOn) : null,
      status: signed ? 'ACTIVE' : 'PENDING_SIGNATURE',
    });
    return { saved: true };
  }

  async addUnit(agreementId: string, input: CreateLaptopRentalUnitInput) {
    const agreement = await this.mutable(agreementId);
    if (contractUnitCount(agreement.units) >= agreement.quantity) {
      throw new BadRequestException(
        `This rental is for ${agreement.quantity} laptops. Replacements are added from a support case.`,
      );
    }
    await this.unique(() =>
      this.repos.laptopRentals.createUnit({
        agreementId: agreement.id,
        assetTag: input.assetTag,
        serialNumber: input.serialNumber,
        ...laptopDetails(input, agreement.brand),
      }),
    );
    return { saved: true };
  }

  async updateUnit(agreementId: string, unitId: string, input: UpdateLaptopRentalUnitInput) {
    const agreement = await this.mutable(agreementId);
    const unit = this.unit(agreement, unitId);
    await this.unique(() =>
      this.repos.laptopRentals.updateUnit(unit.id, {
        assetTag: input.assetTag,
        serialNumber: input.serialNumber,
        ...laptopDetails(input, agreement.brand),
      }),
    );
    return { saved: true };
  }

  async deliver(agreementId: string, unitId: string, input: LaptopRentalUnitDateInput) {
    const agreement = await this.mutable(agreementId);
    const unit = this.unit(agreement, unitId);
    if (unit.status !== 'READY')
      throw new BadRequestException(
        'Only a laptop that is ready to deliver can be marked delivered.',
      );
    if (input.on < iso(agreement.startDate)) {
      throw new BadRequestException('Delivery cannot be before the rental start date.');
    }
    await this.repos.laptopRentals.updateUnit(unit.id, {
      status: 'DELIVERED',
      deliveredOn: asDate(input.on),
      notes: input.notes ?? unit.notes,
    });
    return { saved: true };
  }

  async pickup(agreementId: string, unitId: string, input: LaptopRentalUnitDateInput) {
    const agreement = await this.mutable(agreementId);
    const unit = this.unit(agreement, unitId);
    if (unit.status !== 'DELIVERED' && unit.status !== 'IN_REPAIR') {
      throw new BadRequestException('Pick up a laptop that is with the customer.');
    }
    const open = agreement.cases.some((item) => item.unitId === unit.id && item.status === 'OPEN');
    if (open) throw new BadRequestException('Resolve the open support case before pickup.');
    if (unit.deliveredOn && input.on < iso(unit.deliveredOn)) {
      throw new BadRequestException('Pickup cannot be before delivery.');
    }
    await this.repos.laptopRentals.updateUnit(unit.id, {
      status: 'PICKED_UP',
      pickedUpOn: asDate(input.on),
      notes: input.notes ?? unit.notes,
    });
    return { saved: true };
  }

  async removeUnit(agreementId: string, unitId: string) {
    const agreement = await this.mutable(agreementId);
    const unit = this.unit(agreement, unitId);
    if (unit.status !== 'READY')
      throw new BadRequestException('Remove a laptop only before it is delivered.');
    if (
      agreement.cases.some((item) => item.unitId === unit.id) ||
      agreement.charges.some((item) => item.unitId === unit.id)
    ) {
      throw new BadRequestException('This laptop has a support case or a charge.');
    }
    await this.repos.laptopRentals.deleteUnit(unit.id);
    return { saved: true };
  }

  async receiveDeposit(agreementId: string, input: RecordLaptopRentalDepositInput) {
    const agreement = await this.mutable(agreementId);
    await this.repos.laptopRentals.updateAgreement(agreement.id, {
      depositReceived: input.amount,
      depositReceivedOn: asDate(input.on),
      depositNotes: input.notes ?? agreement.depositNotes,
    });
    return { saved: true };
  }

  async refundDeposit(agreementId: string, input: RecordLaptopRentalDepositInput) {
    const agreement = await this.mutable(agreementId);
    const withheld = withheldDeposit(agreement.charges.map(chargeMoney));
    const refundable = refundableDeposit(money(agreement.depositReceived), withheld);
    if (input.amount > refundable) {
      throw new BadRequestException(`The refund cannot be more than ${refundable}.`);
    }
    await this.repos.laptopRentals.updateAgreement(agreement.id, {
      depositRefunded: input.amount,
      depositRefundedOn: asDate(input.on),
      depositNotes: input.notes ?? agreement.depositNotes,
    });
    return { saved: true };
  }

  async generateInvoices(agreementId: string) {
    const agreement = await this.active(agreementId);
    const amounts = rentalMonthInvoice(
      money(agreement.commitmentRate),
      agreement.quantity,
      money(agreement.gstPercent),
    );
    const created = await this.repos.laptopRentals.generateRentalInvoices(
      agreement.id,
      rentalInvoicePeriods(iso(agreement.startDate), agreement.commitmentMonths),
      amounts,
    );
    return { created };
  }

  async billCharges(agreementId: string) {
    const agreement = await this.mutable(agreementId);
    const open = agreement.charges.filter(
      (charge) => charge.settlement === 'INVOICE' && charge.status === 'OPEN',
    );
    if (open.length === 0) throw new BadRequestException('There are no open charges to invoice.');
    const rentalAmount = roundMoney(open.reduce((sum, charge) => sum + money(charge.amount), 0));
    const gstAmount = roundMoney((rentalAmount * money(agreement.gstPercent)) / 100);
    await this.repos.laptopRentals.billCharges(
      agreement.id,
      open.map((charge) => charge.id),
      { rentalAmount, gstAmount, totalAmount: roundMoney(rentalAmount + gstAmount) },
    );
    return { saved: true };
  }

  async setInvoiceStatus(
    agreementId: string,
    invoiceId: string,
    input: UpdateLaptopRentalInvoiceInput,
  ) {
    const agreement = await this.mutable(agreementId);
    const invoice = agreement.invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found');
    const next = input.status;
    if (invoice.status === 'PAID' || invoice.status === 'VOID') {
      throw new BadRequestException('This invoice can no longer be changed.');
    }
    if (next === 'ISSUED' && invoice.status !== 'DRAFT') {
      throw new BadRequestException('Issue a draft invoice.');
    }
    if (next === 'PAID' && invoice.status !== 'ISSUED') {
      throw new BadRequestException('Mark the invoice issued before recording payment.');
    }
    const today = asDate(new Date().toISOString().slice(0, 10));
    await this.repos.laptopRentals.setInvoiceStatus(
      invoice.id,
      {
        status: next,
        issuedOn: next === 'ISSUED' ? today : invoice.issuedOn,
        paidOn: next === 'PAID' ? today : null,
      },
      next === 'PAID' && invoice.kind === 'CHARGE'
        ? 'PAID'
        : next === 'VOID' && invoice.kind === 'CHARGE'
          ? 'REOPEN'
          : null,
    );
    return { saved: true };
  }

  async openCase(agreementId: string, input: CreateLaptopRentalCaseInput) {
    const agreement = await this.mutable(agreementId);
    const unit = this.unit(agreement, input.unitId);
    if (unit.status !== 'DELIVERED' && unit.status !== 'IN_REPAIR') {
      throw new BadRequestException('Open a support case for a laptop that is with the customer.');
    }
    const reportedAt = new Date();
    await this.repos.laptopRentals.openCase({
      agreementId: agreement.id,
      unitId: unit.id,
      kind: input.kind,
      summary: input.summary,
      reportedAt,
      dueAt: slaDueAt(reportedAt, agreement.slaHours),
      markInRepair: unit.status === 'DELIVERED',
    });
    return { saved: true };
  }

  async resolveCase(agreementId: string, caseId: string, input: ResolveLaptopRentalCaseInput) {
    const agreement = await this.mutable(agreementId);
    const supportCase = agreement.cases.find((item) => item.id === caseId);
    if (!supportCase) throw new NotFoundException('Support case not found');
    if (supportCase.status === 'RESOLVED')
      throw new BadRequestException('This support case is already resolved.');
    const unit = this.unit(agreement, supportCase.unitId);
    const others = agreement.cases.some(
      (item) => item.unitId === unit.id && item.status === 'OPEN' && item.id !== supportCase.id,
    );
    await this.repos.laptopRentals.resolveCase({
      caseId: supportCase.id,
      unitId: unit.id,
      resolution: input.resolution,
      resolvedAt: new Date(),
      returnToCustomer: unit.status === 'IN_REPAIR' && !others,
    });
    return { saved: true };
  }

  async replaceUnit(agreementId: string, caseId: string, input: ReplaceLaptopRentalUnitInput) {
    const agreement = await this.mutable(agreementId);
    const supportCase = agreement.cases.find((item) => item.id === caseId);
    if (!supportCase) throw new NotFoundException('Support case not found');
    if (supportCase.status === 'RESOLVED')
      throw new BadRequestException('This support case is already resolved.');
    const unit = this.unit(agreement, supportCase.unitId);
    await this.unique(() =>
      this.repos.laptopRentals.replaceUnit({
        caseId: supportCase.id,
        agreementId: agreement.id,
        unitId: unit.id,
        assetTag: input.assetTag,
        serialNumber: input.serialNumber,
        brand: unit.brand,
        model: unit.model,
        processor: unit.processor,
        ram: unit.ram,
        storage: unit.storage,
        display: unit.display,
        operatingSystem: unit.operatingSystem,
        deliveredOn: asDate(new Date().toISOString().slice(0, 10)),
        resolution: input.resolution,
        resolvedAt: new Date(),
      }),
    );
    return { saved: true };
  }

  async addCharge(agreementId: string, input: CreateLaptopRentalChargeInput) {
    const agreement = await this.mutable(agreementId);
    const unit = input.unitId ? this.unit(agreement, input.unitId) : null;
    if ((input.kind === 'THEFT' || input.kind === 'LOSS') && !unit) {
      throw new BadRequestException('Choose the laptop that was lost or stolen.');
    }
    if (unit && (input.kind === 'THEFT' || input.kind === 'LOSS')) {
      if (unit.status !== 'DELIVERED' && unit.status !== 'IN_REPAIR') {
        throw new BadRequestException(
          'Record loss or theft for a laptop that is with the customer.',
        );
      }
    }
    if (input.settlement === 'DEPOSIT') {
      const withheld = withheldDeposit(agreement.charges.map(chargeMoney));
      const refundable = refundableDeposit(money(agreement.depositReceived), withheld);
      if (input.amount > refundable) {
        throw new BadRequestException('That deduction is more than the deposit still available.');
      }
    }
    await this.repos.laptopRentals.createCharge({
      agreementId: agreement.id,
      unitId: unit?.id ?? null,
      kind: input.kind,
      settlement: input.settlement,
      amount: input.amount,
      description: input.description,
      reportedOn: asDate(new Date().toISOString().slice(0, 10)),
      status: input.settlement === 'DEPOSIT' ? 'DEDUCTED' : 'OPEN',
      unitStatus: input.kind === 'THEFT' ? 'STOLEN' : input.kind === 'LOSS' ? 'LOST' : null,
    });
    return { saved: true };
  }

  async waiveCharge(agreementId: string, chargeId: string) {
    const agreement = await this.mutable(agreementId);
    const charge = agreement.charges.find((item) => item.id === chargeId);
    if (!charge) throw new NotFoundException('Charge not found');
    if (charge.status !== 'OPEN')
      throw new BadRequestException('Only an open invoiced charge can be waived.');
    await this.repos.laptopRentals.waiveCharge(charge.id);
    return { saved: true };
  }

  async close(agreementId: string) {
    const agreement = await this.mutable(agreementId);
    const review = reviewOf(agreement);
    if (!review.canClose)
      throw new BadRequestException(review.blockers[0] ?? 'This rental cannot be closed yet.');
    await this.repos.laptopRentals.updateAgreement(agreement.id, { status: 'CLOSED' });
    return { saved: true };
  }

  async cancel(agreementId: string) {
    const agreement = await this.mutable(agreementId);
    const sent = agreement.units.some((unit) => unit.status !== 'READY');
    if (sent) throw new BadRequestException('Cancel the rental only before a laptop is delivered.');
    if (money(agreement.depositReceived) > 0) {
      throw new BadRequestException('Refund or clear the deposit before cancelling.');
    }
    if (
      agreement.invoices.some((invoice) => invoice.status === 'PAID' || invoice.status === 'ISSUED')
    ) {
      throw new BadRequestException('Void issued invoices before cancelling.');
    }
    await this.repos.laptopRentals.updateAgreement(agreement.id, { status: 'CANCELLED' });
    return { saved: true };
  }

  private async proposal(id: string) {
    const proposal = await this.repos.hr.getLaptopRental(id);
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  private async mutable(id: string) {
    const agreement = await this.repos.laptopRentals.getById(id);
    if (!agreement) throw new NotFoundException('Rental not found');
    if (agreement.status === 'CLOSED' || agreement.status === 'CANCELLED') {
      throw new BadRequestException('This rental is finished.');
    }
    return agreement;
  }

  private async active(id: string) {
    const agreement = await this.mutable(id);
    if (agreement.status !== 'ACTIVE') {
      throw new BadRequestException('Record both signatures before billing.');
    }
    return agreement;
  }

  private unit(
    agreement: {
      units: Array<{
        id: string;
        status: LaptopRentalUnitStatus;
        deliveredOn: Date | null;
        notes: string | null;
        brand: string;
        model: string | null;
        processor: string | null;
        ram: string | null;
        storage: string | null;
        display: string | null;
        operatingSystem: string | null;
      }>;
    },
    unitId: string,
  ) {
    const unit = agreement.units.find((item) => item.id === unitId);
    if (!unit) throw new NotFoundException('Laptop not found');
    return unit;
  }

  private async unique<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      const message = conflictMessage(error);
      if (message) throw new BadRequestException(message);
      throw error;
    }
  }
}

function asDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function iso(value: Date) {
  return value.toISOString().slice(0, 10);
}

function money(value: { toString(): string } | number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function chargeMoney(charge: {
  status: LaptopRentalChargeStatus;
  amount: { toString(): string } | number;
}) {
  return { status: charge.status, amount: money(charge.amount) };
}

function conflictMessage(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'P2002')
    return null;
  const target = String(
    'meta' in error ? ((error.meta as { target?: unknown } | undefined)?.target ?? '') : '',
  );
  if (target.includes('asset_tag')) return 'That asset tag is already used on another laptop.';
  if (target.includes('proposal')) return 'This proposal already has a rental.';
  return 'That record already exists.';
}

type ProposalRow = {
  id: string;
  proposalNumber: string;
  status: LaptopRentalServiceView['proposal']['status'];
  customerCompanyName: string;
  quantity: number;
  commitmentMonths: number;
  commitmentRate: { toString(): string } | number;
  gstPercent: { toString(): string } | number;
  depositPerLaptop: { toString(): string } | number;
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

type AgreementRow = NonNullable<Awaited<ReturnType<Repositories['laptopRentals']['getById']>>>;

function reviewOf(agreement: AgreementRow) {
  return rentalCloseReview({
    units: agreement.units.map((unit) => ({ status: unit.status })),
    cases: agreement.cases.map((item) => ({ status: item.status })),
    charges: agreement.charges.map((item) => ({ status: item.status })),
    invoices: agreement.invoices.map((item) => ({ status: item.status })),
    depositReceived: money(agreement.depositReceived),
    depositRefundedOn: agreement.depositRefundedOn ? iso(agreement.depositRefundedOn) : null,
  });
}

function toView(proposal: ProposalRow, agreement: AgreementRow | null): LaptopRentalServiceView {
  const source = agreement ?? proposal;
  const rate = money(source.commitmentRate);
  const gstPercent = money(source.gstPercent);
  const depositPerLaptop = money(source.depositPerLaptop);
  const invoice = rentalMonthInvoice(rate, source.quantity, gstPercent);
  const withheld = agreement ? withheldDeposit(agreement.charges.map(chargeMoney)) : 0;
  const received = agreement ? money(agreement.depositReceived) : 0;
  const review = agreement ? reviewOf(agreement) : { canClose: false, blockers: [] };
  return {
    proposal: {
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      status: proposal.status,
      customerCompanyName: proposal.customerCompanyName,
      quantity: source.quantity,
      commitmentMonths: source.commitmentMonths,
      commitmentRate: rate,
      gstPercent,
      depositPerLaptop,
      depositTotal: roundMoney(depositPerLaptop * source.quantity),
      monthlyRental: invoice.rentalAmount,
      monthlyGst: invoice.gstAmount,
      monthlyTotal: invoice.totalAmount,
      deliveryLocation: source.deliveryLocation,
      brand: source.brand,
      processor: proposal.processor,
      ram: proposal.ram,
      storage: proposal.storage,
      display: proposal.display,
      operatingSystem: proposal.operatingSystem,
      issuerName: proposal.issuerName,
      issuerAddress: proposal.issuerAddress,
      issuerPhone: proposal.issuerPhone,
      issuerEmail: proposal.issuerEmail,
      issuerGstin: proposal.issuerGstin,
    },
    agreement: agreement
      ? {
          id: agreement.id,
          agreementNumber: agreement.agreementNumber,
          status: agreement.status,
          poNumber: agreement.poNumber,
          startDate: iso(agreement.startDate),
          endDate: iso(agreement.endDate),
          slaHours: agreement.slaHours,
          customerSignatoryName: agreement.customerSignatoryName,
          customerSignatoryDesignation: agreement.customerSignatoryDesignation,
          customerSignedOn: agreement.customerSignedOn ? iso(agreement.customerSignedOn) : null,
          issuerSignatoryName: agreement.issuerSignatoryName,
          issuerSignatoryDesignation: agreement.issuerSignatoryDesignation,
          issuerSignedOn: agreement.issuerSignedOn ? iso(agreement.issuerSignedOn) : null,
          depositExpected: roundMoney(depositPerLaptop * source.quantity),
          depositReceived: received,
          depositReceivedOn: agreement.depositReceivedOn ? iso(agreement.depositReceivedOn) : null,
          depositRefunded: money(agreement.depositRefunded),
          depositRefundedOn: agreement.depositRefundedOn ? iso(agreement.depositRefundedOn) : null,
          depositWithheld: withheld,
          depositRefundable: refundableDeposit(received, withheld),
          depositNotes: agreement.depositNotes,
          units: agreement.units.map((unit) => ({
            id: unit.id,
            assetTag: unit.assetTag,
            serialNumber: unit.serialNumber,
            brand: unit.brand,
            model: unit.model,
            processor: unit.processor,
            ram: unit.ram,
            storage: unit.storage,
            display: unit.display,
            operatingSystem: unit.operatingSystem,
            status: unit.status,
            deliveredOn: unit.deliveredOn ? iso(unit.deliveredOn) : null,
            pickedUpOn: unit.pickedUpOn ? iso(unit.pickedUpOn) : null,
            replacesUnitId: unit.replacesUnitId,
            notes: unit.notes,
          })),
          invoices: agreement.invoices.map((item) => ({
            id: item.id,
            invoiceNumber: item.invoiceNumber,
            kind: item.kind,
            period: item.period,
            rentalAmount: money(item.rentalAmount),
            gstAmount: money(item.gstAmount),
            totalAmount: money(item.totalAmount),
            status: item.status as LaptopRentalInvoiceStatus,
            issuedOn: item.issuedOn ? iso(item.issuedOn) : null,
            paidOn: item.paidOn ? iso(item.paidOn) : null,
          })),
          cases: agreement.cases.map((item) => ({
            id: item.id,
            unitId: item.unitId,
            assetTag: item.unit.assetTag,
            kind: item.kind,
            status: item.status,
            summary: item.summary,
            resolution: item.resolution,
            reportedAt: item.reportedAt.toISOString(),
            dueAt: item.dueAt.toISOString(),
            resolvedAt: item.resolvedAt ? item.resolvedAt.toISOString() : null,
            overdue: item.status !== 'RESOLVED' && item.dueAt.getTime() < Date.now(),
          })),
          charges: agreement.charges.map((item) => ({
            id: item.id,
            unitId: item.unitId,
            assetTag: item.unit?.assetTag ?? null,
            kind: item.kind,
            settlement: item.settlement,
            amount: money(item.amount),
            description: item.description,
            status: item.status,
            reportedOn: iso(item.reportedOn),
          })),
          canClose: review.canClose,
          closeBlockers: review.blockers,
        }
      : null,
  };
}

function laptopDetails(
  input: {
    brand: string | null;
    model: string | null;
    processor: string | null;
    ram: string | null;
    storage: string | null;
    display: string | null;
    operatingSystem: string | null;
  },
  fallbackBrand: string,
) {
  return {
    brand: input.brand ?? fallbackBrand,
    model: input.model,
    processor: input.processor,
    ram: input.ram,
    storage: input.storage,
    display: input.display,
    operatingSystem: input.operatingSystem,
  };
}
