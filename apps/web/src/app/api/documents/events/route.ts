import { NextResponse } from 'next/server';

const apiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const response = await fetch(`${apiUrl}/documents/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const json = await response.json().catch(() => ({}));
  return NextResponse.json(json, { status: response.status });
}
