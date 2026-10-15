import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/page-shell';
import { TemplateList } from '../popular/page';
import { apiPublicFetch } from '@/services/api-client';

export const metadata: Metadata = {
  title: 'Latest document templates',
  description: 'Recently published document templates on Varnarc.',
  alternates: { canonical: '/documents/latest' },
};

export const revalidate = 60;

export default async function LatestDocumentsPage() {
  let items: Array<{ name: string; slug: string; shortDescription: string }> = [];
  try {
    items = (await apiPublicFetch<typeof items>('/documents/latest')).data;
  } catch {
    items = [];
  }
  return (
    <PageShell
      title="Latest documents"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: 'Latest' },
      ]}
    >
      <TemplateList items={items} />
    </PageShell>
  );
}
