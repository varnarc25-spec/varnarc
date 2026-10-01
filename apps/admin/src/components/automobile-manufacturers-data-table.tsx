'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { AutomobilePublishButton } from '@/components/automobile-forms';

export type ManufacturerTableRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  country?: string | null;
  foundedYear?: number | null;
  website?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  featured?: boolean;
  availableInIndia?: boolean;
  indiaAvailabilityStatus?: string | null;
  _count?: { vehicles?: number };
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

function indiaLabel(row: ManufacturerTableRow) {
  if (row.availableInIndia) return 'Available';
  switch (row.indiaAvailabilityStatus) {
    case 'NO_CURRENT_RETAIL_RANGE_VERIFIED':
      return 'No current range';
    case 'NOT_OFFICIALLY_AVAILABLE':
      return 'Not official';
    case 'DUPLICATE_OR_NON_CANONICAL':
      return 'Duplicate';
    case 'PREBOOKING_CLOSED_DELIVERIES_2027':
      return 'Deliveries 2027';
    default:
      return row.indiaAvailabilityStatus || '—';
  }
}

function statusBadge(status: string) {
  const tone =
    status === 'PUBLISHED'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'DRAFT'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

export function AutomobileManufacturersDataTable({ rows }: { rows: ManufacturerTableRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [globalFilter, setGlobalFilter] = useState('');
  const [indiaFilter, setIndiaFilter] = useState<'all' | 'available' | 'other'>('all');

  const filteredRows = useMemo(() => {
    if (indiaFilter === 'available') return rows.filter((row) => row.availableInIndia);
    if (indiaFilter === 'other') return rows.filter((row) => !row.availableInIndia);
    return rows;
  }, [indiaFilter, rows]);

  const columns = useMemo<ColumnDef<ManufacturerTableRow>[]>(
    () => [
      {
        id: 'logo',
        header: 'Logo',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.logoUrl ? (
            <img
              src={row.original.logoUrl}
              alt=""
              className="h-8 w-8 rounded bg-white object-contain"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--varnarc-muted)] text-xs font-semibold">
              {row.original.name.slice(0, 1)}
            </span>
          ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <Link
              href={`/automobile/manufacturers/${row.original.id}`}
              className="font-medium text-[var(--varnarc-brand)] hover:underline"
            >
              {row.original.name}
            </Link>
            <div className="font-mono text-xs text-[var(--varnarc-subtle)]">
              {row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'tagline',
        header: 'Slogan',
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-[var(--varnarc-subtle)]">
            {row.original.tagline || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'country',
        header: 'Country',
        cell: ({ row }) => row.original.country || '—',
      },
      {
        accessorKey: 'foundedYear',
        header: 'Founded',
        cell: ({ row }) => row.original.foundedYear || '—',
      },
      {
        id: 'india',
        accessorFn: (row) => indiaLabel(row),
        header: 'India',
        cell: ({ row }) => indiaLabel(row.original),
      },
      {
        id: 'featured',
        accessorFn: (row) => (row.featured ? 1 : 0),
        header: 'Featured',
        cell: ({ row }) => (row.original.featured ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => statusBadge(String(getValue())),
      },
      {
        id: 'vehicles',
        accessorFn: (row) => row._count?.vehicles ?? 0,
        header: 'Vehicles',
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/automobile/manufacturers/${row.original.id}`}
              className="text-sm text-[var(--varnarc-brand)] hover:underline"
            >
              Edit
            </Link>
            <AutomobilePublishButton
              entity="manufacturers"
              id={row.original.id}
              status={row.original.status}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase().trim();
      if (!q) return true;
      const item = row.original;
      return [
        item.name,
        item.slug,
        item.country,
        item.tagline,
        item.indiaAvailabilityStatus,
        item.status,
      ]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!rows.length) {
    return (
      <p className="rounded-lg border border-[var(--varnarc-border)] px-4 py-8 text-center text-sm text-[var(--varnarc-subtle)]">
        No manufacturers yet.
      </p>
    );
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          placeholder="Search name, country, slogan…"
          className="h-10 w-full max-w-md rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        />
        <select
          value={indiaFilter}
          onChange={(e) => {
            setIndiaFilter(e.target.value as 'all' | 'available' | 'other');
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          className="h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        >
          <option value="all">All India statuses</option>
          <option value="available">Available in India</option>
          <option value="other">Not available in India</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder || !header.column.getCanSort() ? (
                      flexRender(header.column.columnDef.header, header.getContext())
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-[var(--varnarc-ink)]"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--varnarc-border)]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--varnarc-subtle)]">
        <span>
          Showing {from}–{to} of {filteredCount}
          {filteredCount !== rows.length ? ` (filtered from ${rows.length})` : ''}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            Rows
            <select
              className="h-8 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-2 text-sm"
              value={pageSize}
              onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span>
            Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <button
            type="button"
            className="h-8 rounded-md border border-[var(--varnarc-border)] px-3 disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
