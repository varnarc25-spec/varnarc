declare global {
  interface Window {
    __VARNARC_PUBLIC_ENV__?: {
      apiUrl?: string;
      appUrl?: string;
    };
  }
}

/** Docker DNS names the public browser cannot resolve. */
const PRIVATE_API_HOSTS = new Set([
  'api',
  'web',
  'admin',
  'redis',
  'postgres',
  'db',
  'host.docker.internal',
]);

export function isBrowserReachableApiUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  if (PRIVATE_API_HOSTS.has(host)) return false;
  if (!host.includes('.') && host !== 'localhost' && host !== '127.0.0.1') return false;
  return true;
}

/**
 * URL safe to hand to the browser.
 * A public runtime API_URL (Cloud Run) wins. An internal Docker host such as
 * http://api:4000 is skipped in favour of NEXT_PUBLIC_API_URL.
 */
export function resolveBrowserApiUrl(
  env: { API_URL?: string; NEXT_PUBLIC_API_URL?: string } = process.env,
): string | undefined {
  const runtime = env.API_URL?.trim();
  if (runtime && isBrowserReachableApiUrl(runtime)) return runtime.replace(/\/$/, '');
  const pub = env.NEXT_PUBLIC_API_URL?.trim();
  if (pub && isBrowserReachableApiUrl(pub)) return pub.replace(/\/$/, '');
  return undefined;
}

/** Inline script for layout — exposes a browser-reachable API URL. */
export function getRuntimePublicEnvScript(): string | null {
  const apiUrl = resolveBrowserApiUrl();
  const appUrl = process.env.APP_BASE_URL?.trim();
  if (!apiUrl && !appUrl) return null;
  const payload = JSON.stringify({ apiUrl, appUrl });
  return `window.__VARNARC_PUBLIC_ENV__=${payload};`;
}

/** API base URL. Server keeps API_URL; the browser never uses a Docker-only host. */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const injected = window.__VARNARC_PUBLIC_ENV__?.apiUrl?.trim();
    if (injected && isBrowserReachableApiUrl(injected)) return injected.replace(/\/$/, '');
    const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (pub && isBrowserReachableApiUrl(pub)) return pub.replace(/\/$/, '');
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:4000/api/v1';
    return `${window.location.origin}/api/v1`;
  }
  const fromEnv = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) {
    const cleaned = fromEnv.replace(/\/$/, '');
    const appUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
    const localApp = /localhost|127\.0\.0\.1/.test(appUrl);
    if (localApp && /api\.varnarc\.com/i.test(cleaned)) {
      return 'http://localhost:4000/api/v1';
    }
    return cleaned;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.varnarc.com/api/v1';
  }
  return 'http://localhost:4000/api/v1';
}
