import type { SeedCategory } from './define';
import { publishedTemplates } from './templates-employment';
import { generalTemplates } from './templates-general';
import { reviewTemplates } from './templates-review';
import type { SeedTemplate } from './define';

export type { SeedCategory, SeedTemplate };

export const DOCUMENT_SEED_CATEGORIES: SeedCategory[] = [
  category(
    'employment-hr',
    'Employment & HR',
    'Resumes, employment letters, and certificate formats.',
    'briefcase',
    1,
    'Employment document formats',
    'Resume, resignation, experience, and salary certificate formats.',
  ),
  category(
    'resumes-and-applications',
    'Resumes and applications',
    'Resumes and cover letters.',
    'file-text',
    1,
    'Resume and cover letter formats',
    'Free resume and cover letter formats you can edit.',
    'employment-hr',
  ),
  category(
    'employment-letters',
    'Employment letters',
    'Letters an employee sends to an employer.',
    'mail',
    2,
    'Employment letter formats',
    'Resignation, leave, joining, and work-from-home letters.',
    'employment-hr',
  ),
  category(
    'employment-certificates',
    'Employment certificates',
    'Sample formats an employer can adapt.',
    'badge-check',
    3,
    'Employment certificate formats',
    'Experience, relieving, salary, offer, and appointment formats.',
    'employment-hr',
  ),
  category(
    'letters-applications',
    'Letters & applications',
    'Formal letters for everyday requests.',
    'mail',
    2,
    'Letter and application formats',
    'Request, complaint, permission, and invitation letters.',
  ),
  category(
    'formal-letters',
    'Formal letters',
    'Requests, complaints, and invitations.',
    'mail',
    1,
    'Formal letter formats',
    'Request, complaint, permission, and recommendation letters.',
    'letters-applications',
  ),
  category(
    'property-rental',
    'Property & rental',
    'Rent receipts, handover notes, and rental outlines.',
    'home',
    3,
    'Rental document formats',
    'Rent receipts and rental notice formats for India.',
  ),
  category(
    'rent-records',
    'Rent records',
    'Receipts and notices about a tenancy.',
    'receipt',
    1,
    'Rent receipt and notice formats',
    'Rent receipts, deposit receipts, and termination notices.',
    'property-rental',
  ),
  category(
    'property-checklists',
    'Property checklists',
    'Handover checklists.',
    'list-checks',
    2,
    'Property handover checklist',
    'A handover checklist for keys, meters, and appliances.',
    'property-rental',
  ),
  category(
    'banking-finance',
    'Banking & finance',
    'Requests you send to a bank or lender.',
    'landmark',
    4,
    'Bank and loan letter formats',
    'Account closure, KYC update, and loan foreclosure letters.',
  ),
  category(
    'bank-requests',
    'Bank requests',
    'Letters to a bank about your relationship.',
    'landmark',
    1,
    'Bank request letter formats',
    'Account closure, KYC update, and payment acknowledgements.',
    'banking-finance',
  ),
  category(
    'loan-requests',
    'Loan requests',
    'Letters that ask a lender for a statement.',
    'landmark',
    2,
    'Loan request letter formats',
    'Loan foreclosure request letters.',
    'banking-finance',
  ),
  category(
    'business-gst',
    'Business & GST',
    'Invoices, quotations, and delivery notes.',
    'receipt',
    5,
    'Invoice and quotation formats',
    'Invoice, quotation, purchase order, and receipt formats.',
  ),
  category(
    'billing-documents',
    'Billing documents',
    'Commercial bills and orders.',
    'receipt',
    1,
    'Billing document formats',
    'Invoices, quotations, purchase orders, and challans.',
    'business-gst',
  ),
  category(
    'legal-documents',
    'Legal documents',
    'Outlines that need professional review.',
    'scale',
    6,
    'Legal document outlines',
    'Draft outlines for agreements and notices. Not ready to file.',
  ),
  category(
    'legal-drafts',
    'Drafts for review',
    'Outlines awaiting legal review.',
    'scale',
    1,
    'Legal drafts for review',
    'Affidavit, notice, and agreement outlines marked for review.',
    'legal-documents',
  ),
  category(
    'government-documents',
    'Government documents',
    'Guidance for official applications. Not replica certificates.',
    'landmark',
    7,
    'Government application guidance',
    'How to prepare for official applications. No replica certificates.',
  ),
  category(
    'certificate-guidance',
    'Certificate guidance',
    'Preparation notes for state certificates.',
    'landmark',
    1,
    'Certificate application guidance',
    'Preparation notes for certificates issued by government offices.',
    'government-documents',
  ),
  category(
    'identity-guidance',
    'Identity and travel guidance',
    'Pointers to official identity and passport portals.',
    'landmark',
    2,
    'Identity document guidance',
    'PAN, Aadhaar, and passport guidance with official links.',
    'government-documents',
  ),
  category(
    'education',
    'Education',
    'School and college request letters.',
    'graduation-cap',
    8,
    'School letter formats',
    'School leave and fee concession request formats.',
  ),
  category(
    'school-requests',
    'School requests',
    'Letters to a school.',
    'graduation-cap',
    1,
    'School application letters',
    'Leave and fee concession letters for school.',
    'education',
  ),
  category(
    'construction-home',
    'Construction & home',
    'Contractor quotations and agreement outlines.',
    'hammer',
    9,
    'Construction document formats',
    'Contractor quotations and construction agreement outlines.',
  ),
  category(
    'contractor-documents',
    'Contractor documents',
    'Quotes and contract outlines for site work.',
    'hammer',
    1,
    'Contractor document formats',
    'Contractor quotation and construction agreement outline.',
    'construction-home',
  ),
  category(
    'automobile',
    'Automobile',
    'Vehicle handover notes and sale outlines.',
    'car',
    10,
    'Vehicle document formats',
    'Vehicle delivery receipts and sale outlines.',
  ),
  category(
    'vehicle-records',
    'Vehicle records',
    'Handover and sale notes.',
    'car',
    1,
    'Vehicle receipt formats',
    'Vehicle delivery receipts and sale outlines.',
    'automobile',
  ),
];

function category(
  slug: string,
  name: string,
  description: string,
  icon: string,
  displayOrder: number,
  seoTitle: string,
  seoDescription: string,
  parentSlug?: string,
): SeedCategory {
  return {
    seedKey: slug,
    slug,
    name,
    description,
    icon,
    displayOrder,
    seoTitle,
    seoDescription,
    parentSlug,
  };
}

export const DOCUMENT_SEED_TEMPLATES: SeedTemplate[] = [
  ...publishedTemplates,
  ...generalTemplates,
  ...reviewTemplates,
];

const categorySlugs = new Set(DOCUMENT_SEED_CATEGORIES.map((item) => item.slug));
const templateSlugs = new Set<string>();

for (const template of DOCUMENT_SEED_TEMPLATES) {
  if (templateSlugs.has(template.slug)) {
    throw new Error(`Duplicate document slug: ${template.slug}`);
  }
  templateSlugs.add(template.slug);
  if (!categorySlugs.has(template.categorySlug)) {
    throw new Error(`Unknown category ${template.categorySlug} on ${template.slug}`);
  }
  for (const related of template.relatedSlugs) {
    if (!DOCUMENT_SEED_TEMPLATES.some((item) => item.slug === related)) {
      throw new Error(`${template.slug} relates to missing template ${related}`);
    }
  }
}

if (DOCUMENT_SEED_TEMPLATES.length !== 50) {
  throw new Error(`Expected 50 document templates, found ${DOCUMENT_SEED_TEMPLATES.length}`);
}
