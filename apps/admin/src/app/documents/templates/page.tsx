import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';

type Row = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category?: { name: string } | null;
};

export default async function DocumentTemplatesPage() {
  const result = await apiServerFetch<Row[]>('/documents/admin/templates?limit=100');
  const rows = result.data ?? [];
  return (
    <div>
      <PageHeader
        title="Document templates"
        description="Draft, review, and publish generators."
        actions={
          <Link
            className="text-sm text-[var(--varnarc-brand)] hover:underline"
            href="/documents/templates/new"
          >
            New template
          </Link>
        }
      />
      {result.error ? <p className="text-sm text-red-700">{result.error}</p> : null}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2">Name</th>
            <th>Status</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="py-2">
                <Link className="underline" href={`/documents/templates/${row.id}`}>
                  {row.name}
                </Link>
              </td>
              <td>{row.status}</td>
              <td>{row.category?.name ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
