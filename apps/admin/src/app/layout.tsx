import { apiServerFetch } from '@/lib/api';
import type { CurrentUser } from '@varnarc/types';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AdminShell } from '@/components/admin-shell';
import { Providers } from '@/components/providers';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Varnarc Admin',
    template: '%s | Varnarc Admin',
  },
  description: 'Varnarc Platform administration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Docker image builds have no API/session. Do not prerender 380 admin routes
  // against a live backend (that hang shows as "Generating static pages (0/380)").
  if (process.env.DOCKER_BUILD === '1') {
    return (
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }
  const pathname = (await headers()).get('x-middleware-pathname') ?? '';
  const onAuthRoute = pathname === '/login' || pathname.startsWith('/api/admin/auth');

  if (onAuthRoute) {
    return (
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  const me = await apiServerFetch<CurrentUser>('/auth/me');
  if (!me.data) {
    redirect('/login');
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          <AdminShell currentUser={me.data}>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
