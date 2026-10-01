import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { ResaleConfigForm, ResaleConfigRowActions } from '@/components/resale-valuation-admin';
import { apiServerFetch } from '@/lib/api';

type ConfigRow = {
  id: string;
  type: string;
  key: string;
  value: number | string;
  segment?: string | null;
  fuelType?: string | null;
  isActive?: boolean;
  sourceName?: string | null;
  notes?: string | null;
};

export default async function ResaleValuationAdminPage() {
  const result = await apiServerFetch<ConfigRow[]>('/automobile/resale-valuation/admin/config');
  const rows = Array.isArray(result.data) ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Resale valuation factors"
        description="Overrides for the car resale calculator. Built-in fallback rates apply when no active row exists."
        actions={<Badge>{rows.length} factors</Badge>}
      />
      <ResaleConfigForm />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load factors</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4"
            >
              <div>
                <p className="font-medium">
                  {row.type} · {row.key}
                </p>
                <p className="mt-1 text-sm text-[var(--varnarc-subtle)]">
                  Value {String(row.value)}
                  {row.segment ? ` · segment ${row.segment}` : ''}
                  {row.fuelType ? ` · fuel ${row.fuelType}` : ''}
                  {row.isActive === false ? ' · inactive' : ''}
                </p>
                {row.sourceName ? (
                  <p className="mt-1 text-xs text-[var(--varnarc-subtle)]">
                    Source: {row.sourceName}
                  </p>
                ) : null}
                {row.notes ? <p className="mt-1 text-xs">{row.notes}</p> : null}
              </div>
              <ResaleConfigRowActions id={row.id} />
            </div>
          ))}
          {!rows.length ? (
            <p className="py-8 text-center text-[var(--varnarc-subtle)]">
              No overrides yet. The calculator is using its documented fallback curve.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
