'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { drawProposal, prepareRateCardLogo, registerVerdana } from '../proposals/proposal-pdf';

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
  buyingPrice: number | null;
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
  ['storage', 'Storage'],
  ['listedYear', 'Year'],
  ['category', 'Category'],
  ['availability', 'Stock'],
] as const;

type ColumnFilterKey = (typeof COLUMN_FILTERS)[number][0];

const EMPTY_FILTERS: Record<ColumnFilterKey, string[]> = {
  brand: [],
  processor: [],
  ram: [],
  storage: [],
  listedYear: [],
  category: [],
  availability: [],
};

/** RAM and storage are stored with extra detail ("16GB DDR5", "512GB NVMe SSD"). Filters use the capacity. */
function capacityOptions(value: string, kind: 'ram' | 'storage'): string[] {
  const found = new Set<string>();
  for (const match of value.matchAll(/(\d+)\s*(GB|TB)/gi)) {
    const size = `${match[1]}${match[2].toUpperCase()}`;
    found.add(kind === 'storage' ? `${size} SSD` : size);
  }
  return [...found];
}

function capacityRank(label: string): number {
  const match = /^(\d+)\s*(GB|TB)/i.exec(label);
  if (!match) return 0;
  const amount = Number(match[1]);
  return match[2].toUpperCase() === 'TB' ? amount * 1024 : amount;
}

function matchesColumnFilter(
  row: LaptopTableRow,
  key: ColumnFilterKey,
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  if (key === 'ram' || key === 'storage') {
    const tokens = capacityOptions(row[key], key);
    return selected.some((option) => tokens.includes(option));
  }
  return selected.includes(row[key]);
}

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
    { header: 'Buying price', value: (row: LaptopTableRow) => row.buyingPrice ?? '' },
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

type LaptopPrices = Pick<
  LaptopTableRow,
  'buyingPrice' | 'monthlyRate' | 'depositPerLaptop' | 'commitmentRate'
>;

function withPrices(row: LaptopTableRow, prices: Record<string, LaptopPrices>): LaptopTableRow {
  const saved = prices[row.id];
  return saved ? { ...row, ...saved } : row;
}

function PriceInput({
  value,
  allowEmpty,
  label,
  onCommit,
}: {
  value: number | null;
  allowEmpty: boolean;
  label: string;
  onCommit: (next: number | null) => void;
}) {
  const [text, setText] = useState(value == null ? '' : String(value));
  const [focused, setFocused] = useState(false);
  const skipCommit = useRef(false);

  useEffect(() => {
    if (!focused) setText(value == null ? '' : String(value));
  }, [value, focused]);

  function commit() {
    if (skipCommit.current) {
      skipCommit.current = false;
      return;
    }
    const trimmed = text.replace(/,/g, '').trim();
    if (trimmed === '') {
      onCommit(allowEmpty ? null : 0);
      return;
    }
    const amount = Number(trimmed);
    if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
      setText(value == null ? '' : String(value));
      return;
    }
    onCommit(Math.round(amount * 100) / 100);
  }

  return (
    <input
      aria-label={label}
      inputMode="decimal"
      value={text}
      className="h-8 w-28 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-2 text-sm"
      onFocus={() => setFocused(true)}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          skipCommit.current = true;
          setText(value == null ? '' : String(value));
          event.currentTarget.blur();
        }
      }}
    />
  );
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
  const [openFilter, setOpenFilter] = useState<ColumnFilterKey | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState(false);
  const [prices, setPrices] = useState<Record<string, LaptopPrices>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [priceError, setPriceError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const pricesRef = useRef(prices);
  const saveSeq = useRef<Record<string, number>>({});
  pricesRef.current = prices;

  const catalog = useMemo(() => rows.map((row) => withPrices(row, prices)), [rows, prices]);

  const savePrices = useCallback(async (row: LaptopTableRow, next: LaptopPrices) => {
    const current = withPrices(row, pricesRef.current);
    if (
      current.buyingPrice === next.buyingPrice &&
      current.monthlyRate === next.monthlyRate &&
      current.depositPerLaptop === next.depositPerLaptop
    ) {
      return;
    }
    const seq = (saveSeq.current[row.id] ?? 0) + 1;
    saveSeq.current[row.id] = seq;
    setPrices((currentPrices) => ({ ...currentPrices, [row.id]: next }));
    setSavingIds((currentSaving) => ({ ...currentSaving, [row.id]: true }));
    setPriceError(null);
    try {
      const res = await fetch(`/api/admin/crm/laptops/${row.id}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyingPrice: next.buyingPrice,
          monthlyRate: next.monthlyRate,
          depositPerLaptop: next.depositPerLaptop,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (saveSeq.current[row.id] !== seq) return;
      if (!res.ok) throw new Error(json.error?.message ?? 'Could not save the price.');
    } catch (cause) {
      if (saveSeq.current[row.id] !== seq) return;
      setPrices((currentPrices) => {
        const restored = { ...currentPrices };
        delete restored[row.id];
        return restored;
      });
      setPriceError(cause instanceof Error ? cause.message : 'Could not save the price.');
    } finally {
      if (saveSeq.current[row.id] === seq) {
        setSavingIds((currentSaving) => ({ ...currentSaving, [row.id]: false }));
      }
    }
  }, []);

  const filterOptions = useMemo(() => {
    const options = {} as Record<ColumnFilterKey, string[]>;
    for (const [key] of COLUMN_FILTERS) {
      const values =
        key === 'ram' || key === 'storage'
          ? catalog.flatMap((row) => capacityOptions(row[key], key))
          : catalog.map((row) => row[key]).filter(Boolean);
      options[key] = [...new Set(values)].sort((left, right) =>
        key === 'ram' || key === 'storage'
          ? capacityRank(left) - capacityRank(right)
          : left.localeCompare(right, undefined, { numeric: true }),
      );
    }
    return options;
  }, [catalog]);

  const narrowed = useMemo(
    () =>
      catalog.filter((row) =>
        COLUMN_FILTERS.every(([key]) => matchesColumnFilter(row, key, filters[key])),
      ),
    [catalog, filters],
  );

  const commitPrice = useCallback(
    (
      row: LaptopTableRow,
      field: 'buyingPrice' | 'monthlyRate' | 'depositPerLaptop',
      value: number | null,
    ) => {
      const current = withPrices(row, pricesRef.current);
      const next: LaptopPrices = {
        buyingPrice: field === 'buyingPrice' ? value : current.buyingPrice,
        monthlyRate: field === 'monthlyRate' ? value : current.monthlyRate,
        depositPerLaptop: field === 'depositPerLaptop' ? (value ?? 0) : current.depositPerLaptop,
        commitmentRate: field === 'monthlyRate' ? (value ?? 0) : current.commitmentRate,
      };
      void savePrices(row, next);
    },
    [savePrices],
  );

  const columns = useMemo<ColumnDef<LaptopTableRow>[]>(
    () => [
      {
        id: 'select',
        enableSorting: false,
        header: ({ table: rateTable }) => {
          const visible = rateTable.getFilteredRowModel().rows;
          const selectedCount = visible.filter((row) => selectedIds.has(row.original.id)).length;
          const allSelected = visible.length > 0 && selectedCount === visible.length;
          return (
            <SelectBox
              label="Select filtered laptops for the rate card"
              checked={allSelected}
              indeterminate={selectedCount > 0 && !allSelected}
              onChange={() => {
                setSelectedIds((current) => {
                  const next = new Set(current);
                  for (const row of visible) {
                    if (allSelected) next.delete(row.original.id);
                    else next.add(row.original.id);
                  }
                  return next;
                });
              }}
            />
          );
        },
        cell: ({ row }) => (
          <SelectBox
            label={`Include ${row.original.name} in the rate card`}
            checked={selectedIds.has(row.original.id)}
            onChange={() => {
              const id = row.original.id;
              setSelectedIds((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
          />
        ),
      },
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
        accessorKey: 'buyingPrice',
        header: 'Buying price',
        sortingFn: (a, b) => (a.original.buyingPrice ?? -1) - (b.original.buyingPrice ?? -1),
        cell: ({ row }) =>
          inlineEdit ? (
            <PriceInput
              label={`Buying price for ${row.original.name}`}
              allowEmpty
              value={row.original.buyingPrice}
              onCommit={(value) => commitPrice(row.original, 'buyingPrice', value)}
            />
          ) : row.original.buyingPrice == null ? (
            ''
          ) : (
            formatProposalInr(row.original.buyingPrice)
          ),
      },
      {
        accessorKey: 'monthlyRate',
        header: '1 month',
        sortingFn: (a, b) => (a.original.monthlyRate ?? -1) - (b.original.monthlyRate ?? -1),
        cell: ({ row }) =>
          inlineEdit ? (
            <PriceInput
              label={`One-month rent for ${row.original.name}`}
              allowEmpty
              value={row.original.monthlyRate}
              onCommit={(value) => commitPrice(row.original, 'monthlyRate', value)}
            />
          ) : row.original.monthlyRate == null ? (
            ''
          ) : (
            formatProposalInr(row.original.monthlyRate)
          ),
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
        cell: ({ row }) =>
          inlineEdit ? (
            <PriceInput
              label={`Deposit for ${row.original.name}`}
              allowEmpty={false}
              value={row.original.depositPerLaptop}
              onCommit={(value) => commitPrice(row.original, 'depositPerLaptop', value)}
            />
          ) : (
            formatProposalInr(row.original.depositPerLaptop)
          ),
      },
      { accessorKey: 'availability', header: 'Stock' },
      {
        id: 'edit',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <Link href={`/crm/laptops/${row.original.id}`} className="underline">
              Edit form
            </Link>
            {savingIds[row.original.id] ? (
              <span className="text-xs text-[var(--varnarc-subtle)]">Saving…</span>
            ) : null}
          </span>
        ),
      },
    ],
    [commitPrice, discounts, inlineEdit, savingIds, selectedIds],
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
      const logo = await prepareRateCardLogo(company.logoDataUrl);
      await registerVerdana(pdf);
      drawProposal(pdf, document, logo, { fontFamily: 'Verdana', textSize: 10 });
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
  const rateCardRows = filteredRows
    .filter((row) => selectedIds.has(row.original.id))
    .map((row) => row.original);
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
          <button
            type="button"
            aria-pressed={inlineEdit}
            className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium ${
              inlineEdit
                ? 'border-[var(--varnarc-brand)] bg-[var(--varnarc-brand)] text-white'
                : 'border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] hover:bg-[var(--varnarc-muted)]'
            }`}
            onClick={() => setInlineEdit((current) => !current)}
          >
            {inlineEdit ? 'Done editing' : 'Inline edit'}
          </button>
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
            disabled={rateCardRows.length === 0 || pdfPending}
            onClick={() => void exportPriceList(rateCardRows)}
          >
            {pdfPending
              ? 'Preparing PDF…'
              : rateCardRows.length > 0
                ? `Rate card PDF (${rateCardRows.length})`
                : 'Rate card PDF'}
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--varnarc-subtle)]">
        Tick the laptops to include in the rate card. The header box selects every laptop matching
        the current filters, including other pages.
        {rateCardRows.length > 0 ? (
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear selection
          </button>
        ) : null}
      </p>
      {inlineEdit ? (
        <p className="text-sm text-[var(--varnarc-subtle)]">
          Edit buying price, one-month rent, and deposit in the table. Press Enter or click away to
          save. Use Edit form for the rest of the laptop.
        </p>
      ) : null}
      {pdfError ? <p className="text-sm text-red-600">{pdfError}</p> : null}
      {priceError ? <p className="text-sm text-red-600">{priceError}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {COLUMN_FILTERS.map(([key, label]) => (
          <MultiFilter
            key={key}
            label={label}
            options={filterOptions[key]}
            selected={filters[key]}
            open={openFilter === key}
            onOpenChange={(next) => setOpenFilter(next ? key : null)}
            onChange={(selected) => {
              setFilters((current) => ({ ...current, [key]: selected }));
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          />
        ))}
        {COLUMN_FILTERS.some(([key]) => filters[key].length > 0) ? (
          <button
            type="button"
            className="h-9 rounded-md px-2 text-sm underline"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setOpenFilter(null);
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
                <tr
                  key={row.id}
                  className={`border-b border-[var(--varnarc-border)] ${
                    selectedIds.has(row.original.id) ? 'bg-[var(--varnarc-muted)]' : ''
                  }`}
                >
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

function SelectBox({
  label,
  checked,
  indeterminate = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4"
      aria-label={label}
      checked={checked}
      onChange={onChange}
    />
  );
}

function MultiFilter({
  label,
  options,
  selected,
  open,
  onOpenChange,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (selected: string[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const summary =
    selected.length === 0
      ? 'All'
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.length} selected`;

  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((value) => value !== option)
        : [...selected, option],
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex h-9 max-w-56 items-center gap-2 rounded-md border px-2 text-sm ${
          selected.length > 0
            ? 'border-[var(--varnarc-brand)] bg-[var(--varnarc-surface)] text-[var(--varnarc-ink)]'
            : 'border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] text-[var(--varnarc-subtle)]'
        }`}
        onClick={() => onOpenChange(!open)}
      >
        <span>{label}</span>
        <span className="max-w-32 truncate font-medium text-[var(--varnarc-ink)]" title={summary}>
          {summary}
        </span>
      </button>
      {open ? (
        <div className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1 text-xs text-[var(--varnarc-subtle)]">
            <span>Select one or more</span>
            {selected.length > 0 ? (
              <button type="button" className="underline" onClick={() => onChange([])}>
                Clear
              </button>
            ) : null}
          </div>
          <div
            className="max-h-64 overflow-auto"
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
          >
            {options.length === 0 ? (
              <p className="px-1 py-2 text-sm text-[var(--varnarc-subtle)]">No options</p>
            ) : (
              options.map((option) => {
                const checked = selected.includes(option);
                return (
                  <label
                    key={option}
                    className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-[var(--varnarc-muted)]"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={checked}
                      role="option"
                      aria-selected={checked}
                      onChange={() => toggle(option)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
