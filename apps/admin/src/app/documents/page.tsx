import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Dashboard = {
  total: number;
  published: number;
  draft: number;
  reviewRequired: number;
  generations: number;
  downloads: number;
  popular: Array<{ id: string; name: string; slug: string; downloadCount: number }>;
  reviewQueue: Array<{ id: string; name: string; slug: string }>;
};

export default async function DocumentsAdminPage() {
  const result = await apiServerFetch<Dashboard>('/documents/admin/dashboard');
  const data = result.data;
  return (
    <div>
      <PageHeader
        title="Documents"
        description="Templates, categories, and download activity."
        actions={
          <div className="flex gap-3 text-sm">
            <Link
              className="text-[var(--varnarc-brand)] hover:underline"
              href="/documents/templates"
            >
              Templates
            </Link>
            <Link
              className="text-[var(--varnarc-brand)] hover:underline"
              href="/documents/categories"
            >
              Categories
            </Link>
          </div>
        }
      />
      {result.error ? <p className="text-sm text-red-700">{result.error}</p> : null}
      {data ? (
        <div className="space-y-6">
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ['Templates', data.total],
              ['Published', data.published],
              ['Drafts', data.draft],
              ['Needs review', data.reviewRequired],
              ['Generations', data.generations],
              ['Downloads', data.downloads],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 p-4">
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <section>
            <h2 className="mb-2 font-semibold">Most downloaded</h2>
            <ul className="text-sm">
              {data.popular.map((item) => (
                <li key={item.id}>
                  <Link className="underline" href={`/documents/templates/${item.id}`}>
                    {item.name}
                  </Link>{' '}
                  · {item.downloadCount}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Awaiting review</h2>
            <ul className="text-sm">
              {data.reviewQueue.map((item) => (
                <li key={item.id}>
                  <Link className="underline" href={`/documents/templates/${item.id}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
