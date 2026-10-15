'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  parentId: string | null;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(
    [...categories].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)),
  );
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function createCategory() {
    const response = await fetch('/api/admin/documents/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug:
          slug ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        parentId: parentId || null,
        displayOrder: rows.length,
        isActive: true,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    setMessage(
      response.ok
        ? 'Category created.'
        : (payload?.error?.message ?? 'Could not create the category.'),
    );
    if (response.ok) {
      setName('');
      setSlug('');
      router.refresh();
    }
  }

  async function saveRow(row: Category) {
    const response = await fetch(`/api/admin/documents/categories/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: row.name,
        slug: row.slug,
        isActive: row.isActive,
        parentId: row.parentId,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    setMessage(
      response.ok ? 'Category saved.' : (payload?.error?.message ?? 'Could not save the category.'),
    );
  }

  async function reorder(next: Category[]) {
    setRows(next);
    const response = await fetch('/api/admin/documents/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((row) => row.id) }),
    });
    setMessage(response.ok ? 'Order saved.' : 'Could not save the order.');
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) return;
    next[index] = swap;
    next[target] = current;
    void reorder(next);
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm">{message}</p> : null}
      <form
        className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void createCategory();
        }}
      >
        <input
          className="rounded border px-3 py-2"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <select
          className="rounded border px-3 py-2"
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          aria-label="Parent category"
        >
          <option value="">Top level</option>
          {rows
            .filter((row) => !row.parentId)
            .map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
        </select>
        <button className="rounded bg-[#0b1f3a] px-3 py-2 text-white" type="submit">
          Add category
        </button>
      </form>
      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="grid items-center gap-2 rounded border border-slate-200 p-3 md:grid-cols-[1fr_1fr_auto_auto_auto]"
          >
            <input
              aria-label="Category name"
              className="rounded border px-2 py-1"
              value={row.name}
              onChange={(event) => update(row.id, { name: event.target.value })}
            />
            <input
              aria-label="Category slug"
              className="rounded border px-2 py-1"
              value={row.slug}
              onChange={(event) => update(row.id, { slug: event.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={row.isActive}
                onChange={(event) => update(row.id, { isActive: event.target.checked })}
              />
              Visible
            </label>
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={() => move(index, -1)}>
                Up
              </button>
              <button type="button" onClick={() => move(index, 1)}>
                Down
              </button>
            </div>
            <button type="button" className="text-sm underline" onClick={() => void saveRow(row)}>
              Save
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  function update(id: string, patch: Partial<Category>) {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
}
