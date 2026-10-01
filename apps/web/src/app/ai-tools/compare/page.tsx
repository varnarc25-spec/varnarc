import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/content-layout';
import { AiCompareWidget } from '@/components/ai-tools/ai-compare-widget';
import { type AiCompareResponse, type AiToolDetail } from '@/components/ai-tools/types';
import { apiPublicFetch } from '@/services/api-client';
import { aiCategoryCopy } from '@/lib/editorial-copy';

const compareCopy = aiCategoryCopy('compare', 'Compare');

export const metadata: Metadata = {
  title: compareCopy.title,
  description: compareCopy.description,
  alternates: { canonical: '/ai-tools/compare' },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ slugs?: string }>;
};

export default async function AiToolsComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const slugs = (params.slugs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let tools: AiToolDetail[] = [];
  if (slugs.length >= 2) {
    const result = await apiPublicFetch<AiCompareResponse>(
      `/ai-tools/compare?slugs=${encodeURIComponent(slugs.join(','))}`,
      { next: { revalidate: 60 } },
    ).catch(() => ({ data: { slugs, tools: [] } as AiCompareResponse }));
    tools = result.data?.tools ?? [];
  }

  return (
    <ContentLayout
      title={compareCopy.title}
      description={compareCopy.intro}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'AI Tools', href: '/ai-tools' },
        { label: 'Compare' },
      ]}
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/ai-tools" className="text-[var(--varnarc-brand)] hover:underline">
          ← AI Tools home
        </Link>
      </div>
      <AiCompareWidget initialSlugs={slugs} initialTools={tools} />
    </ContentLayout>
  );
}
