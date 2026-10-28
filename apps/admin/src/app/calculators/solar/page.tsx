import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { SolarReferenceEditor, type SolarAdminRow } from '@/components/solar-reference-editor';

export default async function SolarReferencesPage() {
  const result = await apiServerFetch<SolarAdminRow[]>('/calculators/solar/references');
  const rows = Array.isArray(result.data) ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Solar calculator data"
        description="Location yield, tariffs, installation prices, subsidies, and defaults. Only published rows are used on the public calculator. Draft rows are illustrative until you add a source and publish them."
        actions={
          <Link href="/calculators" className="text-sm text-[var(--varnarc-brand)] hover:underline">
            Back to calculators
          </Link>
        }
      />
      <SolarReferenceEditor initial={rows} />
    </div>
  );
}
