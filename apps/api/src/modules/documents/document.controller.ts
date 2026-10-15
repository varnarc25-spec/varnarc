import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PERMISSIONS } from '@varnarc/auth';
import { SECURITY_RATE_LIMITS } from '@varnarc/config';
import type { CurrentUser } from '@varnarc/types';
import {
  createDocumentCategorySchema,
  createDocumentTemplateSchema,
  documentEventSchema,
  documentExportBodySchema,
  documentInputsBodySchema,
  documentListQuerySchema,
  documentSearchQuerySchema,
  reorderDocumentCategoriesSchema,
  rollbackDocumentTemplateSchema,
  saveGeneratedDocumentSchema,
  updateDocumentCategorySchema,
  updateDocumentTemplateSchema,
  updateGeneratedDocumentSchema,
  type CreateDocumentCategoryInput,
  type CreateDocumentTemplateInput,
  type DocumentEventInput,
  type DocumentExportBody,
  type DocumentInputsBody,
  type DocumentListQuery,
  type DocumentSearchQuery,
  type SaveGeneratedDocumentInput,
  type UpdateDocumentCategoryInput,
  type UpdateDocumentTemplateInput,
  type UpdateGeneratedDocumentInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUserDecorator } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { DocumentService } from './document.service';

const writeLimit = { default: { limit: SECURITY_RATE_LIMITS.documents, ttl: 60_000 } };

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Public()
  @Get('categories')
  async categories() {
    return ok(await this.service.listCategories(true));
  }

  @Public()
  @Get('categories/:slug')
  async category(@Param('slug') slug: string) {
    return ok(await this.service.category(slug));
  }

  @Public()
  @Get('popular')
  async popular() {
    return ok(await this.service.popular());
  }

  @Public()
  @Get('latest')
  async latest() {
    return ok(await this.service.latest());
  }

  @Public()
  @Get('search')
  async search(
    @Query(new ZodValidationPipe(documentSearchQuerySchema)) query: DocumentSearchQuery,
  ) {
    return ok(await this.service.search(query));
  }

  @Public()
  @Get('templates')
  async templates(@Query(new ZodValidationPipe(documentListQuerySchema)) query: DocumentListQuery) {
    return ok(await this.service.listPublished(query));
  }

  @Public()
  @Get('templates/slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return ok(await this.service.getPublished(slug));
  }

  @Public()
  @Post('templates/:slug/preview')
  @Throttle(writeLimit)
  async preview(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(documentInputsBodySchema)) body: DocumentInputsBody,
  ) {
    return ok(await this.service.preview(slug, body.inputs, body.blank));
  }

  @Public()
  @Post('templates/:slug/export')
  @Throttle(writeLimit)
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @Header('Cache-Control', 'no-store')
  async exportPublic(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(documentExportBodySchema)) body: DocumentExportBody,
  ) {
    const file = await this.service.exportPublic(slug, body.inputs, body.format, body.blank);
    return new StreamableFile(file.body, {
      type: file.type,
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Public()
  @Post('events')
  @Throttle(writeLimit)
  async events(@Body(new ZodValidationPipe(documentEventSchema)) body: DocumentEventInput) {
    return ok(await this.service.recordEvent(body));
  }

  @Public()
  @Get('exports/:token')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @Header('Cache-Control', 'no-store')
  async exportSigned(@Param('token') token: string) {
    const file = await this.service.exportSigned(token);
    return new StreamableFile(file.body, {
      type: file.type,
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Get('saved')
  async saved(@CurrentUserDecorator() user: CurrentUser) {
    return ok(await this.service.listSaved(user.id));
  }

  @Post('saved')
  @Throttle(writeLimit)
  async createSaved(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(saveGeneratedDocumentSchema)) body: SaveGeneratedDocumentInput,
  ) {
    return ok(await this.service.save(user.id, body.templateSlug, body.inputs, body.title));
  }

  @Get('saved/:id')
  async savedOne(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return ok(await this.service.getSaved(user.id, id));
  }

  @Put('saved/:id')
  async updateSaved(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateGeneratedDocumentSchema)) body: UpdateGeneratedDocumentInput,
  ) {
    return ok(await this.service.updateSaved(user.id, id, body.inputs, body.title));
  }

  @Delete('saved/:id')
  async deleteSaved(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return ok(await this.service.deleteSaved(user.id, id));
  }

  @Post('saved/:id/export')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @Header('Cache-Control', 'no-store')
  async exportSaved(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(documentExportBodySchema)) body: DocumentExportBody,
  ) {
    const file = await this.service.exportSaved(user.id, id, body.format);
    return new StreamableFile(file.body, {
      type: file.type,
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Post('saved/:id/link')
  async link(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(documentExportBodySchema)) body: DocumentExportBody,
  ) {
    return ok(this.service.downloadLink(user.id, id, body.format));
  }

  @Get('admin/dashboard')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async dashboard() {
    return ok(await this.service.dashboard());
  }

  @Get('admin/categories')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async adminCategories() {
    return ok(await this.service.adminCategories());
  }

  @Post('admin/categories')
  @RequirePermissions(PERMISSIONS.DOCUMENT_CREATE)
  async createCategory(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(createDocumentCategorySchema)) body: CreateDocumentCategoryInput,
  ) {
    return ok(await this.service.createCategory(body, user.id));
  }

  @Put('admin/categories/reorder')
  @RequirePermissions(PERMISSIONS.DOCUMENT_EDIT)
  async reorder(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(reorderDocumentCategoriesSchema)) body: { ids: string[] },
  ) {
    return ok(await this.service.reorderCategories(body.ids, user.id));
  }

  @Put('admin/categories/:id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_EDIT)
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(updateDocumentCategorySchema)) body: UpdateDocumentCategoryInput,
  ) {
    return ok(await this.service.updateCategory(id, body, user.id));
  }

  @Delete('admin/categories/:id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_DELETE)
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return ok(await this.service.deleteCategory(id, user.id));
  }

  @Get('admin/templates')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async adminTemplates(
    @Query(new ZodValidationPipe(documentListQuerySchema)) query: DocumentListQuery,
  ) {
    return ok(await this.service.adminTemplates(query));
  }

  @Post('admin/templates')
  @RequirePermissions(PERMISSIONS.DOCUMENT_CREATE)
  async createTemplate(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(createDocumentTemplateSchema)) body: CreateDocumentTemplateInput,
  ) {
    return ok(await this.service.createTemplate(body, user.id));
  }

  @Get('admin/templates/:id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async adminTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.adminTemplate(id));
  }

  @Put('admin/templates/:id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_EDIT)
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(updateDocumentTemplateSchema)) body: UpdateDocumentTemplateInput,
  ) {
    return ok(await this.service.updateTemplate(id, body, user.id));
  }

  @Delete('admin/templates/:id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_DELETE)
  async deleteTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return ok(await this.service.archive(id, user.id));
  }

  @Post('admin/templates/:id/duplicate')
  @RequirePermissions(PERMISSIONS.DOCUMENT_CREATE)
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return ok(await this.service.duplicate(id, user.id));
  }

  @Post('admin/templates/:id/publish')
  @RequirePermissions(PERMISSIONS.DOCUMENT_PUBLISH)
  async publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUserDecorator() user: CurrentUser) {
    return ok(await this.service.publish(id, user.id));
  }

  @Post('admin/templates/:id/archive')
  @RequirePermissions(PERMISSIONS.DOCUMENT_PUBLISH)
  async archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUserDecorator() user: CurrentUser) {
    return ok(await this.service.archive(id, user.id));
  }

  @Get('admin/templates/:id/versions')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async versions(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.versions(id));
  }

  @Post('admin/templates/:id/rollback')
  @RequirePermissions(PERMISSIONS.DOCUMENT_EDIT)
  async rollback(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(rollbackDocumentTemplateSchema)) body: { version: number },
  ) {
    return ok(await this.service.rollback(id, body.version, user.id));
  }

  @Post('admin/templates/:id/preview')
  @RequirePermissions(PERMISSIONS.DOCUMENT_VIEW)
  async adminPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(documentInputsBodySchema)) body: DocumentInputsBody,
  ) {
    return ok(await this.service.adminPreview(id, body.inputs, body.blank));
  }
}
