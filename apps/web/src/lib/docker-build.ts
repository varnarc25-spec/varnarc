export function isDockerBuild(): boolean {
  return process.env.DOCKER_BUILD === '1';
}

/** Avoid prerendering hundreds of landings inside the image (no API). */
export function staticParamsOutsideDocker<T>(params: T[]): T[] {
  return isDockerBuild() ? [] : params;
}

/** Network I/O during `next build` inside Docker has no API and hangs page generation. */
export async function fetchIfNotDocker(
  url: string,
  init: RequestInit = {},
): Promise<Response | null> {
  if (isDockerBuild()) return null;
  return fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(8_000),
  });
}
