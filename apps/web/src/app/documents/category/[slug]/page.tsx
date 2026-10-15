import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { ApiError, apiPublicFetch } from '@/services/api-client';

type Payload = {
  category: {
    name: string;
    slug: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    children: Array<{ name: string; slug: string }>;
  };
  templates: Array<{ name: string; slug: string; shortDescription: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apiPublicFetch<Payload>(`/documents/categories/${slug}`);
    return {
      title: data.category.seoTitle || data.category.name,
      description: data.category.seoDescription || data.category.description || undefined,
      alternates: { canonical: `/documents/category/${slug}` },
    };
  } catch {
    return { title: 'Documents' };
  }
}

export const revalidate = 60;

export default async function DocumentCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data: Payload;
  try {
    data = (await apiPublicFetch<Payload>(`/documents/categories/${slug}`)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return (
    <PageShell
      title={data.category.name}
      description={data.category.description ?? undefined}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documents', href: '/documents' },
        { label: data.category.name },
      ]}
    >
      {data.category.children?.length ? (
        <ul className="mb-6 flex flex-wrap gap-2 text-sm">
          {data.category.children.map((child) => (
            <li key={child.slug}>
              <Link
                className="rounded-full border border-slate-200 px-3 py-1"
                href={`/documents/category/${child.slug}`}
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.templates.map((template) => (
          <li key={template.slug}>
            <Link
              href={`/documents/${template.slug}`}
              className="block rounded-lg border border-slate-200 p-4"
            >
              <span className="font-semibold text-[#0b1f3a]">{template.name}</span>
              <span className="mt-1 block text-sm text-slate-600">{template.shortDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!data.templates.length ? (
        <p className="text-sm text-slate-600">No published templates in this category yet.</p>
      ) : null}
    </PageShell>
  );
}
