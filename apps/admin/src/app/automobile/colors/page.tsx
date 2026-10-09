import Link from 'next/link';
import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { AutomobileColorsManager, type ColorRow } from '@/components/automobile-colors-manager';
import { apiServerFetch } from '@/lib/api';

export default async function AutomobileColorsPage() {
  const result = await apiServerFetch<ColorRow[]>('/automobile/admin/colors');
  const colors = Array.isArray(result.data) ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Colors"
        description="One catalogue of paint colors. Cars pick from this list, and a color added on a car is stored here too."
        actions={
          <div className="flex items-center gap-3">
            <Badge>{colors.length} colors</Badge>
            <Link
              href="/automobile/vehicles"
              className="text-sm text-[var(--varnarc-brand)] hover:underline"
            >
              Vehicles
            </Link>
          </div>
        }
      />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load colors</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <AutomobileColorsManager colors={colors} />
      )}
    </div>
  );
}
