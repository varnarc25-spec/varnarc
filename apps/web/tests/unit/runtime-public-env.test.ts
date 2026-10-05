import { afterEach, describe, expect, it } from 'vitest';
import {
  getRuntimePublicEnvScript,
  isBrowserReachableApiUrl,
  resolveBrowserApiUrl,
} from '@/lib/runtime-public-env';

const KEYS = ['API_URL', 'NEXT_PUBLIC_API_URL', 'APP_BASE_URL'] as const;
const previous: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

afterEach(() => {
  for (const key of KEYS) {
    if (!(key in previous)) continue;
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
    delete previous[key];
  }
});

function setEnv(values: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
  for (const key of KEYS) {
    if (!(key in previous)) previous[key] = process.env[key];
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe('browser API URL', () => {
  it('rejects the Docker-only API host', () => {
    expect(isBrowserReachableApiUrl('http://api:4000/api/v1')).toBe(false);
    expect(isBrowserReachableApiUrl('http://host.docker.internal:4000/api/v1')).toBe(false);
  });

  it('keeps localhost and the public site API', () => {
    expect(isBrowserReachableApiUrl('http://localhost:4000/api/v1')).toBe(true);
    expect(isBrowserReachableApiUrl('https://varnarc.com/api/v1')).toBe(true);
  });

  it('prefers a public runtime URL, then the public build URL', () => {
    expect(
      resolveBrowserApiUrl({
        API_URL: 'https://api.varnarc.com/api/v1',
        NEXT_PUBLIC_API_URL: 'https://varnarc.com/api/v1',
      }),
    ).toBe('https://api.varnarc.com/api/v1');
    expect(
      resolveBrowserApiUrl({
        API_URL: 'http://api:4000/api/v1',
        NEXT_PUBLIC_API_URL: 'https://varnarc.com/api/v1',
      }),
    ).toBe('https://varnarc.com/api/v1');
  });

  it('does not publish the Docker API host in the page script', () => {
    setEnv({
      API_URL: 'http://api:4000/api/v1',
      NEXT_PUBLIC_API_URL: 'https://varnarc.com/api/v1',
      APP_BASE_URL: 'https://varnarc.com',
    });
    const script = getRuntimePublicEnvScript();
    expect(script).toContain('https://varnarc.com/api/v1');
    expect(script).not.toContain('http://api:4000');
  });
});
