import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/page-shell';
import { AdBanner } from '@/components/business/ad-banner';
import {
  AffiliateCta,
  FinanceDetailSection,
  FinanceProsCons,
  RelatedCalculators,
} from '@/components/finance/finance-product-card';
import { FinanceReviewsSection } from '@/components/finance/finance-reviews';
import { RelatedArticles } from '@/components/finance/related-articles';
import type { FinanceLoan } from '@/services/finance';
import { productEmiLink, processingFeeDisplay } from '@/lib/loan-catalog';
import { getRateFreshness } from '@/lib/loan-rate-freshness';
import { isLoanHubCategorySlug } from '@/lib/loan-hub-categories';
import { loanCategoryCanonicalPath } from '@/lib/loan-path';
import { financeProductDescription } from '@/lib/finance-product-seo';
import { breadcrumbJsonLd } from '@/lib/seo-json-ld';
import Link from 'next/link';

export function LoanDetailView({ loan, id }: { loan: FinanceLoan; id: string }) {
  const title = loan.seoTitle || loan.name;
  const description = financeProductDescription({
    name: loan.name,
    kind: 'loan',
    bankName: loan.bank?.name,
    seoDescription: loan.seoDescription,
    description: loan.description,
    shortDescription: loan.shortDescription,
  });
  const freshness = getRateFreshness(loan.rateLastVerifiedAt);
  const fee = processingFeeDisplay(loan);
  const emi = productEmiLink(loan);
  const categorySlug = loan.category?.slug;
  const categoryHref =
    categorySlug && isLoanHubCategorySlug(categorySlug)
      ? loanCategoryCanonicalPath(categorySlug)
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Finance', url: '/finance' },
        { name: 'Loans', url: '/finance/loans' },
        { name: loan.name, url: `/finance/loans/${id}` },
      ]),
      {
        '@type': 'FinancialProduct',
        name: loan.name,
        description: description || undefined,
        provider: loan.bank?.name
          ? { '@type': 'BankOrCreditUnion', name: loan.bank.name }
          : undefined,
        interestRate: loan.interestRate != null ? Number(loan.interestRate) : undefined,
      },
    ],
  };

  return (
    <PageShell
      title={title}
      description={description ?? undefined}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Finance', href: '/finance' },
        { label: 'Loans', href: '/finance/loans' },
        { label: loan.name },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AdBanner slot="content-top" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bank" value={loan.bank?.name || '—'} />
        <Stat label="Type" value={loan.loanType} />
        <Stat
          label="Interest rate"
          value={loan.interestRate != null ? `${loan.interestRate}% p.a.` : '—'}
        />
        <Stat label="Max amount" value={loan.maxAmount != null ? String(loan.maxAmount) : '—'} />
      </div>

      {categoryHref && loan.category?.name ? (
        <p className="mt-3 text-sm">
          <Link
            href={categoryHref}
            className="font-semibold text-[#0b1f3a] underline-offset-2 hover:text-[#f97316] hover:underline"
          >
            Compare more {loan.category.name}s →
          </Link>
        </p>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        Rates verified: {freshness.verifiedLabel ?? 'Pending'}
        {freshness.publicNotice ? ` · ${freshness.publicNotice}` : ''}
      </p>
      <p className="mt-1 text-xs text-slate-500">Processing fee: {fee}</p>

      {emi ? (
        <p className="mt-3">
          <Link
            href={emi.href}
            className="text-sm font-semibold text-[#0b1f3a] underline-offset-2 hover:text-[#f97316] hover:underline"
          >
            {emi.label}
          </Link>
        </p>
      ) : null}

      <FinanceDetailSection title="Overview">{description}</FinanceDetailSection>
      {loan.eligibility ? (
        <FinanceDetailSection title="Eligibility">{loan.eligibility}</FinanceDetailSection>
      ) : null}
      <FinanceProsCons pros={loan.pros} cons={loan.cons} />
      {loan.affiliateUrl ? (
        <div className="mt-8">
          <AffiliateCta url={loan.affiliateUrl} label="Check eligibility" />
        </div>
      ) : null}

      <FinanceReviewsSection entity="loans" id={id} />

      <RelatedCalculators
        links={[
          { href: emi?.href ?? '/calculators/emi', label: 'EMI Calculator' },
          { href: '/calculators/income-tax', label: 'Income Tax Calculator' },
        ]}
      />
      <RelatedArticles />
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-[#0b1f3a]">{value}</div>
    </div>
  );
}

export async function loanDetailMetadata(id: string): Promise<Metadata> {
  const { fetchFinanceLoan } = await import('@/services/finance');
  const { buildSeoMetadata } = await import('@/lib/seo-metadata');
  try {
    const { data } = await fetchFinanceLoan(id);
    return buildSeoMetadata({
      entityType: 'loan',
      entityId: data.id,
      path: `/finance/loans/${id}`,
      title: data.seoTitle || data.name,
      description: financeProductDescription({
        name: data.name,
        kind: 'loan',
        bankName: data.bank?.name,
        seoDescription: data.seoDescription,
        description: data.description,
        shortDescription: data.shortDescription,
      }),
    });
  } catch {
    return { title: 'Loan', alternates: { canonical: `/finance/loans/${id}` } };
  }
}
