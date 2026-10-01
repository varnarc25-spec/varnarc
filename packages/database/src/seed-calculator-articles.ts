import type { PrismaClient } from '@prisma/client';

const LOAN_TYPE_LABELS: Record<string, string> = {
  home: 'Home',
  personal: 'Personal',
  car: 'Car',
  education: 'Education',
};

const CALCULATOR_ARTICLE_MAP: Record<
  string,
  { categorySlug: string; loanTypes?: string[]; titlePrefix?: string }
> = {
  loan: { categorySlug: 'home-loans', loanTypes: ['home', 'personal', 'car', 'education'] },
  emi: { categorySlug: 'home-loans' },
  'personal-loan-emi': { categorySlug: 'personal-loans' },
  'home-loan-emi': { categorySlug: 'home-loans' },
  'car-loan': { categorySlug: 'car-loans' },
  'bike-loan-emi': { categorySlug: 'car-loans' },
  'education-loan-emi': { categorySlug: 'education-loans' },
  'business-loan-emi': { categorySlug: 'personal-loans' },
  'gold-loan-emi': { categorySlug: 'personal-loans' },
  'loan-against-property-emi': { categorySlug: 'home-loans' },
  'credit-card-emi': { categorySlug: 'investments' },
  'debt-planner': { categorySlug: 'personal-loans' },
  'loan-prepayment': { categorySlug: 'home-loans' },
  'emi-tenure-calculator': { categorySlug: 'home-loans' },
  'emi-rate-compare': { categorySlug: 'home-loans' },
  'fixed-vs-floating-emi': { categorySlug: 'home-loans' },
  'loan-eligibility': { categorySlug: 'home-loans' },
  'income-tax': { categorySlug: 'tax-planning' },
  gst: { categorySlug: 'tax-planning' },
  sip: { categorySlug: 'investments' },
  retirement: { categorySlug: 'investments' },
  paint: { categorySlug: 'home-construction' },
  'construction-cost': { categorySlug: 'home-construction' },
  solar: { categorySlug: 'solar-energy' },
  tile: { categorySlug: 'home-construction' },
  flooring: { categorySlug: 'home-construction' },
};

function articleExcerpt(calculatorName: string, categorySlug: string, loanType?: string): string {
  const topic = loanType
    ? `${LOAN_TYPE_LABELS[loanType] ?? loanType} loan`
    : categorySlug.replace(/-/g, ' ');
  return `${calculatorName} for ${topic}: which inputs move EMI or totals, how to compare tenure vs rate, and what to confirm with a lender in India.`;
}

function articleBody(calculatorName: string, categoryLabel: string, loanType?: string): string {
  const loanLine = loanType
    ? `This guide is for **${LOAN_TYPE_LABELS[loanType] ?? loanType} loans**: LTV/FOIR, typical tenure bands, and fees that sit outside EMI.`
    : `This guide is for the **${calculatorName}** in the ${categoryLabel.replace(/-/g, ' ')} cluster.`;
  return `## ${calculatorName}

${loanLine}

## Inputs that move the result

Amount (or quantity), rate or unit price, and tenure or mix ratio. Change one knob at a time. Fees, GST, wastage, and insurance are often **outside** the core formula.

## India-specific checks

Confirm the number against a sanction letter, structural drawing, DISCOM rule, or dealer quote. Banner rates and “from” prices are not the same as what you sign.

## Bottom line

Save the scenario, then verify with an official document. The calculator is a plan, not a contract.`;
}

export async function seedCalculatorArticles(prisma: PrismaClient, authorId: string) {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true },
  });
  const categoryIds = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const calculators = await prisma.calculator.findMany({
    where: { deletedAt: null, status: 'PUBLISHED' },
    select: { id: true, slug: true, name: true, settings: true },
    orderBy: { name: 'asc' },
  });

  for (const calc of calculators) {
    const mapping = CALCULATOR_ARTICLE_MAP[calc.slug] ?? {
      categorySlug: 'calculator-guides',
      titlePrefix: 'Guide',
    };
    const categoryId = categoryIds[mapping.categorySlug] ?? categoryIds['calculator-guides'];
    if (!categoryId) continue;

    const loanTypes = mapping.loanTypes ?? [undefined];
    for (const loanType of loanTypes) {
      const slugSuffix = loanType ? `-${loanType}` : '';
      const slug = `guide-${calc.slug}${slugSuffix}`;
      const loanLabel = loanType ? `${LOAN_TYPE_LABELS[loanType] ?? loanType} ` : '';
      const title = `${loanLabel}${calc.name}: Complete Guide`;
      const excerpt = articleExcerpt(calc.name, mapping.categorySlug, loanType);
      const content = articleBody(calc.name, mapping.categorySlug, loanType);
      const readingTime = Math.max(3, Math.ceil(content.split(/\s+/).length / 200));
      const metadata: Record<string, unknown> = {
        calculatorSlugs: [calc.slug],
        ...(loanType ? { loanTypes: [loanType] } : {}),
      };

      await prisma.article.upsert({
        where: { slug },
        update: {
          title,
          excerpt,
          content,
          categoryId,
          authorId,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          readingTimeMinutes: readingTime,
          metadata: metadata as never,
          deletedAt: null,
        },
        create: {
          title,
          slug,
          excerpt,
          content,
          categoryId,
          authorId,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          readingTimeMinutes: readingTime,
          metadata: metadata as never,
        },
      });
    }

    const relatedArticles = {
      categorySlug: mapping.categorySlug,
      ...(calc.slug === 'loan'
        ? {
            topicField: 'loanType',
            topicCategorySlugs: {
              home: 'home-loans',
              personal: 'personal-loans',
              car: 'car-loans',
              education: 'education-loans',
            },
          }
        : {}),
    };

    const settings =
      calc.settings && typeof calc.settings === 'object'
        ? { ...(calc.settings as Record<string, unknown>), relatedArticles }
        : { relatedArticles };

    await prisma.calculator.update({
      where: { id: calc.id },
      data: { settings: settings as never },
    });
  }
}
