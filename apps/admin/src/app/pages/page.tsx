import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import Link from 'next/link';
import { apiServerFetch } from '@/lib/api';
import { PageCreateForm } from '@/components/page-create-form';

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  metadata?: { kind?: string; path?: string } | null;
};

function publicPath(page: PageRow) {
  if (page.metadata?.kind === 'site' && page.metadata.path) return page.metadata.path;
  return `/p/${page.slug}`;
}

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const pages: PageRow[] = [];
  let error: string | null = null;
  let cursor: string | null = null;
  for (let page = 0; page < 8; page += 1) {
    const qs = new URLSearchParams({ limit: '100' });
    if (params.status) qs.set('status', params.status);
    if (params.search) qs.set('search', params.search);
    if (cursor) qs.set('cursor', cursor);
    const result = await apiServerFetch<PageRow[]>(`/pages?${qs.toString()}`);
    if (result.error) {
      error = result.error;
      break;
    }
    pages.push(...(Array.isArray(result.data) ? result.data : []));
    const next = result.meta?.nextCursor;
    if (typeof next !== 'string' || !next) break;
    cursor = next;
  }

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Every website page is listed here. New pages you create are added to this list, and new site routes appear after the next deploy."
        actions={<Badge>{pages.length} loaded</Badge>}
      />

      <PageCreateForm />

      <form className="mb-6 flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={params.search || ''}
          placeholder="Search pages…"
          className="h-10 w-full max-w-md rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status || ''}
          className="h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Review</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load pages</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/pages/${page.id}`}
                      className="font-medium text-[var(--varnarc-brand)] hover:underline"
                    >
                      {page.title}
                    </Link>
                    <div className="text-xs text-[var(--varnarc-subtle)]">{publicPath(page)}</div>
                  </td>
                  <td className="px-4 py-3">{page.status}</td>
                  <td className="px-4 py-3 text-[var(--varnarc-subtle)]">
                    {new Date(page.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!pages.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--varnarc-subtle)]">
                    No pages yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
