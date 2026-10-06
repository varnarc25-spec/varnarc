import type { ReactNode } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { AdBanner } from '@/components/business/ad-banner';

export function ContentLayout({
  title,
  description,
  breadcrumbs,
  children,
  showAd = true,
  adLayout = 'top',
}: {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: ReactNode;
  showAd?: boolean;
  /** `rail` places the ad in a sticky right column (80% content, 20% ad). */
  adLayout?: 'top' | 'rail';
}) {
  const banner = showAd ? (
    <AdBanner slot="content-top" orientation={adLayout === 'rail' ? 'vertical' : 'horizontal'} />
  ) : null;

  return (
    <PageShell title={title} description={description} breadcrumbs={breadcrumbs}>
      {adLayout === 'rail' && banner ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]">
          <div className="order-2 min-w-0 lg:order-1">{children}</div>
          <div className="order-1 lg:sticky lg:top-24 lg:order-2">{banner}</div>
        </div>
      ) : (
        <>
          {banner ? <div className="mb-6">{banner}</div> : null}
          {children}
        </>
      )}
    </PageShell>
  );
}
