import { notFound } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { TemplateEditor } from '../template-editor';

export default async function EditDocumentTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await apiServerFetch<Parameters<typeof TemplateEditor>[0]['template']>(
    `/documents/admin/templates/${id}`,
  );
  if (!result.data) notFound();
  return (
    <div>
      <PageHeader
        title={result.data.name}
        description={`${result.data.status} · ${result.data.slug}`}
      />
      <TemplateEditor template={result.data} />
    </div>
  );
}
