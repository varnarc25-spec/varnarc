import { proxyAdminApi } from '@/lib/admin-api-proxy';

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const target = `/documents/admin/${path.join('/')}${url.search}`;
  const body =
    request.method === 'GET' || request.method === 'DELETE' ? undefined : await request.text();
  return proxyAdminApi(target, { method: request.method, body });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
