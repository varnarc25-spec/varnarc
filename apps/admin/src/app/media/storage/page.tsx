import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { GcsBrowser, type GcsListing } from '@/components/gcs-browser';

export default async function CloudStoragePage({
  searchParams,
}: {
  searchParams: Promise<{ prefix?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.prefix) qs.set('prefix', params.prefix);
  const result = await apiServerFetch<GcsListing>(`/media/storage${qs.size ? `?${qs}` : ''}`, {
    signal: AbortSignal.timeout(20_000),
  });

  return (
    <div>
      <PageHeader
        title="Cloud storage"
        description="Add, open, and delete files and folders in the configured Google Cloud Storage bucket."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/media" className="text-sm text-[var(--varnarc-brand)] hover:underline">
              Media library
            </Link>
            <Link
              href="/settings/gcs"
              className="text-sm text-[var(--varnarc-brand)] hover:underline"
            >
              Bucket settings
            </Link>
          </div>
        }
      />
      {result.error || !result.data ? (
        <p className="text-sm text-red-600">
          {result.error ?? 'Cloud storage is not configured.'}{' '}
          <Link href="/settings/gcs" className="underline">
            Check Cloud Storage settings
          </Link>
          .
        </p>
      ) : (
        <GcsBrowser listing={result.data} />
      )}
    </div>
  );
}
