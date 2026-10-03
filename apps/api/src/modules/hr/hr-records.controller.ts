import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  assignHrAssetSchema,
  assignHrClientSchema,
  assignHrRoleSchema,
  createHrAccountSchema,
  createHrAnnouncementSchema,
  createHrAssetMasterSchema,
  createHrAssetSchema,
  createHrCandidateSchema,
  createHrClientSchema,
  createHrDocumentSchema,
  createHrDocumentTypeSchema,
  createHrEssRequestSchema,
  createHrExitSchema,
  createHrFolderSchema,
  createHrInterviewSchema,
  createHrNotificationSchema,
  createHrOpeningSchema,
  createHrOrganizationSchema,
  createHrRoleSchema,
  createHrSessionSchema,
  generateHrPayrollSchema,
  updateHrStatusSchema,
  upsertHrSalarySchema,
  type AssignHrAssetInput,
  type AssignHrClientInput,
  type AssignHrRoleInput,
  type CreateHrAccountInput,
  type CreateHrAnnouncementInput,
  type CreateHrAssetInput,
  type CreateHrAssetMasterInput,
  type CreateHrCandidateInput,
  type CreateHrClientInput,
  type CreateHrDocumentInput,
  type CreateHrDocumentTypeInput,
  type CreateHrEssRequestInput,
  type CreateHrExitInput,
  type CreateHrFolderInput,
  type CreateHrInterviewInput,
  type CreateHrNotificationInput,
  type CreateHrOpeningInput,
  type CreateHrOrganizationInput,
  type CreateHrRoleInput,
  type CreateHrSessionInput,
  type GenerateHrPayrollInput,
  type UpdateHrStatusInput,
  type UpsertHrSalaryInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { HrService } from './hr.service';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr')
export class HrRecordsController {
  constructor(private readonly hr: HrService) {}

  @Get('reports')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async reports() {
    return ok(await this.hr.reports());
  }

  @Get('organizations')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async organizations() {
    return ok(await this.hr.listOrganizations());
  }

  @Post('organizations')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createOrganization(
    @Body(new ZodValidationPipe(createHrOrganizationSchema)) body: CreateHrOrganizationInput,
  ) {
    return ok(await this.hr.createOrganization(body));
  }

  @Get('exits')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async exits() {
    return ok(await this.hr.listExits());
  }

  @Post('exits')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createExit(@Body(new ZodValidationPipe(createHrExitSchema)) body: CreateHrExitInput) {
    return ok(await this.hr.createExit(body));
  }

  @Put('exits/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateExit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateExit(id, body));
  }

  @Get('openings')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async openings() {
    return ok(await this.hr.listOpenings());
  }

  @Post('openings')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createOpening(
    @Body(new ZodValidationPipe(createHrOpeningSchema)) body: CreateHrOpeningInput,
  ) {
    return ok(await this.hr.createOpening(body));
  }

  @Put('openings/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateOpening(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateOpening(id, body));
  }

  @Get('candidates')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async candidates() {
    return ok(await this.hr.listCandidates());
  }

  @Post('candidates')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createCandidate(
    @Body(new ZodValidationPipe(createHrCandidateSchema)) body: CreateHrCandidateInput,
  ) {
    return ok(await this.hr.createCandidate(body));
  }

  @Put('candidates/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateCandidate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateCandidate(id, body));
  }

  @Get('interviews')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async interviews() {
    return ok(await this.hr.listInterviews());
  }

  @Post('interviews')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createInterview(
    @Body(new ZodValidationPipe(createHrInterviewSchema)) body: CreateHrInterviewInput,
  ) {
    return ok(await this.hr.createInterview(body));
  }

  @Put('interviews/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateInterview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateInterview(id, body));
  }

  @Get('asset-masters')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async assetMasters() {
    return ok(await this.hr.listAssetMasters());
  }

  @Post('asset-masters')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createAssetMaster(
    @Body(new ZodValidationPipe(createHrAssetMasterSchema)) body: CreateHrAssetMasterInput,
  ) {
    return ok(await this.hr.createAssetMaster(body));
  }

  @Get('assets')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async assets() {
    return ok(await this.hr.listAssets());
  }

  @Post('assets')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createAsset(@Body(new ZodValidationPipe(createHrAssetSchema)) body: CreateHrAssetInput) {
    return ok(await this.hr.createAsset(body));
  }

  @Put('assets/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async assignAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(assignHrAssetSchema)) body: AssignHrAssetInput,
  ) {
    return ok(await this.hr.assignAsset(id, body));
  }

  @Get('document-folders')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async folders() {
    return ok(await this.hr.listFolders());
  }

  @Post('document-folders')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createFolder(@Body(new ZodValidationPipe(createHrFolderSchema)) body: CreateHrFolderInput) {
    return ok(await this.hr.createFolder(body));
  }

  @Get('document-types')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async documentTypes() {
    return ok(await this.hr.listDocumentTypes());
  }

  @Post('document-types')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createDocumentType(
    @Body(new ZodValidationPipe(createHrDocumentTypeSchema)) body: CreateHrDocumentTypeInput,
  ) {
    return ok(await this.hr.createDocumentType(body));
  }

  @Get('documents')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async documents() {
    return ok(await this.hr.listDocuments());
  }

  @Post('documents')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createDocument(
    @Body(new ZodValidationPipe(createHrDocumentSchema)) body: CreateHrDocumentInput,
  ) {
    return ok(await this.hr.createDocument(body));
  }

  @Get('accounts')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async accounts() {
    return ok(await this.hr.listAccounts());
  }

  @Post('accounts')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createAccount(
    @Body(new ZodValidationPipe(createHrAccountSchema)) body: CreateHrAccountInput,
  ) {
    return ok(await this.hr.createAccount(body));
  }

  @Put('accounts/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateAccount(id, body));
  }

  @Get('sessions')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async sessions() {
    return ok(await this.hr.listSessions());
  }

  @Post('sessions')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createSession(
    @Body(new ZodValidationPipe(createHrSessionSchema)) body: CreateHrSessionInput,
  ) {
    return ok(await this.hr.createSession(body));
  }

  @Put('sessions/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async endSession(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.hr.endSession(id));
  }

  @Get('ess-requests')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async essRequests() {
    return ok(await this.hr.listEssRequests());
  }

  @Post('ess-requests')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createEss(
    @Body(new ZodValidationPipe(createHrEssRequestSchema)) body: CreateHrEssRequestInput,
  ) {
    return ok(await this.hr.createEssRequest(body));
  }

  @Put('ess-requests/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateEss(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrStatusSchema)) body: UpdateHrStatusInput,
  ) {
    return ok(await this.hr.updateEss(id, body));
  }

  @Get('announcements')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async announcements() {
    return ok(await this.hr.listAnnouncements());
  }

  @Post('announcements')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createAnnouncement(
    @Body(new ZodValidationPipe(createHrAnnouncementSchema)) body: CreateHrAnnouncementInput,
  ) {
    return ok(await this.hr.createAnnouncement(body));
  }

  @Get('notifications')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async notifications() {
    return ok(await this.hr.listNotifications());
  }

  @Post('notifications')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createNotification(
    @Body(new ZodValidationPipe(createHrNotificationSchema)) body: CreateHrNotificationInput,
  ) {
    return ok(await this.hr.createNotification(body));
  }

  @Put('notifications/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async readNotification(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.hr.markNotificationRead(id));
  }

  @Get('roles')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async roles() {
    return ok(await this.hr.listRoles());
  }

  @Post('roles')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createRole(@Body(new ZodValidationPipe(createHrRoleSchema)) body: CreateHrRoleInput) {
    return ok(await this.hr.createRole(body));
  }

  @Post('roles/assign')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async assignRole(@Body(new ZodValidationPipe(assignHrRoleSchema)) body: AssignHrRoleInput) {
    return ok(await this.hr.assignRole(body));
  }

  @Get('clients')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async clients() {
    return ok(await this.hr.listClients());
  }

  @Post('clients')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createClient(@Body(new ZodValidationPipe(createHrClientSchema)) body: CreateHrClientInput) {
    return ok(await this.hr.createClient(body));
  }

  @Get('client-assignments')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async assignments() {
    return ok(await this.hr.listAssignments());
  }

  @Post('client-assignments')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async assignClient(@Body(new ZodValidationPipe(assignHrClientSchema)) body: AssignHrClientInput) {
    return ok(await this.hr.assignClient(body));
  }

  @Get('salaries')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async salaries() {
    return ok(await this.hr.listSalaries());
  }

  @Post('salaries')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async saveSalary(@Body(new ZodValidationPipe(upsertHrSalarySchema)) body: UpsertHrSalaryInput) {
    return ok(await this.hr.saveSalary(body));
  }

  @Get('payroll')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async payroll() {
    return ok(await this.hr.listPayrollRuns());
  }

  @Post('payroll/generate')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async generate(
    @Body(new ZodValidationPipe(generateHrPayrollSchema)) body: GenerateHrPayrollInput,
  ) {
    return ok(await this.hr.generatePayroll(body));
  }

  @Get('payslips')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async payslips(@Query('period') period?: string) {
    return ok(await this.hr.listPayslips(period));
  }

  @Get('payslips/:id')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async payslip(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.hr.getPayslip(id));
  }
}
