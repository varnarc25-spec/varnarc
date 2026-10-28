import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import Link from 'next/link';
import { apiServerFetch } from '@/lib/api';

type ReportRow = {
  id: string;
  section: string;
  sectionLabel: string;
  jurisdiction: string | null;
  stateName: string | null;
  label: string;
  url: string | null;
  hasFile: boolean;
  sourceUrl: string;
  fileCount: number;
};

type SectionFacet = {
  section: string;
  label: string;
  count: number;
};

type ReportMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  pageCount?: number;
  sections?: SectionFacet[];
  jurisdictions?: string[];
};

const inputClass =
  'h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm';

function queryString(params: {
  section?: string;
  jurisdiction?: string;
  search?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params.section) qs.set('section', params.section);
  if (params.jurisdiction) qs.set('jurisdiction', params.jurisdiction);
  if (params.search) qs.set('search', params.search);
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  const value = qs.toString();
  return value ? `?${value}` : '';
}

export default async function ElectionStatisticalReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
    jurisdiction?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const qs = new URLSearchParams({ page: String(page), pageSize: '50' });
  if (params.section) qs.set('section', params.section);
  if (params.jurisdiction) qs.set('jurisdiction', params.jurisdiction);
  if (params.search) qs.set('search', params.search);

  const result = await apiServerFetch<ReportRow[]>(`/election-reports?${qs.toString()}`);
  const rows = Array.isArray(result.data) ? result.data : [];
  const meta = (result.meta ?? {}) as ReportMeta;
  const sections = meta.sections ?? [];
  const jurisdictions = meta.jurisdictions ?? [];
  const total = meta.total ?? rows.length;
  const pageCount = meta.pageCount ?? 1;
  const sourceUrl = rows[0]?.sourceUrl ?? 'https://www.eci.gov.in/statistical-reports';
  const filters = {
    section: params.section,
    jurisdiction: params.jurisdiction,
    search: params.search,
  };

  return (
    <div>
      <PageHeader
        title="Election statistical reports"
        description="Official Election Commission of India statistical reports, stored from the public catalog."
        actions={<Badge>{total} reports</Badge>}
      />

      <p className="mb-6 text-sm text-[var(--varnarc-subtle)]">
        Source:{' '}
        <a
          href={sourceUrl}
          className="text-[var(--varnarc-brand)] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {sourceUrl}
        </a>
      </p>

      <form className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--varnarc-subtle)]">
          Election
          <select name="section" defaultValue={params.section ?? ''} className={inputClass}>
            <option value="">All elections</option>
            {sections.map((section) => (
              <option key={section.section} value={section.section}>
                {section.label} ({section.count})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--varnarc-subtle)]">
          State
          <select
            name="jurisdiction"
            defaultValue={params.jurisdiction ?? ''}
            className={inputClass}
          >
            <option value="">All states</option>
            {jurisdictions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs text-[var(--varnarc-subtle)]">
          Search
          <input
            name="search"
            defaultValue={params.search ?? ''}
            placeholder="Year, state, or URL"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load reports</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Election</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Report</th>
                  <th className="px-4 py-3 font-medium">Files</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--varnarc-border)]">
                    <td className="px-4 py-3">{row.sectionLabel}</td>
                    <td className="px-4 py-3">{row.stateName ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/elections/statistical-reports/${row.id}`}
                        className="hover:underline"
                      >
                        {row.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/elections/statistical-reports/${row.id}`}
                        className="text-[var(--varnarc-brand)] hover:underline"
                      >
                        {row.fileCount}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {row.url ? (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--varnarc-brand)] hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-[var(--varnarc-subtle)]">No file on ECI page</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--varnarc-subtle)]">
                      No reports match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {pageCount > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[var(--varnarc-subtle)]">
                Page {page} of {pageCount}
              </span>
              <div className="flex gap-3">
                {page > 1 ? (
                  <Link
                    href={`/elections/statistical-reports${queryString({ ...filters, page: page - 1 })}`}
                    className="text-[var(--varnarc-brand)] hover:underline"
                  >
                    Previous
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/elections/statistical-reports${queryString({ ...filters, page: page + 1 })}`}
                    className="text-[var(--varnarc-brand)] hover:underline"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
