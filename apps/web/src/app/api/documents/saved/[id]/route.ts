import { NextResponse } from 'next/server';
import { apiServerFetch } from '@/lib/api';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = await apiServerFetch(`/documents/saved/${id}`, { method: 'DELETE' });
  if (result.error)
    return NextResponse.json({ error: { message: result.error } }, { status: result.status });
  return NextResponse.json({ data: result.data });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await apiServerFetch(`/documents/saved/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (result.error)
    return NextResponse.json({ error: { message: result.error } }, { status: result.status });
  return NextResponse.json({ data: result.data });
}
