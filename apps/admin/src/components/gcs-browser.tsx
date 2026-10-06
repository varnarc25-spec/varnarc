'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type GcsFolderRow = { name: string; prefix: string };
export type GcsFileRow = {
  name: string;
  path: string;
  size: number;
  updated: string | null;
  contentType: string | null;
  url: string;
};

export type GcsListing = {
  bucket: string;
  prefix: string;
  folders: GcsFolderRow[];
  files: GcsFileRow[];
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function readError(res: Response) {
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  return json.error?.message || `Request failed (${res.status})`;
}

export function GcsBrowser({ listing }: { listing: GcsListing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const crumbs = listing.prefix.split('/').filter(Boolean);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Storage request failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--varnarc-muted)]">
        Bucket <span className="font-medium text-[var(--varnarc-text)]">{listing.bucket}</span>
      </p>
      <nav className="flex flex-wrap items-center gap-1 text-sm">
        <Link href="/media/storage" className="text-[var(--varnarc-brand)] hover:underline">
          Root
        </Link>
        {crumbs.map((crumb, index) => {
          const prefix = `${crumbs.slice(0, index + 1).join('/')}/`;
          return (
            <span key={prefix} className="flex items-center gap-1">
              <span>/</span>
              <Link
                href={`/media/storage?prefix=${encodeURIComponent(prefix)}`}
                className="text-[var(--varnarc-brand)] hover:underline"
              >
                {crumb}
              </Link>
            </span>
          );
        })}
      </nav>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            const file = form.get('file');
            if (!(file instanceof File) || file.size === 0) {
              setError('Choose a file to upload.');
              return;
            }
            form.set('prefix', listing.prefix);
            void run(async () => {
              const res = await fetch('/api/admin/media/storage', { method: 'POST', body: form });
              if (!res.ok) throw new Error(await readError(res));
              formEl.reset();
            });
          }}
        >
          <input name="file" type="file" className="text-sm" disabled={busy} />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[var(--varnarc-brand)] px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            Upload
          </button>
        </form>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = folderName.trim();
            if (!name) return;
            void run(async () => {
              const res = await fetch('/api/admin/media/storage/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prefix: listing.prefix, name }),
              });
              if (!res.ok) throw new Error(await readError(res));
              setFolderName('');
            });
          }}
        >
          <input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="New folder"
            className="rounded-md border border-[var(--varnarc-border)] px-2 py-1.5 text-sm"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border border-[var(--varnarc-border)] px-3 py-1.5 text-sm disabled:opacity-60"
          >
            Create folder
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-surface)] text-[var(--varnarc-muted)]">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Updated</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {listing.folders.map((folder) => (
              <tr key={folder.prefix} className="border-t border-[var(--varnarc-border)]">
                <td className="px-3 py-2">
                  <Link
                    href={`/media/storage?prefix=${encodeURIComponent(folder.prefix)}`}
                    className="font-medium text-[var(--varnarc-brand)] hover:underline"
                  >
                    {folder.name}/
                  </Link>
                </td>
                <td className="px-3 py-2 text-[var(--varnarc-muted)]">Folder</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="text-red-600 hover:underline disabled:opacity-60"
                    disabled={busy}
                    onClick={() => {
                      if (
                        !window.confirm(`Delete folder ${folder.name} and everything inside it?`)
                      ) {
                        return;
                      }
                      void run(async () => {
                        const qs = new URLSearchParams({ path: folder.prefix, kind: 'folder' });
                        const res = await fetch(`/api/admin/media/storage/object?${qs}`, {
                          method: 'DELETE',
                        });
                        if (!res.ok) throw new Error(await readError(res));
                      });
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {listing.files.map((file) => (
              <tr key={file.path} className="border-t border-[var(--varnarc-border)]">
                <td className="px-3 py-2">
                  <a href={file.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {file.name}
                  </a>
                </td>
                <td className="px-3 py-2">{formatBytes(file.size)}</td>
                <td className="px-3 py-2 text-[var(--varnarc-muted)]">
                  {file.updated ? new Date(file.updated).toLocaleString() : ''}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="text-red-600 hover:underline disabled:opacity-60"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(`Delete ${file.name}?`)) return;
                      void run(async () => {
                        const qs = new URLSearchParams({ path: file.path, kind: 'file' });
                        const res = await fetch(`/api/admin/media/storage/object?${qs}`, {
                          method: 'DELETE',
                        });
                        if (!res.ok) throw new Error(await readError(res));
                      });
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {listing.folders.length === 0 && listing.files.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-[var(--varnarc-muted)]" colSpan={4}>
                  This folder is empty.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
