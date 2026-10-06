import { NextResponse } from 'next/server';
import { getApiAccessToken } from '@/lib/api';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function proxy(path: string, init: RequestInit) {
  const token = await getApiAccessToken();
  if (!token) {
    return NextResponse.json({ error: { message: 'Not authenticated' } }, { status: 401 });
  }
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const prefix = String(form.get('prefix') ?? '');
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: 'Choose a file to upload.' } }, { status: 400 });
  }
  const body = new FormData();
  body.set('prefix', prefix);
  body.set('file', file, file.name);
  return proxy('/media/storage/upload', { method: 'POST', body });
}
