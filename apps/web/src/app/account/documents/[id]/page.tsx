import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import type { DocumentBlock, DocumentField, RenderedBlock } from '@varnarc/validation';
import { PageShell } from '@/components/layout/page-shell';
import { DocumentGenerator } from '@/features/documents/document-generator';
import { DeleteSavedDocument } from '@/features/documents/delete-saved-document';
import { auth0 } from '@/lib/auth0';
import { apiServerFetch } from '@/lib/api';
import { apiPublicFetch } from '@/services/api-client';

export const metadata: Metadata = {
  title: 'Saved document',
  robots: { index: false, follow: false },
};

type Saved = {
  id: string;
  title: string;
  inputs: Record<string, unknown>;
  document: { title: string; blocks: RenderedBlock[] };
  template: { name: string; slug: string };
};

type Template = {
  fields: DocumentField[];
  blocks: DocumentBlock[];
  legalDisclaimer: string | null;
  shortDescription: string;
};

export default async function SavedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth0.getSession();
  if (!session?.user) redirect(`/auth/login?returnTo=/account/documents/${id}`);
  const saved = await apiServerFetch<Saved>(`/documents/saved/${id}`);
  if (!saved.data) notFound();
  const template = (
    await apiPublicFetch<Template>(`/documents/templates/slug/${saved.data.template.slug}`)
  ).data;
  return (
    <PageShell
      title={saved.data.title}
      description="Edit the saved answers and download again. The previous personal details are loaded only for you."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Saved documents', href: '/account/documents' },
        { label: saved.data.title },
      ]}
    >
      <DocumentGenerator
        slug={saved.data.template.slug}
        title={saved.data.document.title || saved.data.title}
        fields={template.fields}
        blocks={template.blocks}
        disclaimer={template.legalDisclaimer}
        canSave
        savedId={saved.data.id}
        initialValues={saved.data.inputs}
      />
      <DeleteSavedDocument id={saved.data.id} />
    </PageShell>
  );
}
