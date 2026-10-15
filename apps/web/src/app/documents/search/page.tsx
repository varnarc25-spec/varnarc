import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { apiPublicFetch } from '@/services/api-client';

export const metadata: Metadata = {
  title: 'Search documents',
  robots: { index: false, follow: true },
  alternates: { canonical: '/documents/search' },
};

type Result = {
  query: string | null;
  items: Array<{ name: string; slug: string; shortDescription: string }>;
};

export default async function DocumentSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let result: Result = { query: null, items: [] };
  try {
    result = (await apiPublicFetch<Result>(`/documents/search?q=${encodeURIComponent(q ?? '')}`))
      .data;
  } catch {
    result = { query: q ?? null, items: [] };
  }
  return (
    <PageShell
      title="Search documents"
      description="Find a letter, receipt, or invoice format."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: 'Search' },
      ]}
    >
      <form className="mb-6 flex gap-2" action="/documents/search">
        <label className="sr-only" htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q ?? ''}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <button className="rounded-md bg-[#0b1f3a] px-4 py-2 text-sm text-white" type="submit">
          Search
        </button>
      </form>
      <ul className="space-y-3">
        {result.items.map((item) => (
          <li key={item.slug}>
            <Link
              className="font-semibold text-[#0b1f3a] underline"
              href={`/documents/${item.slug}`}
            >
              {item.name}
            </Link>
            <p className="text-sm text-slate-600">{item.shortDescription}</p>
          </li>
        ))}
      </ul>
      {!result.items.length ? (
        <p className="text-sm text-slate-600">No published templates matched.</p>
      ) : null}
    </PageShell>
  );
}
