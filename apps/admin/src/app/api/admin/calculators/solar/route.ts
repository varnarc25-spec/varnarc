import { NextResponse } from 'next/server';
import { getApiAccessToken } from '@/lib/api';

const apiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function proxy(request: Request, path: string, method: string) {
  const token = await getApiAccessToken();
  if (!token)
    return NextResponse.json({ error: { message: 'Not authenticated' } }, { status: 401 });
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: method === 'GET' ? undefined : await request.text(),
    cache: 'no-store',
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}

export function GET(request: Request) {
  return proxy(request, '/calculators/solar/references', 'GET');
}

export function POST(request: Request) {
  return proxy(request, '/calculators/solar/references', 'POST');
}
