'use client';

import { useState } from 'react';
import { Button } from '@varnarc/ui';

export type DatabaseBackupStatus = {
  configured?: boolean;
  host?: string | null;
  port?: number | null;
  database?: string | null;
  ssl?: boolean;
  usesPooler?: boolean;
  providerHint?: 'postgres';
  pgDumpAvailable?: boolean;
  migrations?: {
    schemaPath?: string | null;
    prismaCliAvailable?: boolean;
    pendingCount?: number;
    onDiskCount?: number;
    pending?: string[];
    applied?: Array<{ name: string; finishedAt: string | null; rolledBack: boolean }>;
  };
};

export function DatabaseBackupPanel({ initial }: { initial: DatabaseBackupStatus }) {
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateMessage, setMigrateMessage] = useState<string | null>(null);
  const [migrations, setMigrations] = useState(initial.migrations);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/database/backup', { cache: 'no-store' });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || type.includes('application/json')) {
        const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(json.error?.message || `Backup failed (${res.status})`);
      }
      const blob = await res.blob();
      const filename =
        res.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] ??
        'varnarc-backup.sql';
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setDownloading(false);
    }
  }

  async function applyMigrations() {
    setMigrating(true);
    setError(null);
    setMigrateMessage(null);
    try {
      const res = await fetch('/api/admin/settings/database/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: NonNullable<DatabaseBackupStatus['migrations']> & { output?: string };
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(json.error?.message || `Migrate failed (${res.status})`);
      }
      const next = json.data;
      if (next) {
        setMigrations({
          schemaPath: next.schemaPath,
          prismaCliAvailable: next.prismaCliAvailable,
          pendingCount: next.pendingCount,
          onDiskCount: next.onDiskCount,
          pending: next.pending,
          applied: next.applied,
        });
        setMigrateMessage(next.output || 'Migrations applied.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migrate failed');
    } finally {
      setMigrating(false);
    }
  }

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--varnarc-subtle)]">Host</dt>
          <dd className="font-mono">{initial.host ?? 'Not configured'}</dd>
        </div>
        <div>
          <dt className="text-[var(--varnarc-subtle)]">Database</dt>
          <dd className="font-mono">{initial.database ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--varnarc-subtle)]">Provider</dt>
          <dd>PostgreSQL</dd>
        </div>
        <div>
          <dt className="text-[var(--varnarc-subtle)]">Dump engine</dt>
          <dd>
            {initial.pgDumpAvailable
              ? 'pg_dump'
              : 'Built-in SQL export (pg_dump not installed on API host)'}
          </dd>
        </div>
      </dl>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="space-y-3 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
        <h2 className="text-base font-semibold text-[var(--varnarc-ink)]">Prisma migrations</h2>
        <p className="text-sm text-[var(--varnarc-subtle)]">
          Applies pending SQL from this API image to the live database. Same command GitHub Actions
          runs inside the api container.
        </p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--varnarc-subtle)]">Pending</dt>
            <dd className="font-mono">{migrations?.pendingCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-[var(--varnarc-subtle)]">On disk</dt>
            <dd className="font-mono">{migrations?.onDiskCount ?? 0}</dd>
          </div>
        </dl>
        {migrations?.pending?.length ? (
          <ul className="list-disc pl-5 font-mono text-xs text-[var(--varnarc-ink)]">
            {migrations.pending.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--varnarc-subtle)]">No pending migrations.</p>
        )}
        {migrateMessage ? (
          <pre className="overflow-x-auto rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] p-3 text-xs">
            {migrateMessage}
          </pre>
        ) : null}
        <Button type="button" onClick={applyMigrations} disabled={migrating}>
          {migrating ? 'Applying…' : 'Apply pending migrations'}
        </Button>
      </section>

      <Button type="button" onClick={download} disabled={downloading || !initial.configured}>
        {downloading ? 'Creating dump…' : 'Download full SQL backup'}
      </Button>

      <section className="space-y-2 text-sm leading-6 text-[var(--varnarc-subtle)]">
        <h2 className="text-base font-semibold text-[var(--varnarc-ink)]">
          Restore on VPS Postgres
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Download the dump here, or run <code className="font-mono">pnpm db:backup</code>{' '}
            locally.
          </li>
          <li>
            On the VPS: create an empty database, apply Prisma migrations, then restore:
            <pre className="mt-2 overflow-x-auto rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] p-3 font-mono text-xs text-[var(--varnarc-ink)]">
              {`createdb varnarc
bash scripts/vps/migrate.sh
pnpm db:restore -- --url=postgresql://USER:PASS@HOST:5432/varnarc --file=backups/varnarc.sql`}
            </pre>
          </li>
          <li>
            Point API, web, and admin at the database URL. Restart API. Use Admin → Database → Apply
            pending migrations if Prisma reports pending SQL.
          </li>
        </ol>
      </section>
    </div>
  );
}
