import { NextResponse } from 'next/server';

const apiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function allowed(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!allowed(request)) {
    return NextResponse.json(
      { error: { message: 'Cross-site request blocked.' } },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    slug?: string;
    format?: string;
    inputs?: unknown;
    blank?: boolean;
  };
  if (!body.slug) {
    return NextResponse.json({ error: { message: 'Choose a template.' } }, { status: 400 });
  }
  const response = await fetch(`${apiUrl}/documents/templates/${body.slug}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: body.inputs ?? {},
      format: body.format ?? 'PDF',
      blank: body.blank ?? false,
    }),
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({ error: { message: 'Export failed.' } }));
    return NextResponse.json(json, { status: response.status });
  }
  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': response.headers.get('content-disposition') ?? 'attachment',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}
