/** Indian currency display. Never formats as dollars. */

export function formatInrExact(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function trimFixed(value: number, digits: number): string {
  return value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

/** ₹7.55 lakh, ₹42.5 lakh, ₹1.25 crore, otherwise grouped rupees. */
export function formatInrCompact(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded);
  if (abs >= 1_00_00_000) {
    return `${sign}₹${trimFixed(abs / 1_00_00_000, 2)} crore`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${trimFixed(abs / 1_00_000, 2)} lakh`;
  }
  return formatInrExact(rounded);
}

export function formatSignedInr(amount: number): string {
  if (!Number.isFinite(amount) || amount === 0) return formatInrExact(0);
  const prefix = amount > 0 ? '+' : '−';
  return `${prefix}${formatInrExact(Math.abs(amount))}`;
}

export function formatKm(km: number): string {
  if (!Number.isFinite(km)) return '—';
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(km))} km`;
}

export function formatVehicleAge(years: number, approximate = false): string {
  if (!Number.isFinite(years) || years <= 0) return approximate ? 'Under 1 month' : 'Under 1 month';
  const whole = Math.floor(years);
  let months = Math.round((years - whole) * 12);
  let yearsOut = whole;
  if (months === 12) {
    yearsOut += 1;
    months = 0;
  }
  const prefix = approximate ? 'About ' : '';
  if (yearsOut <= 0) {
    return `${prefix}${months} ${months === 1 ? 'month' : 'months'}`;
  }
  if (months === 0) {
    return `${prefix}${yearsOut} ${yearsOut === 1 ? 'year' : 'years'}`;
  }
  return `${prefix}${yearsOut} ${yearsOut === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'}`;
}

export function parseInrAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, ''));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
