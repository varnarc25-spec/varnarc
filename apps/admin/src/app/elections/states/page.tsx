import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import Link from 'next/link';
import { apiServerFetch } from '@/lib/api';

type ElectionState = {
  id: string;
  name: string;
  slug: string;
  reportCount: number;
  fileCount: number;
};

export default async function ElectionStatesPage() {
  const result = await apiServerFetch<ElectionState[]>('/election-reports/states');
  const rows = Array.isArray(result.data) ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Election states"
        description="States named in statistical-report headings and file titles."
        actions={<Badge>{rows.length} states</Badge>}
      />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load states</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
              <tr>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Reports</th>
                <th className="px-4 py-3 font-medium">Files</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--varnarc-border)]">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/elections/statistical-reports?jurisdiction=${encodeURIComponent(row.name)}`}
                      className="hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.reportCount}</td>
                  <td className="px-4 py-3">{row.fileCount}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--varnarc-subtle)]">
                    No states stored yet.
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
