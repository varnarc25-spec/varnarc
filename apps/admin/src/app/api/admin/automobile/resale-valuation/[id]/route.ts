import { proxyAutomobile } from '@/lib/automobile-proxy';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  return proxyAutomobile(`/automobile/resale-valuation/admin/config/${id}`, 'PUT', body);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return proxyAutomobile(`/automobile/resale-valuation/admin/config/${id}`, 'DELETE');
}
