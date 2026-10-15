import { z } from 'zod';

export const DOCUMENT_FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'date',
  'email',
  'phone',
  'address',
  'select',
  'radio',
  'checkbox',
  'currency',
  'repeat',
] as const;

export const DOCUMENT_TEMPLATE_STATUSES = [
  'DRAFT',
  'REVIEW_REQUIRED',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export const DOCUMENT_TEMPLATE_KINDS = [
  'LETTER',
  'CERTIFICATE',
  'AGREEMENT',
  'INVOICE',
  'RECEIPT',
  'CHECKLIST',
  'GUIDANCE',
  'APPLICATION',
] as const;

export const DOCUMENT_FILE_FORMATS = ['PDF', 'DOCX', 'HTML'] as const;

const fieldKeySchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9_]{0,40}$/, 'Use a short field key that starts with a letter.');

const fieldOptionSchema = z.object({
  value: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
});

const fieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().min(0).max(5000).optional(),
  maxLength: z.number().int().min(1).max(5000).optional(),
  pattern: z.string().min(1).max(80).optional(),
});

const visibleWhenSchema = z.object({
  field: fieldKeySchema,
  equals: z.string().min(1).max(80),
});

const itemFieldSchema = z.object({
  key: fieldKeySchema,
  label: z.string().min(1).max(120),
  type: z.enum([
    'text',
    'textarea',
    'number',
    'date',
    'email',
    'phone',
    'address',
    'select',
    'radio',
    'checkbox',
    'currency',
  ]),
  required: z.boolean().default(false),
  helpText: z.string().max(400).optional(),
  placeholder: z.string().max(160).optional(),
  defaultValue: z.string().max(500).optional(),
  options: z.array(fieldOptionSchema).max(30).optional(),
  validation: fieldValidationSchema.optional(),
});

export const documentFieldSchema = z.object({
  key: fieldKeySchema,
  label: z.string().min(1).max(120),
  type: z.enum(DOCUMENT_FIELD_TYPES),
  required: z.boolean().default(false),
  helpText: z.string().max(400).optional(),
  placeholder: z.string().max(160).optional(),
  defaultValue: z.string().max(500).optional(),
  options: z.array(fieldOptionSchema).max(30).optional(),
  validation: fieldValidationSchema.optional(),
  visibleWhen: visibleWhenSchema.optional(),
  itemFields: z.array(itemFieldSchema).max(12).optional(),
  maxItems: z.number().int().min(1).max(20).optional(),
});

const blockTextSchema = z.string().max(4000);

const leafBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    text: blockTextSchema,
  }),
  z.object({ type: z.literal('paragraph'), text: blockTextSchema }),
  z.object({
    type: z.literal('list'),
    items: z.array(blockTextSchema).min(1).max(40),
  }),
  z.object({
    type: z.literal('table'),
    caption: z.string().max(200).optional(),
    headers: z.array(z.string().max(200)).max(8).optional(),
    rows: z.array(z.array(z.string().max(500)).max(8)).max(40),
  }),
  z.object({
    type: z.literal('lineItems'),
    field: fieldKeySchema,
    columns: z
      .array(
        z.object({
          header: z.string().min(1).max(80),
          key: fieldKeySchema.optional(),
          format: z.enum(['text', 'currency']).optional(),
          product: z.tuple([fieldKeySchema, fieldKeySchema]).optional(),
        }),
      )
      .min(1)
      .max(8),
  }),
  z.object({
    type: z.literal('signature'),
    label: blockTextSchema,
    nameField: fieldKeySchema.optional(),
  }),
  z.object({ type: z.literal('spacer') }),
  z.object({ type: z.literal('pageBreak') }),
]);

export const documentBlockSchema = z.union([
  leafBlockSchema,
  z.object({
    type: z.literal('repeat'),
    field: fieldKeySchema,
    blocks: z.array(leafBlockSchema).min(1).max(20),
  }),
]);

export const documentFormSchema = z.object({
  fields: z.array(documentFieldSchema).min(1).max(40),
});

export const documentTemplateContentSchema = z.object({
  blocks: z.array(documentBlockSchema).min(1).max(80),
});

export const documentEditorialSchema = z.object({
  whatItIs: z.string().min(20).max(2000),
  whenRequired: z.string().min(10).max(2000),
  requiredInformation: z.array(z.string().min(2).max(200)).min(1).max(30),
  steps: z.array(z.string().min(2).max(400)).min(1).max(12),
  sampleFormat: z.string().min(10).max(4000),
  considerations: z.array(z.string().min(2).max(500)).min(1).max(12),
  relatedTools: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        href: z.string().regex(/^\/[a-z0-9\-/]*$/),
      }),
    )
    .max(8)
    .default([]),
});

export const documentFaqSchema = z.object({
  question: z.string().min(8).max(180),
  answer: z.string().min(20).max(800),
});

export const documentInputsSchema = z.record(z.string(), z.unknown());

export type DocumentField = z.infer<typeof documentFieldSchema>;
export type DocumentItemField = z.infer<typeof itemFieldSchema>;
export type DocumentBlock = z.infer<typeof documentBlockSchema>;
export type DocumentFormSchema = z.infer<typeof documentFormSchema>;
export type DocumentTemplateContent = z.infer<typeof documentTemplateContentSchema>;
export type DocumentEditorial = z.infer<typeof documentEditorialSchema>;
export type DocumentFaq = z.infer<typeof documentFaqSchema>;
export type DocumentTemplateStatus = (typeof DOCUMENT_TEMPLATE_STATUSES)[number];
export type DocumentTemplateKind = (typeof DOCUMENT_TEMPLATE_KINDS)[number];
export type DocumentFileFormat = (typeof DOCUMENT_FILE_FORMATS)[number];

const SENSITIVE_FIELD =
  /\b(aadhaar|aadhar|uid|password|passcode|otp|cvv|cvc|account\s*number|pan(?:\s*number)?)\b/i;

export function fieldLooksSensitive(key: string, label: string): boolean {
  const haystack = `${key.replace(/_/g, ' ')} ${label}`;
  return SENSITIVE_FIELD.test(haystack);
}

export function collectTemplateTokens(blocks: DocumentBlock[]): string[] {
  const tokens = new Set<string>();
  const read = (text: string) => {
    for (const match of text.matchAll(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g)) {
      const token = match[1];
      if (token) tokens.add(token);
    }
  };
  const walk = (block: DocumentBlock) => {
    if (block.type === 'heading' || block.type === 'paragraph') read(block.text);
    if (block.type === 'signature') read(block.label);
    if (block.type === 'list') block.items.forEach(read);
    if (block.type === 'table') {
      block.headers?.forEach(read);
      block.rows.forEach((row) => row.forEach(read));
      if (block.caption) read(block.caption);
    }
    if (block.type === 'repeat') {
      for (const child of block.blocks) walk(child);
    }
  };
  blocks.forEach(walk);
  return [...tokens];
}

export type TemplateIssue = { path: string; message: string };

export function validateDocumentTemplate(input: {
  fields: DocumentField[];
  blocks: DocumentBlock[];
  editorial: DocumentEditorial;
  faqs: DocumentFaq[];
}): TemplateIssue[] {
  const issues: TemplateIssue[] = [];
  const form = documentFormSchema.safeParse({ fields: input.fields });
  if (!form.success) {
    for (const issue of form.error.issues.slice(0, 4)) {
      issues.push({
        path: issue.path.join('.') || 'fields',
        message: issue.message,
      });
    }
    return issues;
  }
  const content = documentTemplateContentSchema.safeParse({ blocks: input.blocks });
  if (!content.success) {
    for (const issue of content.error.issues.slice(0, 4)) {
      issues.push({ path: issue.path.join('.') || 'blocks', message: issue.message });
    }
    return issues;
  }
  const editorial = documentEditorialSchema.safeParse(input.editorial);
  if (!editorial.success) {
    issues.push({ path: 'editorial', message: 'Editorial content is incomplete.' });
  }
  if (input.faqs.length < 1 || input.faqs.length > 8) {
    issues.push({ path: 'faqs', message: 'Add between 1 and 8 FAQs.' });
  }
  for (const faq of input.faqs) {
    const parsed = documentFaqSchema.safeParse(faq);
    if (!parsed.success) {
      issues.push({ path: 'faqs', message: 'An FAQ is missing a question or answer.' });
      break;
    }
  }

  const keys = new Set<string>();
  for (const field of input.fields) {
    if (keys.has(field.key)) {
      issues.push({ path: field.key, message: 'Duplicate field key.' });
    }
    keys.add(field.key);
    if (fieldLooksSensitive(field.key, field.label)) {
      issues.push({
        path: field.key,
        message: 'This field asks for an identity number or secret. Remove it.',
      });
    }
    if (field.type === 'repeat') {
      if (!field.itemFields?.length) {
        issues.push({ path: field.key, message: 'Repeating section needs item fields.' });
      }
      for (const item of field.itemFields ?? []) {
        if (fieldLooksSensitive(item.key, item.label)) {
          issues.push({
            path: `${field.key}.${item.key}`,
            message: 'This field asks for an identity number or secret. Remove it.',
          });
        }
      }
    }
    if ((field.type === 'select' || field.type === 'radio') && !field.options?.length) {
      issues.push({ path: field.key, message: 'Add at least one option.' });
    }
    if (field.validation?.pattern) {
      try {
        new RegExp(field.validation.pattern);
      } catch {
        issues.push({ path: field.key, message: 'Validation pattern is not a valid expression.' });
      }
    }
    if (
      field.visibleWhen &&
      !input.fields.some((candidate) => candidate.key === field.visibleWhen?.field)
    ) {
      issues.push({ path: field.key, message: 'Conditional field points at an unknown field.' });
    }
  }

  const known = new Set<string>(['today']);
  for (const field of input.fields) {
    known.add(field.key);
    for (const item of field.itemFields ?? []) known.add(`item.${item.key}`);
  }
  for (const token of collectTemplateTokens(input.blocks)) {
    if (token.startsWith('item.')) {
      if (!known.has(token)) {
        issues.push({ path: token, message: `Unknown repeating token {{${token}}}.` });
      }
      continue;
    }
    if (!known.has(token)) {
      issues.push({ path: token, message: `Unknown token {{${token}}}.` });
    }
  }
  return issues;
}
