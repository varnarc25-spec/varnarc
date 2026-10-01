'use client';

import { useEffect, useState } from 'react';
import { Button } from '@varnarc/ui';

const inputClass =
  'h-10 w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm';

const CURRENCIES: Record<string, string> = {
  IN: 'INR',
  GB: 'GBP',
  US: 'USD',
  AE: 'AED',
  AU: 'AUD',
  DE: 'EUR',
  JP: 'JPY',
};

type PriceRow = {
  id: string;
  countryCode: string;
  currencyCode: string;
  priceType: string;
  amount?: number | string | null;
  available: boolean;
  sourceType?: string | null;
  sourceUrl?: string | null;
  verified: boolean;
  verifiedAt?: string | null;
  isCurrent: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  city?: string | null;
  state?: string | null;
};

export function AutomobileMarketPricing({ vehicleId }: { vehicleId: string }) {
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [countryCode, setCountryCode] = useState('IN');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [priceType, setPriceType] = useState('EX_SHOWROOM');
  const [amount, setAmount] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [available, setAvailable] = useState(true);
  const [sourceType, setSourceType] = useState('MANUFACTURER');
  const [sourceUrl, setSourceUrl] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifiedDate, setVerifiedDate] = useState('');
  const [currencyOverride, setCurrencyOverride] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/automobile/vehicles/${vehicleId}/prices`);
    const json = (await res.json()) as { data?: PriceRow[]; error?: { message?: string } };
    if (!res.ok) {
      setMessage(json.error?.message || 'Unable to load prices');
      return;
    }
    setPrices(Array.isArray(json.data) ? json.data : []);
  }

  useEffect(() => {
    void load();
  }, [vehicleId]);

  function onCountry(next: string) {
    setCountryCode(next);
    setCurrencyCode(CURRENCIES[next] ?? 'INR');
    setPriceType(next === 'IN' ? 'EX_SHOWROOM' : 'OTR');
    setCurrencyOverride(false);
  }

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/automobile/vehicles/${vehicleId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          currencyCode,
          priceType,
          amount: amount === '' ? null : Number(amount),
          city: city || null,
          state: state || null,
          available,
          sourceType: sourceType || null,
          sourceUrl: sourceUrl || null,
          verified,
          verifiedDate: verifiedDate || null,
          currencyOverride,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save price');
      setMessage('Price recorded. The previous price for this market stays in history.');
      setAmount('');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
      <h2 className="text-lg font-semibold">Market pricing</h2>
      <p className="mt-1 text-sm text-[var(--varnarc-subtle)]">
        India defaults to INR ex-showroom. A GBP amount is not an Indian price. Changing a price
        closes the old record and keeps it in history.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <select
          className={inputClass}
          value={countryCode}
          onChange={(e) => onCountry(e.target.value)}
        >
          <option value="IN">India</option>
          <option value="GB">United Kingdom</option>
          <option value="US">United States</option>
          <option value="AE">UAE</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="JP">Japan</option>
        </select>
        <select
          className={inputClass}
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
        >
          {Object.values(CURRENCIES).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
        >
          <option value="EX_SHOWROOM">Ex-showroom</option>
          <option value="OTR">On the road</option>
          <option value="LIST">List</option>
          <option value="ON_ROAD">On-road</option>
        </select>
        <input
          className={inputClass}
          placeholder="Amount in major units"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Source URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
        <select
          className={inputClass}
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          <option value="MANUFACTURER">Manufacturer</option>
          <option value="SECONDARY">Secondary</option>
        </select>
        <input
          className={inputClass}
          type="date"
          value={verifiedDate}
          onChange={(e) => setVerifiedDate(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Available in this market
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
          Verified
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={currencyOverride}
            onChange={(e) => setCurrencyOverride(e.target.checked)}
          />
          Override currency check
        </label>
      </div>
      <div className="mt-4">
        <Button type="button" disabled={loading} onClick={() => void save()}>
          {loading ? 'Saving…' : 'Record price'}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-[var(--varnarc-subtle)]">
              <th className="py-2 pr-3">Market</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Current</th>
              <th className="py-2 pr-3">Verified</th>
              <th className="py-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id} className="border-b border-[var(--varnarc-border)]">
                <td className="py-2 pr-3">
                  {price.countryCode} {price.currencyCode}
                </td>
                <td className="py-2 pr-3">{price.amount == null ? '—' : String(price.amount)}</td>
                <td className="py-2 pr-3">{price.priceType}</td>
                <td className="py-2 pr-3">{price.isCurrent ? 'Yes' : 'History'}</td>
                <td className="py-2 pr-3">{price.verified ? 'Yes' : 'No'}</td>
                <td className="py-2">{price.sourceType || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
