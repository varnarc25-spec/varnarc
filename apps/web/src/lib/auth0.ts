import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';
import { getAuth0ClientOptions } from '@varnarc/auth';
import { resolveAuth0RuntimeConfig } from '@/lib/auth0-config';

function createAuth0Client() {
  return new Auth0Client({
    ...getAuth0ClientOptions(),
    authorizationParameters: {
      scope: 'openid profile email',
      connection: process.env.AUTH0_CONNECTION?.trim() || 'Username-Password-Authentication',
      ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
    },
  });
}

let client: Auth0Client | undefined;

async function configuredClient(): Promise<Auth0Client | null> {
  const config = await resolveAuth0RuntimeConfig();
  if (!config?.configured) return null;
  client ??= createAuth0Client();
  return client;
}

/**
 * Next.js prerender imports this module. Construct Auth0Client only after
 * settings (database) or env credentials are available.
 */
export const auth0 = new Proxy({} as Auth0Client, {
  get(_target, prop) {
    if (prop === 'getSession') {
      return async (...args: unknown[]) => {
        const real = await configuredClient();
        if (!real) return null;
        return (real.getSession as (...a: unknown[]) => unknown)(...args);
      };
    }
    if (prop === 'middleware') {
      return async (request: Parameters<Auth0Client['middleware']>[0]) => {
        const real = await configuredClient();
        if (!real) return NextResponse.next();
        return real.middleware(request);
      };
    }
    if (prop === 'getAccessToken') {
      return async (...args: unknown[]) => {
        const real = await configuredClient();
        if (!real) return { token: undefined };
        return (real.getAccessToken as (...a: unknown[]) => unknown)(...args);
      };
    }
    return undefined;
  },
});
