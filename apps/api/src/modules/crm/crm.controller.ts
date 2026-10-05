import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  crmActivitySchema,
  crmCompanySchema,
  crmContactSchema,
  crmLaptopSchema,
  crmRentalDiscountsSchema,
  LAPTOP_RENTAL_STATUSES,
  laptopRentalProposalSchema,
  laptopRentalStatusSchema,
  updateLaptopRentalProposalSchema,
  type CreateLaptopRentalProposalInput,
  type CrmActivityInput,
  type CrmCompanyInput,
  type CrmContactInput,
  type CrmLaptopInput,
  type CrmRentalDiscountsInput,
  type LaptopRentalStatusInput,
  type UpdateLaptopRentalProposalInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { HrService } from '../hr/hr.service';
import { CrmService } from './crm.service';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm')
export class CrmController {
  constructor(
    private readonly crm: CrmService,
    private readonly hr: HrService,
  ) {}

  @Get('dashboard')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async dashboard() {
    return ok(await this.crm.dashboard());
  }

  @Get('rental-discounts')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async rentalDiscounts() {
    return ok(await this.crm.listRentalDiscounts());
  }

  @Put('rental-discounts')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async saveRentalDiscounts(
    @Body(new ZodValidationPipe(crmRentalDiscountsSchema)) body: CrmRentalDiscountsInput,
  ) {
    return ok(await this.crm.saveRentalDiscounts(body));
  }

  @Get('companies')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async companies() {
    return ok(await this.crm.listCompanies());
  }

  @Post('companies')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async createCompany(@Body(new ZodValidationPipe(crmCompanySchema)) body: CrmCompanyInput) {
    return ok(await this.crm.createCompany(body));
  }

  @Get('companies/:id')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async company(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.crm.getCompany(id));
  }

  @Put('companies/:id')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(crmCompanySchema)) body: CrmCompanyInput,
  ) {
    return ok(await this.crm.updateCompany(id, body));
  }

  @Delete('companies/:id')
  @RequirePermissions(PERMISSIONS.CRM_DELETE)
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.crm.deleteCompany(id));
  }

  @Get('contacts')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async contacts() {
    return ok(await this.crm.listContacts());
  }

  @Post('contacts')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async createContact(@Body(new ZodValidationPipe(crmContactSchema)) body: CrmContactInput) {
    return ok(await this.crm.createContact(body));
  }

  @Delete('contacts/:id')
  @RequirePermissions(PERMISSIONS.CRM_DELETE)
  async deleteContact(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.crm.deleteContact(id));
  }

  @Post('activities')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async createActivity(@Body(new ZodValidationPipe(crmActivitySchema)) body: CrmActivityInput) {
    return ok(await this.crm.createActivity(body));
  }

  @Get('laptops')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async laptops() {
    return ok(await this.crm.listLaptops());
  }

  @Post('laptops')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async createLaptop(@Body(new ZodValidationPipe(crmLaptopSchema)) body: CrmLaptopInput) {
    return ok(await this.crm.createLaptop(body));
  }

  @Get('laptops/:id')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async laptop(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.crm.getLaptop(id));
  }

  @Put('laptops/:id')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateLaptop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(crmLaptopSchema)) body: CrmLaptopInput,
  ) {
    return ok(await this.crm.updateLaptop(id, body));
  }

  @Delete('laptops/:id')
  @RequirePermissions(PERMISSIONS.CRM_DELETE)
  async deleteLaptop(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.crm.deleteLaptop(id));
  }

  @Get('rentals')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async rentals() {
    return ok(await this.crm.listRentals());
  }

  @Get('rental-proposals')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async rentalProposals(@Query('status') status?: string) {
    const rows = await this.hr.listLaptopRentals();
    if (!status) return ok(rows);
    if (!(LAPTOP_RENTAL_STATUSES as readonly string[]).includes(status)) return ok([]);
    return ok(rows.filter((row) => row.status === status));
  }

  @Post('rental-proposals')
  @RequirePermissions(PERMISSIONS.CRM_CREATE)
  async createRentalProposal(
    @Body(new ZodValidationPipe(laptopRentalProposalSchema)) body: CreateLaptopRentalProposalInput,
  ) {
    return ok(await this.hr.createLaptopRental(body));
  }

  @Get('rental-proposals/:id')
  @RequirePermissions(PERMISSIONS.CRM_VIEW)
  async rentalProposal(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.hr.getLaptopRental(id));
  }

  @Put('rental-proposals/:id')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateRentalProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateLaptopRentalProposalSchema))
    body: UpdateLaptopRentalProposalInput,
  ) {
    return ok(await this.hr.updateLaptopRental(id, body));
  }

  @Put('rental-proposals/:id/status')
  @RequirePermissions(PERMISSIONS.CRM_EDIT)
  async updateRentalProposalStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(laptopRentalStatusSchema)) body: LaptopRentalStatusInput,
  ) {
    return ok(await this.hr.updateLaptopRentalStatus(id, body.status));
  }

  @Delete('rental-proposals/:id')
  @RequirePermissions(PERMISSIONS.CRM_DELETE)
  async deleteRentalProposal(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.hr.deleteLaptopRental(id));
  }
}
