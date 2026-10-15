import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { auth0 } from '@/lib/auth0';
import { apiServerFetch } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Saved documents',
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  title: string;
  updatedAt: string;
  template: { name: string; slug: string };
};

export default async function AccountDocumentsPage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect('/auth/login?returnTo=/account/documents');
  const result = await apiServerFetch<Row[]>('/documents/saved');
  const rows = Array.isArray(result.data) ? result.data : [];
  return (
    <PageShell
      title="Your documents"
      description="Documents you saved while signed in."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: 'Saved' },
      ]}
    >
      {result.error ? <p className="mb-4 text-sm text-red-700">{result.error}</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              className="font-semibold text-[#0b1f3a] underline"
              href={`/account/documents/${row.id}`}
            >
              {row.title}
            </Link>
            <p className="text-sm text-slate-600">{row.template?.name}</p>
          </li>
        ))}
      </ul>
      {!rows.length ? (
        <p className="text-sm text-slate-600">You have not saved a document yet.</p>
      ) : null}
    </PageShell>
  );
}
