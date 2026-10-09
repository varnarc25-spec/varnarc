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
import {
  buildLaptopPriceListDocument,
  discountedMonthlyRate,
  formatProposalInr,
  type RentalDiscountTier,
} from '@varnarc/validation';
import { drawProposal } from '../proposals/proposal-pdf';

export type LaptopTableRow = {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  listedYear: string;
  generation: string;
  processor: string;
  processorDetail: string;
  processorFull: string;
  ram: string;
  storage: string;
  display: string;
  graphics: string;
  operatingSystem: string;
  camera: string;
  monthlyRate: number | null;
  commitmentMonths: number;
  commitmentRate: number;
  gstPercent: number;
  depositPerLaptop: number;
  taxesNote: string;
  availability: string;
  assetTag: string;
  serialNumber: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const COLUMN_FILTERS = [
  ['brand', 'Brand'],
  ['processor', 'Processor'],
  ['ram', 'RAM'],
  ['listedYear', 'Year'],
  ['category', 'Category'],
  ['availability', 'Stock'],
] as const;

type ColumnFilterKey = (typeof COLUMN_FILTERS)[number][0];

const EMPTY_FILTERS: Record<ColumnFilterKey, string> = {
  brand: '',
  processor: '',
  ram: '',
  listedYear: '',
  category: '',
  availability: '',
};

export type PriceListCompany = {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  logoDataUrl: string | null;
};

function termPrice(row: LaptopTableRow, percent: number) {
  return discountedMonthlyRate(row.monthlyRate, percent);
}

function exportColumns(
  discounts: RentalDiscountTier[],
): Array<{ header: string; value: (row: LaptopTableRow) => string | number }> {
  return [
    { header: 'Name', value: (row) => row.name },
    { header: 'Category', value: (row) => row.category },
    { header: 'Brand', value: (row) => row.brand },
    { header: 'Model', value: (row) => row.model },
    { header: 'Listed year', value: (row) => row.listedYear },
    { header: 'Generation', value: (row) => row.generation },
    { header: 'Processor', value: (row) => row.processor },
    { header: 'Processor full', value: (row) => row.processorFull },
    { header: 'RAM', value: (row) => row.ram },
    { header: 'Storage', value: (row) => row.storage },
    { header: 'Screen', value: (row) => row.display },
    { header: 'Graphics', value: (row) => row.graphics },
    { header: 'Operating system', value: (row) => row.operatingSystem },
    { header: 'Camera', value: (row) => row.camera },
    { header: 'One-month rate', value: (row: LaptopTableRow) => row.monthlyRate ?? '' },
    ...[...discounts]
      .sort((left, right) => left.months - right.months)
      .map((tier) => ({
        header: `${tier.months} months`,
        value: (row: LaptopTableRow) => termPrice(row, tier.percent) ?? '',
      })),
    { header: 'Commitment months', value: (row: LaptopTableRow) => row.commitmentMonths },
    { header: 'Catalog 12-month rate', value: (row: LaptopTableRow) => row.commitmentRate },
    { header: 'GST %', value: (row) => row.gstPercent },
    { header: 'Security deposit', value: (row) => row.depositPerLaptop },
    { header: 'Taxes and charges', value: (row) => row.taxesNote },
    { header: 'Availability', value: (row) => row.availability },
    { header: 'Asset tag', value: (row) => row.assetTag },
    { header: 'Serial number', value: (row: LaptopTableRow) => row.serialNumber },
  ];
}

function csvCell(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function exportCsv(rows: LaptopTableRow[], discounts: RentalDiscountTier[]) {
  const columns = exportColumns(discounts);
  const header = columns.map((column) => csvCell(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(','));
  const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `laptops-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function LaptopsTable({
  rows,
  discounts,
  company,
}: {
  rows: LaptopTableRow[];
  discounts: RentalDiscountTier[];
  company: PriceListCompany;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'listedYear', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [clientName, setClientName] = useState('');
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const filterOptions = useMemo(() => {
    const options = {} as Record<ColumnFilterKey, string[]>;
    for (const [key] of COLUMN_FILTERS) {
      options[key] = [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((left, right) =>
        left.localeCompare(right, undefined, { numeric: true }),
      );
    }
    return options;
  }, [rows]);

  const narrowed = useMemo(
    () =>
      rows.filter((row) =>
        COLUMN_FILTERS.every(([key]) => !filters[key] || row[key] === filters[key]),
      ),
    [rows, filters],
  );

  const columns = useMemo<ColumnDef<LaptopTableRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Laptop',
        cell: ({ row }) => (
          <Link href={`/crm/laptops/${row.original.id}`} className="font-medium underline">
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'listedYear',
        header: 'Year',
        sortingFn: (a, b) =>
          (Number(a.original.listedYear) || 0) - (Number(b.original.listedYear) || 0),
      },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'processorDetail', header: 'Processor' },
      { accessorKey: 'ram', header: 'RAM' },
      { accessorKey: 'storage', header: 'Storage' },
      {
        accessorKey: 'monthlyRate',
        header: '1 month',
        sortingFn: (a, b) => (a.original.monthlyRate ?? -1) - (b.original.monthlyRate ?? -1),
        cell: ({ row }) =>
          row.original.monthlyRate == null ? '' : formatProposalInr(row.original.monthlyRate),
      },
      ...[...discounts]
        .sort((left, right) => left.months - right.months)
        .map((tier) => ({
          id: `term-${tier.months}`,
          header: `${tier.months} months`,
          accessorFn: (row: LaptopTableRow) => termPrice(row, tier.percent) ?? -1,
          cell: ({ row }: { row: { original: LaptopTableRow } }) => {
            const price = termPrice(row.original, tier.percent);
            return price == null ? '' : formatProposalInr(price);
          },
        })),
      {
        accessorKey: 'depositPerLaptop',
        header: 'Deposit',
        cell: ({ getValue }) => formatProposalInr(Number(getValue())),
      },
      { accessorKey: 'availability', header: 'Stock' },
      {
        id: 'edit',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link href={`/crm/laptops/${row.original.id}`} className="underline">
            Edit
          </Link>
        ),
      },
    ],
    [discounts],
  );

  const table = useReactTable({
    data: narrowed,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).trim().toLowerCase();
      if (!query) return true;
      const laptop = row.original;
      return [
        laptop.name,
        laptop.category,
        laptop.brand,
        laptop.model,
        laptop.processor,
        laptop.processorFull,
        laptop.ram,
        laptop.storage,
        laptop.display,
        laptop.operatingSystem,
        laptop.availability,
        laptop.assetTag,
        laptop.serialNumber,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  async function exportPriceList(selected: LaptopTableRow[]) {
    setPdfPending(true);
    setPdfError(null);
    try {
      const proposalDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const document = buildLaptopPriceListDocument({
        customerCompanyName: clientName.trim() || 'Client',
        proposalDate,
        issuerName: company.name,
        issuerAddress: company.address || null,
        issuerPhone: company.phone || null,
        issuerEmail: company.email || null,
        issuerGstin: company.gstin || null,
        discountTiers: discounts,
        lines: selected.map((row) => ({
          name: row.name,
          processor: row.processorDetail || row.processor,
          ram: row.ram,
          storage: row.storage,
          display: row.display,
          operatingSystem: row.operatingSystem,
          monthlyRate: row.monthlyRate,
          depositPerLaptop: row.depositPerLaptop,
          gstPercent: row.gstPercent,
        })),
      });
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      drawProposal(pdf, document, company.logoDataUrl);
      pdf.save(document.fileName);
    } catch {
      setPdfError('Could not create the PDF. Try again.');
    } finally {
      setPdfPending(false);
    }
  }

  if (!rows.length) {
    return (
      <p className="rounded-lg border border-[var(--varnarc-border)] px-4 py-8 text-center text-sm text-[var(--varnarc-subtle)]">
        No laptops yet.
      </p>
    );
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  const pageCount = table.getPageCount();
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={globalFilter}
          onChange={(event) => {
            setGlobalFilter(event.target.value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          placeholder="Search laptops…"
          className="h-10 w-full max-w-md rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Client name"
            className="h-10 w-44 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
          />
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-4 text-sm font-medium hover:bg-[var(--varnarc-muted)] disabled:opacity-40"
            disabled={filteredCount === 0}
            onClick={() =>
              exportCsv(
                filteredRows.map((row) => row.original),
                discounts,
              )
            }
          >
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-40"
            disabled={filteredCount === 0 || pdfPending}
            onClick={() => void exportPriceList(filteredRows.map((row) => row.original))}
          >
            {pdfPending ? 'Preparing PDF…' : 'Export PDF'}
          </button>
        </div>
      </div>
      {pdfError ? <p className="text-sm text-red-600">{pdfError}</p> : null}
      <div className="flex flex-wrap gap-2">
        {COLUMN_FILTERS.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-[var(--varnarc-subtle)]">
            {label}
            <select
              className="h-9 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-2 text-sm text-[var(--varnarc-ink)]"
              value={filters[key]}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((current) => ({ ...current, [key]: value }));
                setPagination((current) => ({ ...current, pageIndex: 0 }));
              }}
            >
              <option value="">All</option>
              {filterOptions[key].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
        {COLUMN_FILTERS.some(([key]) => filters[key]) ? (
          <button
            type="button"
            className="h-9 rounded-md px-2 text-sm underline"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--varnarc-border)] bg-[var(--varnarc-muted)] text-[var(--varnarc-subtle)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-[var(--varnarc-ink)]"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={columns.length}>
                  No laptops match these filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--varnarc-border)]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
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
              onChange={(event) =>
                setPagination({ pageIndex: 0, pageSize: Number(event.target.value) })
              }
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
            Page {pageIndex + 1} of {pageCount || 1}
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
