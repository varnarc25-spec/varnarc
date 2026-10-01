import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/content-layout';
import { AiUtilitiesPanel } from '@/components/ai-tools/ai-utilities-panel';
import { aiCategoryCopy } from '@/lib/editorial-copy';

const utilitiesCopy = aiCategoryCopy('utilities', 'Utilities');

export const metadata: Metadata = {
  title: utilitiesCopy.title,
  description: utilitiesCopy.description,
  alternates: { canonical: '/ai-tools/utilities' },
  robots: { index: true, follow: true },
};

export default function AiToolsUtilitiesPage() {
  return (
    <ContentLayout
      title={utilitiesCopy.title}
      description={utilitiesCopy.intro}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'AI Tools', href: '/ai-tools' },
        { label: 'Utilities' },
      ]}
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/ai-tools" className="text-[var(--varnarc-brand)] hover:underline">
          ← AI Tools home
        </Link>
        <Link href="/ai-tools/compare" className="text-[var(--varnarc-brand)] hover:underline">
          Compare tools
        </Link>
      </div>
      <AiUtilitiesPanel />
    </ContentLayout>
  );
}
