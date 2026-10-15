import type { Metadata } from 'next';
import Link from 'next/link';
import { ModuleHubShell } from '@/components/hub/module-hub-shell';
import { HubSectionHeader } from '@/components/hub/hub-section-header';
import { apiPublicFetch } from '@/services/api-client';

export const metadata: Metadata = {
  title: 'Free Documents, Forms & Templates',
  description:
    'Create professional documents online. Customize templates and download PDF or Word files in minutes.',
  alternates: { canonical: '/documents' },
};

export const revalidate = 60;

type Category = {
  name: string;
  slug: string;
  description: string | null;
  children?: Array<{ name: string; slug: string }>;
};

type Card = {
  name: string;
  slug: string;
  shortDescription: string;
};

async function load<T>(path: string): Promise<T | null> {
  try {
    const result = await apiPublicFetch<T>(path);
    return result.data;
  } catch {
    return null;
  }
}

export default async function DocumentsHomePage() {
  const [categories, popular, latest] = await Promise.all([
    load<Category[]>('/documents/categories'),
    load<Card[]>('/documents/popular'),
    load<Card[]>('/documents/latest'),
  ]);

  return (
    <ModuleHubShell
      moduleKey="documents"
      title="Free Documents, Forms & Templates"
      description="Create professional documents online. Customize templates and download PDF or Word files in minutes."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Documents' }]}
      searchPath="/documents/search"
      popularLinks={(popular ?? [])
        .slice(0, 6)
        .map((item) => ({ label: item.name, href: `/documents/${item.slug}` }))}
    >
      <section>
        <HubSectionHeader title="Categories" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((category) => (
            <Link
              key={category.slug}
              href={`/documents/category/${category.slug}`}
              className="rounded-lg border border-slate-200 p-4 hover:border-slate-400"
            >
              <h2 className="text-lg font-semibold text-[#0b1f3a]">{category.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </Link>
          ))}
        </div>
        {!categories?.length ? (
          <p className="text-sm text-slate-600">
            Categories will appear after the catalog is seeded.
          </p>
        ) : null}
      </section>
      <TemplateRow title="Popular documents" items={popular ?? []} />
      <TemplateRow title="Recently added" items={latest ?? []} />
      <section>
        <HubSectionHeader title="How it works" />
        <ol className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <li className="rounded-lg bg-slate-50 p-4">
            1. Choose a template and read what it is for.
          </li>
          <li className="rounded-lg bg-slate-50 p-4">
            2. Fill the form and check the live preview.
          </li>
          <li className="rounded-lg bg-slate-50 p-4">
            3. Download PDF or Word. Sign in only if you want to save it.
          </li>
        </ol>
      </section>
      <section>
        <HubSectionHeader title="Related Varnarc tools" />
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link className="underline" href="/calculators">
              Calculators
            </Link>
          </li>
          <li>
            <Link className="underline" href="/construction">
              Construction
            </Link>
          </li>
          <li>
            <Link className="underline" href="/automobile">
              Automobile
            </Link>
          </li>
          <li>
            <Link className="underline" href="/finance/loans">
              Loans
            </Link>
          </li>
        </ul>
      </section>
      <section>
        <HubSectionHeader title="FAQs" />
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <h3 className="font-semibold text-[#0b1f3a]">Do I need an account?</h3>
            <p>No. Published free templates can be filled and downloaded without registration.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0b1f3a]">Are these government certificates?</h3>
            <p>No. Varnarc does not issue identity documents, seals, or official certificates.</p>
          </div>
        </div>
      </section>
    </ModuleHubShell>
  );
}

function TemplateRow({ title, items }: { title: string; items: Card[] }) {
  if (!items.length) return null;
  return (
    <section>
      <HubSectionHeader title={title} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/documents/${item.slug}`}
              className="block rounded-lg border border-slate-200 p-4 hover:border-slate-400"
            >
              <span className="font-semibold text-[#0b1f3a]">{item.name}</span>
              <span className="mt-1 block text-sm text-slate-600">{item.shortDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
