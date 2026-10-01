import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { AutomobileCsvToolbar } from '@/components/automobile-admin-toolbar';
import { AutomobileManufacturerForm } from '@/components/automobile-forms';
import {
  AutomobileManufacturersDataTable,
  type ManufacturerTableRow,
} from '@/components/automobile-manufacturers-data-table';
import { apiServerFetch } from '@/lib/api';

async function loadManufacturers() {
  const all = await apiServerFetch<ManufacturerTableRow[]>('/automobile/admin/manufacturers/all');
  if (!all.error && Array.isArray(all.data)) return all;

  const rows: ManufacturerTableRow[] = [];
  let cursor: string | null = null;
  let error: string | null = null;
  for (let page = 0; page < 20; page += 1) {
    const qs = new URLSearchParams({ limit: '100' });
    if (cursor) qs.set('cursor', cursor);
    const result = await apiServerFetch<ManufacturerTableRow[]>(
      `/automobile/admin/manufacturers?${qs.toString()}`,
    );
    if (result.error) {
      error = rows.length ? null : result.error;
      break;
    }
    const batch = Array.isArray(result.data) ? result.data : [];
    rows.push(...batch);
    const next = result.meta?.nextCursor;
    if (!next || typeof next !== 'string' || batch.length === 0) break;
    cursor = next;
  }
  const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
  return { data: unique, error, status: error ? 500 : 200 };
}

export default async function AutomobileManufacturersAdminPage() {
  const result = await loadManufacturers();
  const rows = Array.isArray(result.data) ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Manufacturers"
        description="Search, sort, and page every automobile brand."
        actions={<Badge>{rows.length} manufacturers</Badge>}
      />

      <AutomobileCsvToolbar entity="manufacturers" />
      <AutomobileManufacturerForm />

      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load manufacturers</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <AutomobileManufacturersDataTable rows={rows} />
      )}
    </div>
  );
}
