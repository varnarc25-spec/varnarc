import { getApiBaseUrl } from '@/lib/runtime-public-env';

export type Auth0RuntimeConfig = {
  configured: boolean;
  source: 'database' | 'environment' | 'none';
  domain: string | null;
  clientId: string | null;
  clientSecret: string | null;
  secret: string | null;
  audience: string | null;
  issuerBaseUrl: string | null;
  connection: string | null;
};

let cached: { at: number; value: Auth0RuntimeConfig | null } = { at: 0, value: null };
const TTL_MS = 60_000;

function fromProcessEnv(): Auth0RuntimeConfig | null {
  const domain = process.env.AUTH0_DOMAIN?.trim() || '';
  const clientId =
    process.env.AUTH0_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim() || '';
  const secret = process.env.AUTH0_SECRET?.trim() || '';
  if (!domain || !clientId || !clientSecret || !secret) return null;
  return {
    configured: true,
    source: 'environment',
    domain,
    clientId,
    clientSecret,
    secret,
    audience: process.env.AUTH0_AUDIENCE?.trim() || null,
    issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL?.trim() || null,
    connection: process.env.AUTH0_CONNECTION?.trim() || 'Username-Password-Authentication',
  };
}

function applyToProcessEnv(config: Auth0RuntimeConfig) {
  if (!config.configured) return;
  if (config.domain) process.env.AUTH0_DOMAIN = config.domain;
  if (config.clientId) process.env.AUTH0_CLIENT_ID = config.clientId;
  if (config.clientSecret) process.env.AUTH0_CLIENT_SECRET = config.clientSecret;
  if (config.secret) process.env.AUTH0_SECRET = config.secret;
  if (config.audience) process.env.AUTH0_AUDIENCE = config.audience;
  if (config.issuerBaseUrl) process.env.AUTH0_ISSUER_BASE_URL = config.issuerBaseUrl;
  if (config.connection) process.env.AUTH0_CONNECTION = config.connection;
}

export async function resolveAuth0RuntimeConfig(): Promise<Auth0RuntimeConfig | null> {
  if (typeof window !== 'undefined') return fromProcessEnv();
  if (process.env.DOCKER_BUILD === '1') return fromProcessEnv();
  if (cached.value && Date.now() - cached.at < TTL_MS) return cached.value;

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/settings/auth0/runtime`, {
      cache: 'no-store',
      headers: { 'X-Varnarc-Internal': '1' },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: Auth0RuntimeConfig };
      const data = json.data;
      if (data?.configured) {
        applyToProcessEnv(data);
        cached = { at: Date.now(), value: data };
        return data;
      }
    }
  } catch {
    // API down — fall through to env
  }

  const fromEnv = fromProcessEnv();
  cached = { at: Date.now(), value: fromEnv };
  return fromEnv;
}
