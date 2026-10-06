'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CarFront } from 'lucide-react';
import { getApiBaseUrl } from '@/services/api-client';

export function AutomobileVehicleImage({
  src,
  alt,
  label,
  vehicleId,
  attribution,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  label: string;
  vehicleId?: string;
  attribution?: string | null;
  priority?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [credit, setCredit] = useState<string | null>(attribution ?? null);

  useEffect(() => {
    setUrl(src ?? null);
    setCredit(attribution ?? null);
  }, [src, attribution]);

  useEffect(() => {
    if (url || !vehicleId) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`${getApiBaseUrl()}/automobile/vehicles/${vehicleId}/image`, {
        signal: ctrl.signal,
      })
        .then((res) => res.json())
        .then((json: { data?: { imageUrl?: string | null; attribution?: string | null } }) => {
          if (json.data?.imageUrl) {
            setUrl(json.data.imageUrl);
            setCredit(json.data.attribution ?? null);
          }
        })
        .catch(() => undefined);
    }, 80);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [url, vehicleId]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
      {url ? (
        <div className="absolute inset-3">
          <div className="relative h-full w-full">
            <Image
              src={url}
              alt={alt}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain object-center"
              priority={priority}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
          <CarFront className="h-7 w-7 text-slate-400" aria-hidden="true" />
          <p className="line-clamp-2 text-sm font-semibold text-slate-600">{label}</p>
          <p className="text-xs text-slate-400">Image coming soon</p>
          <span className="sr-only">{alt}</span>
        </div>
      )}
      {credit && url ? (
        <p className="absolute bottom-1 left-2 right-2 truncate text-[10px] text-slate-500">
          {credit}
        </p>
      ) : null}
    </div>
  );
}
