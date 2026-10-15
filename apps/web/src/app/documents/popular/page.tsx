import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { apiPublicFetch } from '@/services/api-client';

export const metadata: Metadata = {
  title: 'Popular document templates',
  description: 'The document templates people download most often on Varnarc.',
  alternates: { canonical: '/documents/popular' },
};

export const revalidate = 60;

export default async function PopularDocumentsPage() {
  let items: Array<{ name: string; slug: string; shortDescription: string }> = [];
  try {
    items = (await apiPublicFetch<typeof items>('/documents/popular')).data;
  } catch {
    items = [];
  }
  return (
    <PageShell
      title="Popular documents"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: 'Popular' },
      ]}
    >
      <TemplateList items={items} />
    </PageShell>
  );
}

export function TemplateList({
  items,
}: {
  items: Array<{ name: string; slug: string; shortDescription: string }>;
}) {
  if (!items.length) return <p className="text-sm text-slate-600">No published templates yet.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/documents/${item.slug}`}
            className="block rounded-lg border border-slate-200 p-4"
          >
            <span className="font-semibold text-[#0b1f3a]">{item.name}</span>
            <span className="mt-1 block text-sm text-slate-600">{item.shortDescription}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
