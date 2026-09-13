'use client';

import { useState } from 'react';
import { Button } from '@varnarc/ui';

export type Auth0SettingsView = {
  enabled?: boolean;
  domain?: string | null;
  clientId?: string | null;
  audience?: string | null;
  issuerBaseUrl?: string | null;
  connection?: string | null;
  clientSecretConfigured?: boolean;
  secretConfigured?: boolean;
  envConfigured?: boolean;
  activeSource?: 'database' | 'environment' | 'none';
};

export function Auth0SettingsForm({ initial }: { initial: Auth0SettingsView }) {
  const [form, setForm] = useState({
    enabled: initial.enabled !== false,
    domain: initial.domain ?? '',
    clientId: initial.clientId ?? '',
    clientSecret: '',
    secret: '',
    audience: initial.audience ?? '',
    issuerBaseUrl: initial.issuerBaseUrl ?? '',
    connection: initial.connection ?? 'Username-Password-Authentication',
    clearClientSecret: false,
    clearSecret: false,
  });
  const [activeSource, setActiveSource] = useState(initial.activeSource ?? 'none');
  const [clientSecretConfigured, setClientSecretConfigured] = useState(
    Boolean(initial.clientSecretConfigured),
  );
  const [secretConfigured, setSecretConfigured] = useState(Boolean(initial.secretConfigured));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/auth0', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: form.enabled,
          domain: form.domain.trim() || null,
          clientId: form.clientId.trim() || null,
          clientSecret: form.clientSecret.trim() ? form.clientSecret : '',
          secret: form.secret.trim() ? form.secret : '',
          clearClientSecret: form.clearClientSecret,
          clearSecret: form.clearSecret,
          audience: form.audience.trim() || null,
          issuerBaseUrl: form.issuerBaseUrl.trim() || null,
          connection: form.connection.trim() || 'Username-Password-Authentication',
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: Auth0SettingsView;
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(json.error?.message || `Save failed (${res.status})`);
      }
      const saved = json.data;
      if (saved?.activeSource) setActiveSource(saved.activeSource);
      setClientSecretConfigured(Boolean(saved?.clientSecretConfigured));
      setSecretConfigured(Boolean(saved?.secretConfigured));
      setForm((prev) => ({
        ...prev,
        clientSecret: '',
        secret: '',
        clearClientSecret: false,
        clearSecret: false,
      }));
      setMessage(
        saved?.activeSource === 'database'
          ? 'Saved. Public login will use these database credentials.'
          : 'Saved. Auth0 is not fully active yet — add domain, client id, and both secrets.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid max-w-xl gap-4">
      <p className="text-sm text-[var(--varnarc-subtle)]">
        Active source:{' '}
        <strong>
          {activeSource === 'database'
            ? 'Database'
            : activeSource === 'environment'
              ? 'Environment'
              : 'None'}
        </strong>
        {clientSecretConfigured ? ' · client secret stored' : ''}
        {secretConfigured ? ' · cookie secret stored' : ''}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
        />
        Enable Auth0 from the database
      </label>
      <label className="grid gap-1 text-sm">
        Domain
        <input
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.domain}
          onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
          placeholder="your-tenant.auth0.com"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Client ID
        <input
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.clientId}
          onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Client secret {clientSecretConfigured ? '(leave blank to keep)' : ''}
        <input
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.clientSecret}
          onChange={(e) => setForm((p) => ({ ...p, clientSecret: e.target.value }))}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.clearClientSecret}
          onChange={(e) => setForm((p) => ({ ...p, clearClientSecret: e.target.checked }))}
        />
        Remove stored client secret
      </label>
      <label className="grid gap-1 text-sm">
        Cookie / application secret {secretConfigured ? '(leave blank to keep)' : ''}
        <input
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.secret}
          onChange={(e) => setForm((p) => ({ ...p, secret: e.target.value }))}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.clearSecret}
          onChange={(e) => setForm((p) => ({ ...p, clearSecret: e.target.checked }))}
        />
        Remove stored cookie secret
      </label>
      <label className="grid gap-1 text-sm">
        Audience (optional)
        <input
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.audience}
          onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Database connection
        <input
          className="rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2"
          value={form.connection}
          onChange={(e) => setForm((p) => ({ ...p, connection: e.target.value }))}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? 'Saving…' : 'Save Auth0 settings'}
      </Button>
    </div>
  );
}
