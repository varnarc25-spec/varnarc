import { isDockerBuild } from '@/lib/docker-build';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const cache = new Map<string, { value: boolean; expires: number }>();

export async function isFeatureEnabled(key: string): Promise<boolean> {
  if (isDockerBuild()) return false;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value;

  try {
    const res = await fetch(`${apiUrl}/settings/feature-flags/${encodeURIComponent(key)}/enabled`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8_000),
    });
    const json = (await res.json()) as { data?: { enabled?: boolean } };
    const enabled = Boolean(json.data?.enabled);
    cache.set(key, { value: enabled, expires: now + 60_000 });
    return enabled;
  } catch {
    return hit?.value ?? false;
  }
}
