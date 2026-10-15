import type {
  DocumentBlock,
  DocumentEditorial,
  DocumentFaq,
  DocumentField,
  DocumentTemplateKind,
} from '@varnarc/validation';
import { validateDocumentTemplate } from '@varnarc/validation';

export type SeedCategory = {
  seedKey: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
  parentSlug?: string;
  seoTitle: string;
  seoDescription: string;
};

export type SeedTemplate = {
  seedKey: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: string;
  templateType: DocumentTemplateKind;
  status: 'PUBLISHED' | 'REVIEW_REQUIRED';
  requiresReview: boolean;
  isFree: true;
  legalDisclaimer: string | null;
  officialSourceUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  fields: DocumentField[];
  blocks: DocumentBlock[];
  editorial: DocumentEditorial;
  faqs: DocumentFaq[];
  relatedSlugs: string[];
};

const SAMPLE_NOTE =
  'This is a sample format. Replace the bracketed lines with your own facts and read the result before you send or sign it.';

export const EMPLOYER_DISCLAIMER =
  'This is a sample format for an organisation to adapt on its own letterhead. It does not certify employment, pay, or conduct. The organisation should check its records before issuing it.';

export const LEGAL_DISCLAIMER =
  'This is an outline for discussion. It is not a complete agreement, affidavit, or court filing. Stamp duty, registration, witnessing, and notarisation depend on the facts and the state. A qualified professional should review it before anyone signs or relies on it.';

export const GUIDANCE_DISCLAIMER =
  'This is general preparation guidance. Offices change their requirements. Confirm the current process on the official portal. Varnarc does not issue certificates, identity documents, or government seals.';

export function field<T extends DocumentField['type']>(
  key: string,
  label: string,
  type: T,
  extra: Partial<Omit<DocumentField, 'key' | 'label' | 'type'>> = {},
): Omit<DocumentField, 'type'> & { type: T } {
  return { key, label, type, required: extra.required ?? true, ...extra };
}

export const letterFields = (extra: DocumentField[] = []): DocumentField[] => [
  field('letterDate', 'Date', 'date'),
  field('city', 'City', 'text'),
  field('fromName', 'Your name', 'text'),
  field('fromAddress', 'Your address', 'address'),
  field('toName', 'Recipient name', 'text'),
  field('toOrganization', 'Organisation', 'text'),
  ...extra,
];

export function letterBlocks(
  title: string,
  paragraphs: string[],
  signLabel = 'Yours faithfully',
): DocumentBlock[] {
  return [
    { type: 'heading', level: 1, text: title },
    { type: 'paragraph', text: 'Date: {{letterDate}}' },
    { type: 'paragraph', text: 'Place: {{city}}' },
    { type: 'paragraph', text: '{{fromName}}' },
    { type: 'paragraph', text: '{{fromAddress}}' },
    { type: 'paragraph', text: 'To' },
    { type: 'paragraph', text: '{{toName}}' },
    { type: 'paragraph', text: '{{toOrganization}}' },
    { type: 'paragraph', text: 'Dear {{toName}},' },
    ...paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
    { type: 'signature', label: signLabel, nameField: 'fromName' },
  ];
}

export function defineTemplate(
  input: Omit<SeedTemplate, 'seedKey' | 'isFree' | 'legalDisclaimer' | 'officialSourceUrl'> & {
    legalDisclaimer?: string | null;
    officialSourceUrl?: string | null;
  },
): SeedTemplate {
  const template: SeedTemplate = {
    ...input,
    seedKey: input.slug,
    isFree: true,
    legalDisclaimer: input.legalDisclaimer ?? null,
    officialSourceUrl: input.officialSourceUrl ?? null,
  };
  const issues = validateDocumentTemplate({
    fields: template.fields,
    blocks: template.blocks,
    editorial: template.editorial,
    faqs: template.faqs,
  });
  if (issues.length) {
    throw new Error(
      `Document seed "${template.slug}" is invalid: ${issues.map((issue) => issue.message).join(' ')}`,
    );
  }
  if (template.seoTitle.length > 70 || template.seoDescription.length > 170) {
    throw new Error(`Document seed "${template.slug}" has an SEO field that is too long.`);
  }
  if (template.shortDescription.length > 180) {
    throw new Error(`Document seed "${template.slug}" has a long summary.`);
  }
  return template;
}

export function editorial(input: {
  what: string;
  when: string;
  info: string[];
  steps: string[];
  sample: string;
  considerations: string[];
  tools?: DocumentEditorial['relatedTools'];
}): DocumentEditorial {
  return {
    whatItIs: input.what,
    whenRequired: input.when,
    requiredInformation: input.info,
    steps: input.steps,
    sampleFormat: input.sample || SAMPLE_NOTE,
    considerations: input.considerations,
    relatedTools: input.tools ?? [],
  };
}

export const defaultSteps = [
  'Enter only the facts you want printed.',
  'Read the preview and correct any line that does not match your records.',
  'Download a PDF or Word file, or print the preview.',
];

export function simpleLetter(input: {
  slug: string;
  name: string;
  categorySlug: string;
  keyword: string;
  secondary: string[];
  summary: string;
  about: string;
  when: string;
  info: string[];
  paragraphs: string[];
  extraFields?: DocumentField[];
  considerations: string[];
  faqs: DocumentFaq[];
  related: string[];
  sample: string;
  tools?: DocumentEditorial['relatedTools'];
  status?: SeedTemplate['status'];
  requiresReview?: boolean;
  kind?: DocumentTemplateKind;
  disclaimer?: string | null;
  officialSourceUrl?: string | null;
  signLabel?: string;
  blocks?: DocumentBlock[];
  fields?: DocumentField[];
}): SeedTemplate {
  return defineTemplate({
    slug: input.slug,
    name: input.name,
    categorySlug: input.categorySlug,
    shortDescription: input.summary,
    fullDescription: input.about,
    templateType: input.kind ?? 'LETTER',
    status: input.status ?? 'PUBLISHED',
    requiresReview: input.requiresReview ?? false,
    legalDisclaimer: input.disclaimer ?? null,
    officialSourceUrl: input.officialSourceUrl ?? null,
    seoTitle: `${input.name} format`.slice(0, 70),
    seoDescription: input.summary.slice(0, 170),
    focusKeyword: input.keyword,
    secondaryKeywords: input.secondary,
    fields: input.fields ?? letterFields(input.extraFields),
    blocks:
      input.blocks ??
      letterBlocks(input.name, input.paragraphs, input.signLabel ?? 'Yours faithfully'),
    editorial: editorial({
      what: input.about,
      when: input.when,
      info: input.info,
      steps: defaultSteps,
      sample: input.sample,
      considerations: input.considerations,
      tools: input.tools,
    }),
    faqs: input.faqs,
    relatedSlugs: input.related,
  });
}
