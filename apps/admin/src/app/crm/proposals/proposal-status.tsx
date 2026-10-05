'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LAPTOP_RENTAL_STATUSES,
  LAPTOP_RENTAL_STATUS_LABELS,
  type LaptopRentalStatus,
} from '@varnarc/validation';

export function ProposalStatus({ id, status }: { id: string; status: LaptopRentalStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: LaptopRentalStatus) {
    setValue(next);
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/rental-proposals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Could not update the status.');
      router.refresh();
    } catch (cause) {
      setValue(status);
      setError(cause instanceof Error ? cause.message : 'Could not update the status.');
    } finally {
      setPending(false);
    }
  }

  return (
    <label className="text-sm">
      <span className="mr-2 text-[var(--varnarc-subtle)]">Status</span>
      <select
        className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-2 py-2"
        value={value}
        disabled={pending}
        onChange={(event) => void onChange(event.target.value as LaptopRentalStatus)}
      >
        {LAPTOP_RENTAL_STATUSES.map((item) => (
          <option key={item} value={item}>
            {LAPTOP_RENTAL_STATUS_LABELS[item]}
          </option>
        ))}
      </select>
      {error ? <span className="ml-2 text-red-600">{error}</span> : null}
    </label>
  );
}
