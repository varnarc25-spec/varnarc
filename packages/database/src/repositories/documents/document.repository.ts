import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base.repository';

const publicTemplateSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  fullDescription: true,
  templateType: true,
  jurisdiction: true,
  state: true,
  language: true,
  status: true,
  isFree: true,
  requiresReview: true,
  legalDisclaimer: true,
  officialSourceUrl: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  publishedAt: true,
  lastVerifiedAt: true,
  templateVersion: true,
  downloadCount: true,
  generationCount: true,
  formSchema: true,
  templateContent: true,
  editorial: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { name: true, slug: true } },
    },
  },
  seo: true,
} satisfies Prisma.DocumentTemplateSelect;

export class DocumentRepository extends BaseRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  listCategories(activeOnly = false) {
    return this.db.documentCategory.findMany({
      where: { deletedAt: null, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { templates: { where: { deletedAt: null, status: 'PUBLISHED' } } } },
      },
    });
  }

  findCategoryBySlug(slug: string) {
    return this.db.documentCategory.findFirst({
      where: { slug, deletedAt: null },
      include: {
        children: { where: { deletedAt: null, isActive: true }, orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  findCategoryById(id: string) {
    return this.db.documentCategory.findFirst({ where: { id, deletedAt: null } });
  }

  createCategory(data: Prisma.DocumentCategoryCreateInput) {
    return this.db.documentCategory.create({ data });
  }

  updateCategory(id: string, data: Prisma.DocumentCategoryUpdateInput) {
    return this.db.documentCategory.update({ where: { id }, data });
  }

  listTemplates(params: {
    status?: 'DRAFT' | 'REVIEW_REQUIRED' | 'PUBLISHED' | 'ARCHIVED';
    categoryIds?: string[];
    search?: string;
    sort?: 'popular' | 'latest' | 'name';
    limit: number;
  }) {
    return this.db.documentTemplate.findMany({
      where: {
        deletedAt: null,
        ...(params.status ? { status: params.status } : {}),
        ...(params.categoryIds?.length ? { categoryId: { in: params.categoryIds } } : {}),
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { shortDescription: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy:
        params.sort === 'popular'
          ? [{ downloadCount: 'desc' }, { name: 'asc' }]
          : params.sort === 'name'
            ? [{ name: 'asc' }]
            : [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: params.limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        templateType: true,
        isFree: true,
        requiresReview: true,
        status: true,
        publishedAt: true,
        downloadCount: true,
        category: { select: { name: true, slug: true } },
      },
    });
  }

  findTemplateBySlug(slug: string) {
    return this.db.documentTemplate.findFirst({
      where: { slug, deletedAt: null },
      select: {
        ...publicTemplateSelect,
        outgoingRelated: {
          orderBy: { sortOrder: 'asc' },
          include: {
            related: {
              select: {
                name: true,
                slug: true,
                shortDescription: true,
                status: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });
  }

  findTemplateById(id: string) {
    return this.db.documentTemplate.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        seo: true,
        versions: { orderBy: { version: 'desc' }, take: 20 },
        outgoingRelated: true,
      },
    });
  }

  createTemplate(data: Prisma.DocumentTemplateCreateInput) {
    return this.db.documentTemplate.create({ data, include: { seo: true } });
  }

  updateTemplate(id: string, data: Prisma.DocumentTemplateUpdateInput) {
    return this.db.documentTemplate.update({
      where: { id },
      data,
      include: { seo: true, versions: { orderBy: { version: 'desc' }, take: 20 } },
    });
  }

  addVersion(data: Prisma.DocumentVersionCreateInput) {
    return this.db.documentVersion.create({ data });
  }

  findVersion(templateId: string, version: number) {
    return this.db.documentVersion.findUnique({
      where: { templateId_version: { templateId, version } },
    });
  }

  async recordUse(
    templateId: string,
    format: 'PDF' | 'DOCX' | 'HTML',
    userId?: string | null,
    generatedDocumentId?: string | null,
  ) {
    await this.db.$transaction([
      this.db.documentDownload.create({
        data: {
          templateId,
          format,
          userId: userId ?? null,
          generatedDocumentId: generatedDocumentId ?? null,
        },
      }),
      this.db.documentTemplate.update({
        where: { id: templateId },
        data: { downloadCount: { increment: 1 }, generationCount: { increment: 1 } },
      }),
    ]);
  }

  createGenerated(data: Prisma.GeneratedDocumentCreateInput) {
    return this.db.generatedDocument.create({ data });
  }

  listGenerated(userId: string) {
    return this.db.generatedDocument.findMany({
      where: { userId, deletedAt: null, status: { not: 'DELETED' } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        status: true,
        templateVersion: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        template: { select: { name: true, slug: true } },
      },
    });
  }

  findGenerated(id: string, userId: string) {
    return this.db.generatedDocument.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            templateVersion: true,
            legalDisclaimer: true,
          },
        },
      },
    });
  }

  updateGenerated(id: string, data: Prisma.GeneratedDocumentUpdateInput) {
    return this.db.generatedDocument.update({ where: { id }, data });
  }

  async purgeExpired() {
    const now = new Date();
    await this.db.generatedDocument.updateMany({
      where: { expiresAt: { lt: now }, deletedAt: null },
      data: {
        status: 'EXPIRED',
        deletedAt: now,
        encryptedInputData: '',
        encryptedRenderedContent: '',
      },
    });
  }

  recordEvent(data: Prisma.DocumentAnalyticsEventUncheckedCreateInput) {
    return this.db.documentAnalyticsEvent.create({ data });
  }

  async dashboard() {
    const [total, published, draft, review, generations, downloads, popular, reviewQueue] =
      await Promise.all([
        this.db.documentTemplate.count({ where: { deletedAt: null } }),
        this.db.documentTemplate.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        this.db.documentTemplate.count({ where: { deletedAt: null, status: 'DRAFT' } }),
        this.db.documentTemplate.count({ where: { deletedAt: null, status: 'REVIEW_REQUIRED' } }),
        this.db.documentTemplate.aggregate({
          where: { deletedAt: null },
          _sum: { generationCount: true },
        }),
        this.db.documentDownload.count(),
        this.db.documentTemplate.findMany({
          where: { deletedAt: null, status: 'PUBLISHED' },
          orderBy: { downloadCount: 'desc' },
          take: 5,
          select: { id: true, name: true, slug: true, downloadCount: true },
        }),
        this.db.documentTemplate.findMany({
          where: { deletedAt: null, status: 'REVIEW_REQUIRED' },
          orderBy: { updatedAt: 'asc' },
          take: 8,
          select: { id: true, name: true, slug: true, requiresReview: true, updatedAt: true },
        }),
      ]);
    return {
      total,
      published,
      draft,
      reviewRequired: review,
      generations: generations._sum.generationCount ?? 0,
      downloads,
      popular,
      reviewQueue,
    };
  }

  async sitemapEntries() {
    const [templates, categories] = await Promise.all([
      this.db.documentTemplate.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        take: 5000,
      }),
      this.db.documentCategory.findMany({
        where: { deletedAt: null, isActive: true },
        select: { slug: true, updatedAt: true, parentId: true },
        take: 500,
      }),
    ]);
    return { templates, categories };
  }
}
