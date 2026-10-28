import { NextResponse } from 'next/server';
import { getApiAccessToken } from '@/lib/api';

const apiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type Params = { params: Promise<{ id: string }> };

async function proxy(request: Request, id: string, method: string) {
  const token = await getApiAccessToken();
  if (!token)
    return NextResponse.json({ error: { message: 'Not authenticated' } }, { status: 401 });
  const res = await fetch(`${apiUrl}/calculators/solar/references/${id}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: method === 'DELETE' ? undefined : await request.text(),
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return proxy(request, id, 'PUT');
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return proxy(request, id, 'DELETE');
}
