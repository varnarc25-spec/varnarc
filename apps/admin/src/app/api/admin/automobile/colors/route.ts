import { proxyAutomobile } from '@/lib/automobile-proxy';

export async function GET(request: Request) {
  return proxyAutomobile('/automobile/admin/colors', 'GET', undefined, request);
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAutomobile('/automobile/colors', 'POST', body);
}
