import { proxyHr } from '@/lib/hr-proxy';

type Params = { params: Promise<{ path: string[] }> };

async function forward(request: Request, params: Params['params'], method: string) {
  const { path } = await params;
  const target = `/hr/${path.join('/')}`;
  if (method === 'GET' || method === 'DELETE') {
    return proxyHr(target, method);
  }
  const body = await request.json();
  return proxyHr(target, method, body);
}

export async function GET(_request: Request, { params }: Params) {
  return forward(_request, params, 'GET');
}

export async function POST(request: Request, { params }: Params) {
  return forward(request, params, 'POST');
}

export async function PUT(request: Request, { params }: Params) {
  return forward(request, params, 'PUT');
}

export async function DELETE(_request: Request, { params }: Params) {
  return forward(_request, params, 'DELETE');
}
