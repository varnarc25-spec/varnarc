import { z } from 'zod';
import {
  DOCUMENT_FILE_FORMATS,
  DOCUMENT_TEMPLATE_KINDS,
  DOCUMENT_TEMPLATE_STATUSES,
  documentBlockSchema,
  documentEditorialSchema,
  documentFaqSchema,
  documentFieldSchema,
} from './schema';

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const documentListQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  sort: z.enum(['popular', 'latest', 'name']).optional(),
  status: z.enum(DOCUMENT_TEMPLATE_STATUSES).optional(),
});

export const documentSearchQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(24).optional(),
});

export const documentInputsBodySchema = z.object({
  inputs: z.record(z.string(), z.unknown()),
  blank: z.boolean().optional(),
});

export const documentExportBodySchema = documentInputsBodySchema.extend({
  format: z.enum(DOCUMENT_FILE_FORMATS).default('PDF'),
});

export const saveGeneratedDocumentSchema = z.object({
  templateSlug: slugSchema,
  title: z.string().trim().min(1).max(160).optional(),
  inputs: z.record(z.string(), z.unknown()),
});

export const updateGeneratedDocumentSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  inputs: z.record(z.string(), z.unknown()),
});

export const documentEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'generator_start',
    'generator_complete',
    'download',
    'search',
    'error',
  ]),
  templateSlug: slugSchema.optional(),
  categorySlug: slugSchema.optional(),
  query: z.string().trim().max(80).optional(),
  format: z.enum(DOCUMENT_FILE_FORMATS).optional(),
});

const categoryBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  description: z.string().trim().max(500).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  icon: z.string().trim().max(40).optional().nullable(),
  displayOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(170).optional().nullable(),
});

export const createDocumentCategorySchema = categoryBodySchema;
export const updateDocumentCategorySchema = categoryBodySchema.partial();

export const reorderDocumentCategoriesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
});

const templateBodySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  shortDescription: z.string().trim().min(10).max(180),
  fullDescription: z.string().trim().min(20).max(2000),
  templateType: z.enum(DOCUMENT_TEMPLATE_KINDS),
  jurisdiction: z.string().trim().max(8).default('IN'),
  state: z.string().trim().max(80).optional().nullable(),
  language: z.string().trim().max(12).default('en'),
  fields: z.array(documentFieldSchema).min(1).max(40),
  blocks: z.array(documentBlockSchema).min(1).max(80),
  editorial: documentEditorialSchema,
  faqs: z.array(documentFaqSchema).min(1).max(8),
  focusKeyword: z.string().trim().min(2).max(80),
  secondaryKeywords: z.array(z.string().trim().min(2).max(80)).max(8).default([]),
  status: z.enum(DOCUMENT_TEMPLATE_STATUSES).optional(),
  isFree: z.boolean().default(true),
  requiresReview: z.boolean().default(false),
  legalDisclaimer: z.string().trim().max(800).optional().nullable(),
  officialSourceUrl: z
    .union([z.literal(''), z.string().url()])
    .optional()
    .nullable(),
  seoTitle: z.string().trim().min(8).max(70),
  seoDescription: z.string().trim().min(20).max(170),
  canonicalUrl: z
    .union([
      z.literal(''),
      z.string().regex(/^\/documents\/[a-z0-9\-/]*$/),
      z.string().regex(/^https:\/\/varnarc\.com\/documents\/[a-z0-9\-/]*$/),
    ])
    .optional()
    .nullable(),
  changeNotes: z.string().trim().max(400).optional(),
  nextReviewAt: z.string().datetime().optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export const createDocumentTemplateSchema = templateBodySchema;
export const updateDocumentTemplateSchema = templateBodySchema.partial();

export const rollbackDocumentTemplateSchema = z.object({
  version: z.number().int().min(1),
});

export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;
export type DocumentSearchQuery = z.infer<typeof documentSearchQuerySchema>;
export type DocumentInputsBody = z.infer<typeof documentInputsBodySchema>;
export type DocumentExportBody = z.infer<typeof documentExportBodySchema>;
export type SaveGeneratedDocumentInput = z.infer<typeof saveGeneratedDocumentSchema>;
export type UpdateGeneratedDocumentInput = z.infer<typeof updateGeneratedDocumentSchema>;
export type DocumentEventInput = z.infer<typeof documentEventSchema>;
export type CreateDocumentCategoryInput = z.infer<typeof createDocumentCategorySchema>;
export type UpdateDocumentCategoryInput = z.infer<typeof updateDocumentCategorySchema>;
export type CreateDocumentTemplateInput = z.infer<typeof createDocumentTemplateSchema>;
export type UpdateDocumentTemplateInput = z.infer<typeof updateDocumentTemplateSchema>;
