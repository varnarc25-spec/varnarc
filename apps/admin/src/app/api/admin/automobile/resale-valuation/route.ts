import { proxyAutomobile } from '@/lib/automobile-proxy';

export async function GET() {
  return proxyAutomobile('/automobile/resale-valuation/admin/config', 'GET');
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAutomobile('/automobile/resale-valuation/admin/config', 'POST', body);
}
