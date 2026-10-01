import { proxyAutomobile } from '@/lib/automobile-proxy';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyAutomobile(`/automobile/admin/vehicles/${id}/prices`, 'GET');
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  return proxyAutomobile(`/automobile/admin/vehicles/${id}/prices`, 'POST', body);
}
