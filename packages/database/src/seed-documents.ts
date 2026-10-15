import { type Prisma, type PrismaClient } from '@prisma/client';
import { DOCUMENT_SEED_CATEGORIES, DOCUMENT_SEED_TEMPLATES } from './documents/catalog';

/**
 * Inserts missing document categories and templates.
 * Rows that already exist (by seed key or slug) are left unchanged.
 */
export async function seedDocuments(prisma: PrismaClient) {
  const categoryIds = new Map<string, string>();

  for (const category of DOCUMENT_SEED_CATEGORIES) {
    const existing = await prisma.documentCategory.findFirst({
      where: { OR: [{ seedKey: category.seedKey }, { slug: category.slug }] },
    });
    if (existing) {
      categoryIds.set(category.slug, existing.id);
      continue;
    }
    const parentId = category.parentSlug ? categoryIds.get(category.parentSlug) : undefined;
    if (category.parentSlug && !parentId) {
      throw new Error(
        `Parent category ${category.parentSlug} was not seeded before ${category.slug}`,
      );
    }
    const created = await prisma.documentCategory.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        displayOrder: category.displayOrder,
        isActive: true,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        seedKey: category.seedKey,
        parentId: parentId ?? null,
      },
    });
    categoryIds.set(category.slug, created.id);
  }

  for (const template of DOCUMENT_SEED_TEMPLATES) {
    const existing = await prisma.documentTemplate.findFirst({
      where: { OR: [{ seedKey: template.seedKey }, { slug: template.slug }] },
    });
    if (existing) continue;
    const categoryId = categoryIds.get(template.categorySlug);
    if (!categoryId) throw new Error(`Missing category for ${template.slug}`);
    const created = await prisma.documentTemplate.create({
      data: {
        categoryId,
        name: template.name,
        slug: template.slug,
        shortDescription: template.shortDescription,
        fullDescription: template.fullDescription,
        templateType: template.templateType,
        jurisdiction: 'IN',
        language: 'en',
        formSchema: { fields: template.fields } as Prisma.InputJsonValue,
        templateContent: { blocks: template.blocks } as Prisma.InputJsonValue,
        editorial: template.editorial as Prisma.InputJsonValue,
        templateVersion: 1,
        status: template.status,
        isFree: true,
        requiresReview: template.requiresReview,
        legalDisclaimer: template.legalDisclaimer,
        officialSourceUrl: template.officialSourceUrl,
        seoTitle: template.seoTitle,
        seoDescription: template.seoDescription,
        canonicalUrl: `/documents/${template.slug}`,
        publishedAt: template.status === 'PUBLISHED' ? new Date('2026-10-16T00:00:00.000Z') : null,
        seedKey: template.seedKey,
        seo: {
          create: {
            focusKeyword: template.focusKeyword,
            secondaryKeywords: template.secondaryKeywords,
            faqContent: template.faqs as Prisma.InputJsonValue,
          },
        },
        versions: {
          create: {
            version: 1,
            schemaSnapshot: { fields: template.fields } as Prisma.InputJsonValue,
            contentSnapshot: {
              blocks: template.blocks,
              editorial: template.editorial,
              faqs: template.faqs,
            } as Prisma.InputJsonValue,
            changeNotes: 'Initial seed',
          },
        },
      },
    });
    void created;
  }

  const templates = await prisma.documentTemplate.findMany({
    where: { seedKey: { in: DOCUMENT_SEED_TEMPLATES.map((item) => item.seedKey) } },
    select: { id: true, slug: true },
  });
  const ids = new Map(templates.map((item) => [item.slug, item.id]));
  for (const template of DOCUMENT_SEED_TEMPLATES) {
    const templateId = ids.get(template.slug);
    if (!templateId) continue;
    for (const [index, relatedSlug] of template.relatedSlugs.entries()) {
      const relatedTemplateId = ids.get(relatedSlug);
      if (!relatedTemplateId || relatedTemplateId === templateId) continue;
      await prisma.documentRelated.upsert({
        where: { templateId_relatedTemplateId: { templateId, relatedTemplateId } },
        update: {},
        create: { templateId, relatedTemplateId, sortOrder: index },
      });
    }
  }
}
