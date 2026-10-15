import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { DocumentBlock, DocumentField } from '@varnarc/validation';
import { PageShell } from '@/components/layout/page-shell';
import { DocumentGenerator } from '@/features/documents/document-generator';
import { ApiError, apiPublicFetch } from '@/services/api-client';
import { auth0 } from '@/lib/auth0';

export const metadata: Metadata = {
  title: 'Create document',
  robots: { index: false, follow: false },
};

type Template = {
  name: string;
  slug: string;
  shortDescription: string;
  legalDisclaimer: string | null;
  fields: DocumentField[];
  blocks: DocumentBlock[];
  category: { name: string; slug: string };
};

export default async function CreateDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data: Template;
  try {
    data = (await apiPublicFetch<Template>(`/documents/templates/slug/${slug}`)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  let canSave = false;
  try {
    canSave = Boolean((await auth0.getSession())?.user);
  } catch {
    canSave = false;
  }
  return (
    <PageShell
      title={`Create ${data.name}`}
      description={data.shortDescription}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: data.name, href: `/documents/${data.slug}` },
        { label: 'Create' },
      ]}
    >
      <p className="mb-4 text-sm text-slate-600">
        Your entries stay in this browser until you download or, if you are signed in, save them. Do
        not type identity numbers.
      </p>
      <DocumentGenerator
        slug={data.slug}
        title={data.name}
        fields={data.fields}
        blocks={data.blocks}
        disclaimer={data.legalDisclaimer}
        canSave={canSave}
      />
    </PageShell>
  );
}
