import { proxySettings } from '@/lib/settings-proxy';

export const maxDuration = 120;

export async function POST() {
  return proxySettings('/database/migrate', 'POST', {});
}
