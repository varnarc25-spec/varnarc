import { proxySettings } from '@/lib/settings-proxy';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return proxySettings('/contact/test', 'POST', body);
}
