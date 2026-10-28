import { Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiServerFetch } from '@/lib/api';

type ReportFile = {
  id: string;
  title: string;
  pageHeading: string;
  stateName: string | null;
  pdfUrl: string | null;
  pdfSize: string | null;
  xlsxUrl: string | null;
  xlsxSize: string | null;
};

type ReportDetail = {
  id: string;
  sectionLabel: string;
  label: string;
  stateName: string | null;
  pageHeading: string | null;
  url: string | null;
  files: ReportFile[];
};

export default async function ElectionReportFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await apiServerFetch<ReportDetail>(`/election-reports/${id}`);
  if (result.status === 404) notFound();
  const report = result.data;

  return (
    <div>
      <PageHeader
        title={report?.pageHeading || report?.label || 'Statistical report'}
        description={
          report
            ? `${report.sectionLabel}${report.stateName ? ` · ${report.stateName}` : ''}`
            : 'Files listed on this Election Commission page.'
        }
        actions={
          <Link
            href="/elections/statistical-reports"
            className="text-sm text-[var(--varnarc-brand)] hover:underline"
          >
            All reports
          </Link>
        }
      />
      {result.error || !report ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load files</CardTitle>
            <CardDescription>{result.error || 'Report not found.'}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
              <tr>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">PDF</th>
                <th className="px-4 py-3 font-medium">Spreadsheet</th>
              </tr>
            </thead>
            <tbody>
              {report.files.map((file) => (
                <tr key={file.id} className="border-b border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">{file.stateName ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{file.title}</td>
                  <td className="px-4 py-3">
                    {file.pdfUrl ? (
                      <a
                        href={file.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--varnarc-brand)] hover:underline"
                      >
                        PDF{file.pdfSize ? ` · ${file.pdfSize}` : ''}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {file.xlsxUrl ? (
                      <a
                        href={file.xlsxUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--varnarc-brand)] hover:underline"
                      >
                        XLSX{file.xlsxSize ? ` · ${file.xlsxSize}` : ''}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {!report.files.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--varnarc-subtle)]">
                    This page has no file list yet.
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
