import { proxyAutomobile } from '@/lib/automobile-proxy';

export async function POST() {
  return proxyAutomobile('/automobile/admin/vehicles/sync-india-availability', 'POST');
}
