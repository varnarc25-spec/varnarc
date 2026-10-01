import Link from 'next/link';
import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import {
  AutomobileManufacturerEditForm,
  AutomobileVersionHistory,
} from '@/components/automobile-forms';
import { apiServerFetch } from '@/lib/api';

type ManufacturerDetail = {
  id: string;
  name: string;
  slug: string;
  status: string;
  country?: string | null;
  foundedYear?: number | null;
  website?: string | null;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  logoMediaId?: string | null;
  featured?: boolean;
  availableInIndia?: boolean;
  indiaAvailabilityStatus?: string | null;
  indiaWebsite?: string | null;
  indiaVerifiedAt?: string | null;
  indiaVerificationNote?: string | null;
};

export default async function AutomobileManufacturerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await apiServerFetch<ManufacturerDetail>(`/automobile/manufacturers/${id}`);
  const manufacturer = result.data;

  return (
    <div>
      <PageHeader
        title="Edit manufacturer"
        description={manufacturer?.name ?? 'Manufacturer'}
        actions={
          <Link
            href="/automobile/manufacturers"
            className="text-sm text-[var(--varnarc-brand)] hover:underline"
          >
            ← Back to manufacturers
          </Link>
        }
      />

      {result.error || !manufacturer ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load manufacturer</CardTitle>
            <CardDescription>{result.error || 'Not found'}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Badge className="mb-4">{manufacturer.status}</Badge>
          <AutomobileManufacturerEditForm
            id={manufacturer.id}
            initial={{
              name: manufacturer.name,
              slug: manufacturer.slug,
              country: manufacturer.country,
              foundedYear: manufacturer.foundedYear,
              website: manufacturer.website,
              tagline: manufacturer.tagline,
              description: manufacturer.description,
              logoUrl: manufacturer.logoUrl,
              logoMediaId: manufacturer.logoMediaId,
              featured: manufacturer.featured,
              availableInIndia: manufacturer.availableInIndia,
              indiaAvailabilityStatus: manufacturer.indiaAvailabilityStatus,
              indiaWebsite: manufacturer.indiaWebsite,
              indiaVerifiedDate: manufacturer.indiaVerifiedAt
                ? manufacturer.indiaVerifiedAt.slice(0, 10)
                : '',
              indiaVerificationNote: manufacturer.indiaVerificationNote,
            }}
          />
          <AutomobileVersionHistory entity="automobile_manufacturer" entityId={manufacturer.id} />
        </>
      )}
    </div>
  );
}
