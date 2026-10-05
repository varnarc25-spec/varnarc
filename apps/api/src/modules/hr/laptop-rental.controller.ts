import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  createLaptopRentalCaseSchema,
  createLaptopRentalChargeSchema,
  createLaptopRentalUnitSchema,
  updateLaptopRentalUnitSchema,
  laptopRentalUnitDateSchema,
  recordLaptopRentalDepositSchema,
  replaceLaptopRentalUnitSchema,
  resolveLaptopRentalCaseSchema,
  startLaptopRentalSchema,
  updateLaptopRentalAgreementSchema,
  updateLaptopRentalInvoiceSchema,
  type CreateLaptopRentalCaseInput,
  type CreateLaptopRentalChargeInput,
  type CreateLaptopRentalUnitInput,
  type UpdateLaptopRentalUnitInput,
  type LaptopRentalUnitDateInput,
  type RecordLaptopRentalDepositInput,
  type ReplaceLaptopRentalUnitInput,
  type ResolveLaptopRentalCaseInput,
  type StartLaptopRentalInput,
  type UpdateLaptopRentalAgreementInput,
  type UpdateLaptopRentalInvoiceInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { LaptopRentalService } from './laptop-rental.service';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm')
export class LaptopRentalController {
  constructor(private readonly rentals: LaptopRentalService) {}

  @Get('rental-proposals/:id/service')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async service(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.rentals.get(id));
  }

  @Post('rental-proposals/:id/agreement')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async start(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(startLaptopRentalSchema)) body: StartLaptopRentalInput,
  ) {
    return ok(await this.rentals.start(id, body));
  }

  @Put('rental-agreements/:id')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateAgreement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateLaptopRentalAgreementSchema))
    body: UpdateLaptopRentalAgreementInput,
  ) {
    return ok(await this.rentals.updateAgreement(id, body));
  }

  @Post('rental-agreements/:id/units')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async addUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createLaptopRentalUnitSchema)) body: CreateLaptopRentalUnitInput,
  ) {
    return ok(await this.rentals.addUnit(id, body));
  }

  @Put('rental-agreements/:id/units/:unitId')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Body(new ZodValidationPipe(updateLaptopRentalUnitSchema)) body: UpdateLaptopRentalUnitInput,
  ) {
    return ok(await this.rentals.updateUnit(id, unitId, body));
  }

  @Post('rental-agreements/:id/units/:unitId/deliver')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async deliver(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Body(new ZodValidationPipe(laptopRentalUnitDateSchema)) body: LaptopRentalUnitDateInput,
  ) {
    return ok(await this.rentals.deliver(id, unitId, body));
  }

  @Post('rental-agreements/:id/units/:unitId/pickup')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async pickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Body(new ZodValidationPipe(laptopRentalUnitDateSchema)) body: LaptopRentalUnitDateInput,
  ) {
    return ok(await this.rentals.pickup(id, unitId, body));
  }

  @Delete('rental-agreements/:id/units/:unitId')
  @RequirePermissions(PERMISSIONS.CRM_DELETE)
  async removeUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('unitId', ParseUUIDPipe) unitId: string,
  ) {
    return ok(await this.rentals.removeUnit(id, unitId));
  }

  @Post('rental-agreements/:id/deposit/receive')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async receiveDeposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(recordLaptopRentalDepositSchema))
    body: RecordLaptopRentalDepositInput,
  ) {
    return ok(await this.rentals.receiveDeposit(id, body));
  }

  @Post('rental-agreements/:id/deposit/refund')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async refundDeposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(recordLaptopRentalDepositSchema))
    body: RecordLaptopRentalDepositInput,
  ) {
    return ok(await this.rentals.refundDeposit(id, body));
  }

  @Post('rental-agreements/:id/invoices/generate')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async generateInvoices(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.rentals.generateInvoices(id));
  }

  @Post('rental-agreements/:id/charges/bill')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async billCharges(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.rentals.billCharges(id));
  }

  @Put('rental-agreements/:id/invoices/:invoiceId')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async setInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body(new ZodValidationPipe(updateLaptopRentalInvoiceSchema))
    body: UpdateLaptopRentalInvoiceInput,
  ) {
    return ok(await this.rentals.setInvoiceStatus(id, invoiceId, body));
  }

  @Post('rental-agreements/:id/cases')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async openCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createLaptopRentalCaseSchema)) body: CreateLaptopRentalCaseInput,
  ) {
    return ok(await this.rentals.openCase(id, body));
  }

  @Post('rental-agreements/:id/cases/:caseId/resolve')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async resolveCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body(new ZodValidationPipe(resolveLaptopRentalCaseSchema)) body: ResolveLaptopRentalCaseInput,
  ) {
    return ok(await this.rentals.resolveCase(id, caseId, body));
  }

  @Post('rental-agreements/:id/cases/:caseId/replace')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async replaceUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body(new ZodValidationPipe(replaceLaptopRentalUnitSchema)) body: ReplaceLaptopRentalUnitInput,
  ) {
    return ok(await this.rentals.replaceUnit(id, caseId, body));
  }

  @Post('rental-agreements/:id/charges')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async addCharge(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createLaptopRentalChargeSchema))
    body: CreateLaptopRentalChargeInput,
  ) {
    return ok(await this.rentals.addCharge(id, body));
  }

  @Post('rental-agreements/:id/charges/:chargeId/waive')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async waiveCharge(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('chargeId', ParseUUIDPipe) chargeId: string,
  ) {
    return ok(await this.rentals.waiveCharge(id, chargeId));
  }

  @Post('rental-agreements/:id/close')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async close(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.rentals.close(id));
  }

  @Post('rental-agreements/:id/cancel')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.rentals.cancel(id));
  }
}
