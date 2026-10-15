import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Repositories } from '@varnarc/database';
import type {
  CreateDocumentCategoryInput,
  CreateDocumentTemplateInput,
  DocumentBlock,
  DocumentEditorial,
  DocumentEventInput,
  DocumentFaq,
  DocumentField,
  DocumentListQuery,
  DocumentSearchQuery,
  RenderedBlock,
  UpdateDocumentCategoryInput,
  UpdateDocumentTemplateInput,
} from '@varnarc/validation';
import {
  blankDocumentInputs,
  documentFormSchema,
  documentTemplateContentSchema,
  renderDocument,
  renderedDocumentHtml,
  validateDocumentInputs,
  validateDocumentTemplate,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';
import {
  decryptDocumentPayload,
  documentEncryptionKey,
  encryptDocumentPayload,
  signDocumentDownload,
  verifyDocumentDownload,
} from './document-crypto';
import { renderDocumentDocx } from './document-docx';
import { renderDocumentPdf } from './document-pdf';

type FileFormat = 'PDF' | 'DOCX' | 'HTML';

function bad(code: string, message: string, details?: unknown) {
  return new BadRequestException({ success: false, error: { code, message, details } });
}

function missing(message: string) {
  return new NotFoundException({ success: false, error: { code: 'NOT_FOUND', message } });
}

export function sanitizeAnalyticsQuery(value: string | undefined): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .replace(/\+?\d[\d\s()-]{8,}\d/g, '')
    .replace(/\d{6,}/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned.length >= 2 ? cleaned.toLowerCase() : null;
}

function readFields(value: unknown): DocumentField[] {
  const parsed = documentFormSchema.safeParse(value);
  return parsed.success ? parsed.data.fields : [];
}

function readBlocks(value: unknown): DocumentBlock[] {
  const parsed = documentTemplateContentSchema.safeParse(value);
  return parsed.success ? parsed.data.blocks : [];
}

function readFaqs(value: unknown): DocumentFaq[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is DocumentFaq => {
    if (!item || typeof item !== 'object') return false;
    const row = item as { question?: unknown; answer?: unknown };
    return typeof row.question === 'string' && typeof row.answer === 'string';
  });
}

@Injectable()
export class DocumentService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  async listCategories(activeOnly = true) {
    const rows = await this.repos.documents.listCategories(activeOnly);
    const parents = rows.filter((row) => !row.parentId);
    return parents.map((parent) => ({
      ...parent,
      children: rows.filter((row) => row.parentId === parent.id),
    }));
  }

  async category(slug: string) {
    const row = await this.repos.documents.findCategoryBySlug(slug);
    if (!row || !row.isActive) throw missing('Category not found.');
    const all = await this.repos.documents.listCategories(true);
    const templates = await this.repos.documents.listTemplates({
      status: 'PUBLISHED',
      categoryIds: this.descendantIds(row.id, all),
      sort: 'name',
      limit: 48,
    });
    return { category: row, templates };
  }

  listPublished(query: DocumentListQuery) {
    return this.repos.documents.listTemplates({
      status: 'PUBLISHED',
      search: query.search,
      sort: query.sort ?? 'latest',
      limit: query.limit ?? 24,
    });
  }

  async search(query: DocumentSearchQuery) {
    const q = sanitizeAnalyticsQuery(query.q);
    if (q) await this.repos.documents.recordEvent({ eventType: 'search', queryText: q });
    const items = await this.repos.documents.listTemplates({
      status: 'PUBLISHED',
      search: q ?? undefined,
      sort: 'name',
      limit: query.limit ?? 24,
    });
    return { query: q, items };
  }

  popular() {
    return this.repos.documents.listTemplates({ status: 'PUBLISHED', sort: 'popular', limit: 12 });
  }

  latest() {
    return this.repos.documents.listTemplates({ status: 'PUBLISHED', sort: 'latest', limit: 12 });
  }

  async getPublished(slug: string) {
    const row = await this.publicTemplate(slug);
    if (row.status !== 'PUBLISHED') throw missing('Document not found.');
    return this.toPublic(row);
  }

  async preview(slug: string, inputs: Record<string, unknown>, blank = false) {
    const row = await this.publicTemplate(slug);
    if (row.status !== 'PUBLISHED') throw missing('Document not found.');
    return this.renderStored(row, inputs, blank);
  }

  async exportPublic(
    slug: string,
    inputs: Record<string, unknown>,
    format: FileFormat,
    blank = false,
  ) {
    const row = await this.publicTemplate(slug);
    if (row.status !== 'PUBLISHED') throw missing('Document not found.');
    if (!row.isFree)
      throw bad('PREMIUM_REQUIRED', 'This template is not available in the free generator.');
    const rendered = this.renderStored(row, inputs, blank);
    const file = await this.toFile(rendered.document, format);
    await this.repos.documents.recordUse(row.id, format);
    return { filename: `${row.slug}.${format.toLowerCase()}`, ...file };
  }

  async recordEvent(input: DocumentEventInput) {
    const template = input.templateSlug
      ? await this.repos.documents.findTemplateBySlug(input.templateSlug)
      : null;
    await this.repos.documents.recordEvent({
      eventType: input.eventType,
      templateId: template?.status === 'PUBLISHED' ? template.id : undefined,
      categorySlug: input.categorySlug,
      queryText: input.eventType === 'search' ? sanitizeAnalyticsQuery(input.query) : null,
      format: input.format,
    });
    return { recorded: true };
  }

  async save(
    userId: string,
    templateSlug: string,
    inputs: Record<string, unknown>,
    title?: string,
  ) {
    await this.repos.documents.purgeExpired();
    const key = this.requireKey();
    const row = await this.publicTemplate(templateSlug);
    if (row.status !== 'PUBLISHED') throw missing('Document not found.');
    const rendered = this.renderStored(row, inputs, false);
    const created = await this.repos.documents.createGenerated({
      template: { connect: { id: row.id } },
      templateVersion: row.templateVersion,
      user: { connect: { id: userId } },
      title: title?.trim() || row.name,
      encryptedInputData: encryptDocumentPayload(rendered.inputs, key),
      encryptedRenderedContent: encryptDocumentPayload(
        { title: rendered.document.title, blocks: rendered.document.blocks },
        key,
      ),
      status: 'COMPLETED',
    });
    return { id: created.id, title: created.title };
  }

  async listSaved(userId: string) {
    await this.repos.documents.purgeExpired();
    return this.repos.documents.listGenerated(userId);
  }

  async getSaved(userId: string, id: string) {
    const row = await this.owned(userId, id);
    const key = this.requireKey();
    return {
      id: row.id,
      title: row.title,
      templateVersion: row.templateVersion,
      template: row.template,
      inputs: decryptDocumentPayload<Record<string, unknown>>(row.encryptedInputData, key),
      document: decryptDocumentPayload<{ title: string; blocks: RenderedBlock[] }>(
        row.encryptedRenderedContent,
        key,
      ),
      updatedAt: row.updatedAt,
    };
  }

  async updateSaved(userId: string, id: string, inputs: Record<string, unknown>, title?: string) {
    const row = await this.owned(userId, id);
    const template = await this.repos.documents.findTemplateById(row.templateId);
    if (!template) throw missing('Template not found.');
    const rendered = this.renderStored(template, inputs, false);
    const key = this.requireKey();
    await this.repos.documents.updateGenerated(row.id, {
      title: title?.trim() || row.title,
      templateVersion: template.templateVersion,
      encryptedInputData: encryptDocumentPayload(rendered.inputs, key),
      encryptedRenderedContent: encryptDocumentPayload(
        { title: rendered.document.title, blocks: rendered.document.blocks },
        key,
      ),
    });
    return { id: row.id };
  }

  async deleteSaved(userId: string, id: string) {
    const row = await this.owned(userId, id);
    await this.repos.documents.updateGenerated(row.id, {
      status: 'DELETED',
      deletedAt: new Date(),
      encryptedInputData: '',
      encryptedRenderedContent: '',
    });
    return { deleted: true };
  }

  async exportSaved(userId: string, id: string, format: FileFormat) {
    const saved = await this.getSaved(userId, id);
    const template = await this.repos.documents.findTemplateBySlug(saved.template.slug);
    if (!template) throw missing('Template not found.');
    const document = {
      title: saved.document.title,
      blocks: saved.document.blocks,
      html: renderedDocumentHtml({ title: saved.document.title, blocks: saved.document.blocks }),
    };
    const file = await this.toFile(document, format);
    await this.repos.documents.recordUse(template.id, format, userId, id);
    return { filename: `${template.slug}.${format.toLowerCase()}`, ...file };
  }

  downloadLink(userId: string, id: string, format: FileFormat) {
    const exp = Date.now() + 10 * 60 * 1000;
    return {
      token: signDocumentDownload({ id, userId, format, exp }),
      expiresAt: new Date(exp).toISOString(),
    };
  }

  async exportSigned(token: string) {
    const claims = verifyDocumentDownload(token);
    if (!claims) throw bad('LINK_EXPIRED', 'This download link is no longer valid.');
    return this.exportSaved(claims.userId, claims.id, claims.format);
  }

  dashboard() {
    return this.repos.documents.dashboard();
  }

  adminCategories() {
    return this.repos.documents.listCategories(false);
  }

  async createCategory(input: CreateDocumentCategoryInput, actorId: string) {
    await this.assertParent(null, input.parentId ?? null);
    const created = await this.repos.documents.createCategory({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
    });
    await this.audit(actorId, 'document.category.create', created.id, { slug: created.slug });
    return created;
  }

  async updateCategory(id: string, input: UpdateDocumentCategoryInput, actorId: string) {
    const current = await this.repos.documents.findCategoryById(id);
    if (!current) throw missing('Category not found.');
    if (input.parentId !== undefined) await this.assertParent(id, input.parentId);
    const updated = await this.repos.documents.updateCategory(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.parentId !== undefined
        ? input.parentId
          ? { parent: { connect: { id: input.parentId } } }
          : { parent: { disconnect: true } }
        : {}),
    });
    await this.audit(actorId, 'document.category.update', id, { slug: updated.slug });
    return updated;
  }

  async reorderCategories(ids: string[], actorId: string) {
    await Promise.all(
      ids.map((categoryId, index) =>
        this.repos.documents.updateCategory(categoryId, { displayOrder: index }),
      ),
    );
    await this.audit(actorId, 'document.category.reorder', ids[0] ?? 'categories', {
      count: ids.length,
    });
    return { reordered: ids.length };
  }

  async deleteCategory(id: string, actorId: string) {
    const all = await this.repos.documents.listCategories(false);
    if (all.some((row) => row.parentId === id)) {
      throw bad('CATEGORY_IN_USE', 'Move or remove subcategories first.');
    }
    const templates = await this.repos.documents.listTemplates({ categoryIds: [id], limit: 1 });
    if (templates.length)
      throw bad('CATEGORY_IN_USE', 'Move templates out of this category first.');
    await this.repos.documents.updateCategory(id, { deletedAt: new Date(), isActive: false });
    await this.audit(actorId, 'document.category.delete', id, {});
    return { deleted: true };
  }

  adminTemplates(query: DocumentListQuery) {
    return this.repos.documents.listTemplates({
      status: query.status,
      search: query.search,
      sort: 'latest',
      limit: query.limit ?? 50,
    });
  }

  async adminTemplate(id: string) {
    const row = await this.repos.documents.findTemplateById(id);
    if (!row) throw missing('Template not found.');
    return row;
  }

  async createTemplate(input: CreateDocumentTemplateInput, actorId: string) {
    this.assertTemplate(input);
    const status = input.status === 'PUBLISHED' ? 'DRAFT' : (input.status ?? 'DRAFT');
    const created = await this.repos.documents.createTemplate({
      ...this.templateData(input, status),
      category: { connect: { id: input.categoryId } },
      seo: {
        create: {
          focusKeyword: input.focusKeyword,
          secondaryKeywords: input.secondaryKeywords,
          faqContent: input.faqs,
        },
      },
      versions: {
        create: {
          version: 1,
          schemaSnapshot: { fields: input.fields },
          contentSnapshot: { blocks: input.blocks, editorial: input.editorial, faqs: input.faqs },
          changeNotes: input.changeNotes ?? 'Created',
          createdBy: actorId,
        },
      },
    });
    await this.audit(actorId, 'document.template.create', created.id, {
      slug: created.slug,
      status,
    });
    return created;
  }

  async updateTemplate(id: string, input: UpdateDocumentTemplateInput, actorId: string) {
    const current = await this.repos.documents.findTemplateById(id);
    if (!current) throw missing('Template not found.');
    const next = this.mergeTemplate(current, input);
    this.assertTemplate(next);
    const status = input.status === 'PUBLISHED' ? current.status : (input.status ?? current.status);
    const version = current.templateVersion + 1;
    const updated = await this.repos.documents.updateTemplate(id, {
      ...this.templateData(next, status),
      templateVersion: version,
      ...(input.categoryId ? { category: { connect: { id: input.categoryId } } } : {}),
      ...(input.lastVerifiedAt
        ? { lastVerifiedAt: new Date(input.lastVerifiedAt), reviewer: { connect: { id: actorId } } }
        : {}),
      seo: {
        upsert: {
          create: {
            focusKeyword: next.focusKeyword,
            secondaryKeywords: next.secondaryKeywords,
            faqContent: next.faqs,
          },
          update: {
            focusKeyword: next.focusKeyword,
            secondaryKeywords: next.secondaryKeywords,
            faqContent: next.faqs,
          },
        },
      },
      versions: {
        create: {
          version,
          schemaSnapshot: { fields: next.fields },
          contentSnapshot: { blocks: next.blocks, editorial: next.editorial, faqs: next.faqs },
          changeNotes: input.changeNotes ?? 'Updated',
          createdBy: actorId,
        },
      },
    });
    await this.audit(actorId, 'document.template.update', id, { slug: updated.slug, status });
    return updated;
  }

  async publish(id: string, actorId: string) {
    const current = await this.repos.documents.findTemplateById(id);
    if (!current) throw missing('Template not found.');
    const issues = validateDocumentTemplate(this.mergeTemplate(current, {}));
    if (issues.length) throw bad('TEMPLATE_INVALID', 'Fix the template before publishing.', issues);
    const updated = await this.repos.documents.updateTemplate(id, {
      status: 'PUBLISHED',
      publishedAt: current.publishedAt ?? new Date(),
    });
    await this.audit(actorId, 'document.template.publish', id, { slug: updated.slug });
    return updated;
  }

  async archive(id: string, actorId: string) {
    const updated = await this.repos.documents.updateTemplate(id, { status: 'ARCHIVED' });
    await this.audit(actorId, 'document.template.archive', id, { slug: updated.slug });
    return updated;
  }

  async duplicate(id: string, actorId: string) {
    const current = await this.repos.documents.findTemplateById(id);
    if (!current) throw missing('Template not found.');
    const merged = this.mergeTemplate(current, {});
    const slug = await this.copySlug(current.slug);
    const created = await this.repos.documents.createTemplate({
      ...this.templateData({ ...merged, slug, name: `${current.name} copy` }, 'DRAFT'),
      category: { connect: { id: current.categoryId } },
      seo: {
        create: {
          focusKeyword: merged.focusKeyword,
          secondaryKeywords: merged.secondaryKeywords,
          faqContent: merged.faqs,
        },
      },
      versions: {
        create: {
          version: 1,
          schemaSnapshot: { fields: merged.fields },
          contentSnapshot: {
            blocks: merged.blocks,
            editorial: merged.editorial,
            faqs: merged.faqs,
          },
          changeNotes: `Copied from ${current.slug}`,
          createdBy: actorId,
        },
      },
    });
    await this.audit(actorId, 'document.template.duplicate', created.id, { from: current.slug });
    return created;
  }

  async versions(id: string) {
    const row = await this.adminTemplate(id);
    return row.versions;
  }

  async rollback(id: string, version: number, actorId: string) {
    const current = await this.repos.documents.findTemplateById(id);
    if (!current) throw missing('Template not found.');
    const snapshot = await this.repos.documents.findVersion(id, version);
    if (!snapshot) throw missing('Version not found.');
    const content = snapshot.contentSnapshot as {
      blocks?: DocumentBlock[];
      editorial?: DocumentEditorial;
      faqs?: DocumentFaq[];
    };
    const fields = readFields(snapshot.schemaSnapshot);
    const blocks = content.blocks ?? [];
    if (!content.editorial) throw bad('VERSION_INVALID', 'That version has no editorial snapshot.');
    const faqs = content.faqs ?? [];
    const issues = validateDocumentTemplate({ fields, blocks, editorial: content.editorial, faqs });
    if (issues.length)
      throw bad('VERSION_INVALID', 'That version does not pass current checks.', issues);
    const nextVersion = current.templateVersion + 1;
    const updated = await this.repos.documents.updateTemplate(id, {
      formSchema: { fields },
      templateContent: { blocks },
      editorial: content.editorial,
      templateVersion: nextVersion,
      status: 'DRAFT',
      seo: { update: { faqContent: faqs } },
      versions: {
        create: {
          version: nextVersion,
          schemaSnapshot: { fields },
          contentSnapshot: { blocks, editorial: content.editorial, faqs },
          changeNotes: `Rolled back to version ${version}`,
          createdBy: actorId,
        },
      },
    });
    await this.audit(actorId, 'document.template.rollback', id, { to: version });
    return updated;
  }

  async adminPreview(id: string, inputs: Record<string, unknown>, blank = false) {
    const row = await this.repos.documents.findTemplateById(id);
    if (!row) throw missing('Template not found.');
    return this.renderStored(row, inputs, blank);
  }

  private async publicTemplate(slug: string) {
    const row = await this.repos.documents.findTemplateBySlug(slug);
    if (!row) throw missing('Document not found.');
    return row;
  }

  private toPublic(
    row: NonNullable<Awaited<ReturnType<Repositories['documents']['findTemplateBySlug']>>>,
  ) {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      fullDescription: row.fullDescription,
      templateType: row.templateType,
      jurisdiction: row.jurisdiction,
      state: row.state,
      language: row.language,
      status: row.status,
      isFree: row.isFree,
      requiresReview: row.requiresReview,
      legalDisclaimer: row.legalDisclaimer,
      officialSourceUrl: row.officialSourceUrl,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      canonicalUrl: row.canonicalUrl,
      publishedAt: row.publishedAt,
      lastVerifiedAt: row.lastVerifiedAt,
      templateVersion: row.templateVersion,
      category: row.category,
      editorial: row.editorial,
      fields: readFields(row.formSchema),
      blocks: readBlocks(row.templateContent),
      faqs: readFaqs(row.seo?.faqContent),
      focusKeyword: row.seo?.focusKeyword ?? null,
      secondaryKeywords: row.seo?.secondaryKeywords ?? [],
      related: row.outgoingRelated
        .map((link) => link.related)
        .filter((related) => related.status === 'PUBLISHED' && !related.deletedAt)
        .map((related) => ({
          name: related.name,
          slug: related.slug,
          shortDescription: related.shortDescription,
        })),
    };
  }

  private renderStored(
    row: {
      name: string;
      formSchema: unknown;
      templateContent: unknown;
      legalDisclaimer: string | null;
    },
    inputs: Record<string, unknown>,
    blank: boolean,
  ) {
    const fields = readFields(row.formSchema);
    const blocks = readBlocks(row.templateContent);
    const values = blank ? blankDocumentInputs(fields) : inputs;
    if (!blank) {
      const errors = validateDocumentInputs(fields, values);
      if (errors.length) throw bad('VALIDATION_ERROR', 'Check the highlighted fields.', errors);
    }
    return {
      document: renderDocument({
        title: row.name,
        fields,
        blocks,
        values,
        disclaimer: row.legalDisclaimer,
      }),
      inputs: values,
    };
  }

  private async toFile(
    document: { title: string; blocks: RenderedBlock[]; html: string },
    format: FileFormat,
  ) {
    if (format === 'HTML') {
      return { body: Buffer.from(document.html, 'utf8'), type: 'text/html; charset=utf-8' };
    }
    if (format === 'DOCX') {
      return {
        body: await renderDocumentDocx(document),
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }
    return { body: await renderDocumentPdf(document), type: 'application/pdf' };
  }

  private requireKey() {
    const key = documentEncryptionKey();
    if (!key) {
      throw new ServiceUnavailableException({
        success: false,
        error: {
          code: 'ENCRYPTION_UNAVAILABLE',
          message: 'Saving documents is unavailable until DOCUMENT_ENCRYPTION_KEY is configured.',
        },
      });
    }
    return key;
  }

  private async owned(userId: string, id: string) {
    const row = await this.repos.documents.findGenerated(id, userId);
    if (!row) throw missing('Saved document not found.');
    return row;
  }

  private descendantIds(rootId: string, rows: Array<{ id: string; parentId: string | null }>) {
    const ids = [rootId];
    const walk = (parentId: string) => {
      for (const row of rows) {
        if (row.parentId === parentId) {
          ids.push(row.id);
          walk(row.id);
        }
      }
    };
    walk(rootId);
    return ids;
  }

  private assertTemplate(input: {
    fields: DocumentField[];
    blocks: DocumentBlock[];
    editorial: DocumentEditorial;
    faqs: DocumentFaq[];
  }) {
    const issues = validateDocumentTemplate(input);
    if (issues.length) throw bad('TEMPLATE_INVALID', 'The template is not valid.', issues);
  }

  private templateData(
    input: CreateDocumentTemplateInput,
    status: 'DRAFT' | 'REVIEW_REQUIRED' | 'PUBLISHED' | 'ARCHIVED',
  ) {
    return {
      name: input.name,
      slug: input.slug,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      templateType: input.templateType,
      jurisdiction: input.jurisdiction || 'IN',
      state: input.state || null,
      language: input.language || 'en',
      formSchema: { fields: input.fields },
      templateContent: { blocks: input.blocks },
      editorial: input.editorial,
      status,
      isFree: input.isFree ?? true,
      requiresReview: input.requiresReview ?? false,
      legalDisclaimer: input.legalDisclaimer || null,
      officialSourceUrl: input.officialSourceUrl || null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      canonicalUrl: input.canonicalUrl || `/documents/${input.slug}`,
      nextReviewAt: input.nextReviewAt ? new Date(input.nextReviewAt) : null,
    };
  }

  private mergeTemplate(
    current: {
      categoryId: string;
      name: string;
      slug: string;
      shortDescription: string;
      fullDescription: string;
      templateType: CreateDocumentTemplateInput['templateType'];
      jurisdiction: string;
      state: string | null;
      language: string;
      formSchema: unknown;
      templateContent: unknown;
      editorial: unknown;
      isFree: boolean;
      requiresReview: boolean;
      legalDisclaimer: string | null;
      officialSourceUrl: string | null;
      seoTitle: string;
      seoDescription: string;
      canonicalUrl: string | null;
      seo: { focusKeyword: string; secondaryKeywords: string[]; faqContent: unknown } | null;
    },
    input: UpdateDocumentTemplateInput,
  ): CreateDocumentTemplateInput {
    return {
      categoryId: input.categoryId ?? current.categoryId,
      name: input.name ?? current.name,
      slug: input.slug ?? current.slug,
      shortDescription: input.shortDescription ?? current.shortDescription,
      fullDescription: input.fullDescription ?? current.fullDescription,
      templateType: input.templateType ?? current.templateType,
      jurisdiction: input.jurisdiction ?? current.jurisdiction,
      state: input.state === undefined ? current.state : input.state,
      language: input.language ?? current.language,
      fields: input.fields ?? readFields(current.formSchema),
      blocks: input.blocks ?? readBlocks(current.templateContent),
      editorial: (input.editorial ?? current.editorial) as DocumentEditorial,
      faqs: input.faqs ?? readFaqs(current.seo?.faqContent),
      focusKeyword: input.focusKeyword ?? current.seo?.focusKeyword ?? current.name,
      secondaryKeywords: input.secondaryKeywords ?? current.seo?.secondaryKeywords ?? [],
      isFree: input.isFree ?? current.isFree,
      requiresReview: input.requiresReview ?? current.requiresReview,
      legalDisclaimer:
        input.legalDisclaimer === undefined ? current.legalDisclaimer : input.legalDisclaimer,
      officialSourceUrl:
        input.officialSourceUrl === undefined ? current.officialSourceUrl : input.officialSourceUrl,
      seoTitle: input.seoTitle ?? current.seoTitle,
      seoDescription: input.seoDescription ?? current.seoDescription,
      canonicalUrl: input.canonicalUrl === undefined ? current.canonicalUrl : input.canonicalUrl,
    };
  }

  private async copySlug(slug: string) {
    let next = `${slug}-copy`;
    let n = 2;
    while (await this.repos.documents.findTemplateBySlug(next)) {
      next = `${slug}-copy-${n}`;
      n += 1;
    }
    return next;
  }

  private async assertParent(id: string | null, parentId: string | null) {
    if (!parentId) return;
    if (id && id === parentId) throw bad('INVALID_PARENT', 'A category cannot be its own parent.');
    let current: string | null = parentId;
    const seen = new Set<string>();
    while (current) {
      if (id && current === id)
        throw bad('INVALID_PARENT', 'A category cannot be moved under itself.');
      if (seen.has(current)) break;
      seen.add(current);
      const row = await this.repos.documents.findCategoryById(current);
      current = row?.parentId ?? null;
    }
  }

  private audit(
    actorId: string,
    action: string,
    entityId: string,
    metadata: Record<string, unknown>,
  ) {
    return this.repos.auditLogs.create({
      userId: actorId,
      action,
      entity: 'document',
      entityId,
      metadata: metadata as never,
    });
  }
}
