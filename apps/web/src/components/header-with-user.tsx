import { SiteHeader } from '@/components/site-header';
import { loadHeaderUser } from '@/lib/header-user';
import { isAuth0Configured, isAuthUiEnabled } from '@varnarc/auth';
import { resolveAuth0RuntimeConfig } from '@/lib/auth0-config';

export async function HeaderWithUser({
  navItems,
  siteName,
  tagline,
  logoUrl,
  stickyHeader,
}: {
  navItems?: Array<{ label: string; href: string }>;
  siteName?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  stickyHeader?: boolean;
}) {
  const [user, runtime] = await Promise.all([loadHeaderUser(), resolveAuth0RuntimeConfig()]);
  return (
    <SiteHeader
      user={user}
      authConfigured={Boolean(runtime?.configured) || isAuth0Configured() || isAuthUiEnabled()}
      navItems={navItems}
      siteName={siteName}
      tagline={tagline}
      logoUrl={logoUrl}
      stickyHeader={stickyHeader}
    />
  );
}
