import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { DocumentField } from '@varnarc/validation';
import { PageShell } from '@/components/layout/page-shell';
import { ApiError, apiPublicFetch } from '@/services/api-client';
import {
  breadcrumbJsonLd,
  faqJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo-json-ld';
import { getPublicSiteUrlSync } from '@/lib/public-site-url';

type Template = {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string | null;
  requiresReview: boolean;
  legalDisclaimer: string | null;
  officialSourceUrl: string | null;
  lastVerifiedAt: string | null;
  isFree: boolean;
  category: { name: string; slug: string; parent: { name: string; slug: string } | null };
  editorial: {
    whatItIs: string;
    whenRequired: string;
    requiredInformation: string[];
    steps: string[];
    sampleFormat: string;
    considerations: string[];
    relatedTools: Array<{ label: string; href: string }>;
  };
  fields: DocumentField[];
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ name: string; slug: string; shortDescription: string }>;
};

async function load(slug: string) {
  return (await apiPublicFetch<Template>(`/documents/templates/slug/${slug}`)).data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await load(slug);
    return {
      title: data.seoTitle,
      description: data.seoDescription,
      alternates: { canonical: data.canonicalUrl || `/documents/${slug}` },
    };
  } catch {
    return { title: 'Document' };
  }
}

export const revalidate = 60;

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data: Template;
  try {
    data = await load(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const site = getPublicSiteUrlSync();
  const url = `${site}/documents/${data.slug}`;
  const crumbs = [
    { name: 'Home', url: site },
    { name: 'Documents', url: `${site}/documents` },
    ...(data.category.parent
      ? [
          {
            name: data.category.parent.name,
            url: `${site}/documents/category/${data.category.parent.slug}`,
          },
        ]
      : []),
    { name: data.category.name, url: `${site}/documents/category/${data.category.slug}` },
    { name: data.name, url },
  ];
  return (
    <PageShell
      title={data.name}
      description={data.shortDescription}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: data.category.name, href: `/documents/category/${data.category.slug}` },
        { label: data.name },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(crumbs.map((item) => ({ name: item.name, url: item.url }))),
          ).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageJsonLd({
              name: data.seoTitle,
              description: data.seoDescription,
              url,
              isPartOfUrl: site,
            }),
          ).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: data.name,
              description: data.shortDescription,
              url,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: { price: 0, priceCurrency: 'INR', description: 'Free template' },
            }),
          ).replace(/</g, '\\u003c'),
        }}
      />
      {data.faqs.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd(data.faqs)).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href={`/documents/${data.slug}/create`}
          className="rounded-md bg-[#0b1f3a] px-4 py-2 text-sm text-white"
        >
          Create document
        </Link>
        <Link
          href={`/documents/${data.slug}/create`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          Download blank template
        </Link>
      </div>
      {data.requiresReview || data.legalDisclaimer ? (
        <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {data.legalDisclaimer || 'Review this sample carefully before you rely on it.'}
        </p>
      ) : null}
      <div className="space-y-8 text-sm leading-6 text-slate-700">
        <Section title="What this document is">
          <p>{data.editorial.whatItIs}</p>
        </Section>
        <Section title="When it is required">
          <p>{data.editorial.whenRequired}</p>
        </Section>
        <Section title="Required information">
          <ul className="list-disc pl-5">
            {data.editorial.requiredInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="Instructions">
          <ol className="list-decimal pl-5">
            {data.editorial.steps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </Section>
        <Section title="Sample format">
          <p className="whitespace-pre-wrap">{data.editorial.sampleFormat}</p>
        </Section>
        <Section title="Important considerations">
          <ul className="list-disc pl-5">
            {data.editorial.considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="FAQs">
          <div className="space-y-3">
            {data.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-[#0b1f3a]">{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </Section>
        {data.related.length ? (
          <Section title="Related documents">
            <ul className="space-y-2">
              {data.related.map((item) => (
                <li key={item.slug}>
                  <Link
                    className="font-medium text-[#0b1f3a] underline"
                    href={`/documents/${item.slug}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        {data.editorial.relatedTools?.length ? (
          <Section title="Related tools">
            <ul className="flex flex-wrap gap-3">
              {data.editorial.relatedTools.map((tool) => (
                <li key={tool.href}>
                  <Link className="underline" href={tool.href}>
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        {data.officialSourceUrl ? (
          <Section title="Official source">
            <p>
              <a className="underline" href={data.officialSourceUrl} rel="noopener noreferrer">
                {data.officialSourceUrl}
              </a>
            </p>
          </Section>
        ) : null}
        <p className="text-xs text-slate-500">
          Last verified:{' '}
          {data.lastVerifiedAt
            ? new Date(data.lastVerifiedAt).toLocaleDateString('en-IN')
            : 'Not yet independently verified.'}
          {data.isFree ? ' Free to generate.' : ''}
        </p>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-[#0b1f3a]">{title}</h2>
      {children}
    </section>
  );
}
