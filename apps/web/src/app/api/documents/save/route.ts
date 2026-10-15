import { NextResponse } from 'next/server';
import { apiServerFetch } from '@/lib/api';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await apiServerFetch('/documents/saved', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  if (result.error) {
    return NextResponse.json({ error: { message: result.error } }, { status: result.status });
  }
  return NextResponse.json({ data: result.data });
}
