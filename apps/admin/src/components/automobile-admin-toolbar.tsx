'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@varnarc/ui';

const fieldClass =
  'h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1989 },
  (_, index) => currentYear + 1 - index,
);

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1 text-xs text-[var(--varnarc-subtle)]">
      {label}
      {children}
    </label>
  );
}

export function AutomobileListSearch({
  defaultValue,
  status,
  fuelType,
  category,
  manufacturerId,
  india,
  limit,
  year,
  yearFrom,
  yearTo,
  sort,
  bodyType,
  transmission,
  minSeats,
  minPrice,
  maxPrice,
  manufacturers,
  showVehicleFilters,
}: {
  defaultValue?: string;
  status?: string;
  fuelType?: string;
  category?: string;
  manufacturerId?: string;
  india?: string;
  limit?: string;
  year?: string;
  yearFrom?: string;
  yearTo?: string;
  sort?: string;
  bodyType?: string;
  transmission?: string;
  minSeats?: string;
  minPrice?: string;
  maxPrice?: string;
  manufacturers?: Array<{ id: string; name: string }>;
  showVehicleFilters?: boolean;
}) {
  return (
    <form className="mb-6 space-y-3" method="get">
      <div className="flex flex-wrap items-end gap-3">
        <input
          name="search"
          defaultValue={defaultValue || ''}
          placeholder="Search…"
          className="h-10 w-full max-w-md rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
        />
        {showVehicleFilters ? (
          <>
            <select
              name="manufacturerId"
              defaultValue={manufacturerId || ''}
              className="h-10 max-w-[16rem] rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
            >
              <option value="">All manufacturers</option>
              {(manufacturers ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              name="india"
              defaultValue={india || ''}
              className="h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
            >
              <option value="">India: all</option>
              <option value="yes">India only</option>
              <option value="no">Not India</option>
            </select>
            <select
              name="status"
              defaultValue={status || ''}
              className="h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              name="fuelType"
              defaultValue={fuelType || ''}
              className="h-10 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
            >
              <option value="">All fuels</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <input
              name="category"
              defaultValue={category || ''}
              placeholder="Category"
              className="h-10 w-40 rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 text-sm"
            />
            <select name="limit" defaultValue={limit || '25'} className={fieldClass}>
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </>
        ) : null}
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </div>
      {showVehicleFilters ? (
        <div className="flex flex-wrap items-end gap-3">
          <FilterField label="Year">
            <select name="year" defaultValue={year || ''} className={fieldClass}>
              <option value="">Any year</option>
              <option value="latest">
                Latest ({currentYear - 1}–{currentYear})
              </option>
              {yearOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="From year">
            <input
              name="yearFrom"
              type="number"
              min={1990}
              max={currentYear + 1}
              defaultValue={yearFrom || ''}
              placeholder="1990"
              className={`${fieldClass} w-28`}
            />
          </FilterField>
          <FilterField label="To year">
            <input
              name="yearTo"
              type="number"
              min={1990}
              max={currentYear + 1}
              defaultValue={yearTo || ''}
              placeholder={String(currentYear)}
              className={`${fieldClass} w-28`}
            />
          </FilterField>
          <FilterField label="Sort">
            <select name="sort" defaultValue={sort || ''} className={fieldClass}>
              <option value="">Recently updated</option>
              <option value="newest">Newest year</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="mileage">Mileage</option>
              <option value="featured">Featured</option>
            </select>
          </FilterField>
          <FilterField label="Body">
            <select name="bodyType" defaultValue={bodyType || ''} className={fieldClass}>
              <option value="">Any body</option>
              {['SUV', 'Hatchback', 'Sedan', 'MUV', 'Coupe', 'Convertible', 'Pickup', 'Wagon'].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </FilterField>
          <FilterField label="Transmission">
            <select name="transmission" defaultValue={transmission || ''} className={fieldClass}>
              <option value="">Any transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </FilterField>
          <FilterField label="Min seats">
            <select name="minSeats" defaultValue={minSeats || ''} className={fieldClass}>
              <option value="">Any seats</option>
              {['2', '4', '5', '6', '7', '8'].map((value) => (
                <option key={value} value={value}>
                  {value}+
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Min price">
            <input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice || ''}
              placeholder="0"
              className={`${fieldClass} w-32`}
            />
          </FilterField>
          <FilterField label="Max price">
            <input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice || ''}
              placeholder="Any"
              className={`${fieldClass} w-32`}
            />
          </FilterField>
        </div>
      ) : null}
    </form>
  );
}

type ImportResult = {
  data?: { imported?: number; skipped?: number };
  error?: { message?: string };
};

function collectImportFiles(list: FileList | null) {
  return Array.from(list ?? [])
    .filter((file) => {
      const name = file.name.toLowerCase();
      return name.endsWith('.json') || name.endsWith('.csv');
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function finishedStorageKey(entity: string) {
  return `varnarc-automobile-import-done:${entity}`;
}

function readFinishedNames(entity: string) {
  try {
    const raw = window.localStorage.getItem(finishedStorageKey(entity));
    const names = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(names)) return new Set<string>();
    return new Set(names.filter((name): name is string => typeof name === 'string'));
  } catch {
    return new Set<string>();
  }
}

export function AutomobileCsvToolbar({ entity }: { entity: string }) {
  const router = useRouter();
  const abortRef = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [finishedNames, setFinishedNames] = useState<Set<string>>(new Set());
  const [reimport, setReimport] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(
    null,
  );

  useEffect(() => {
    setFinishedNames(readFinishedNames(entity));
  }, [entity]);

  function rememberFinished(name: string) {
    const next = readFinishedNames(entity);
    next.add(name);
    window.localStorage.setItem(finishedStorageKey(entity), JSON.stringify([...next]));
    setFinishedNames(new Set(next));
  }

  function chooseFiles(list: FileList | null) {
    const next = collectImportFiles(list);
    setFiles(next);
    const known = next.filter((file) => finishedNames.has(file.name)).length;
    if (!next.length) {
      setMessage(null);
      return;
    }
    setMessage(
      known
        ? `${next.length} files selected. ${known} already finished and will be skipped. Turn on Upload again to update them.`
        : `${next.length} file${next.length === 1 ? '' : 's'} selected. Matching slugs are updated.`,
    );
  }

  async function importFiles() {
    if (!files.length || loading) return;
    abortRef.current = false;
    setLoading(true);
    setMessage(null);
    let imported = 0;
    let skipped = 0;
    let processed = 0;
    let already = 0;
    const failed: string[] = [];
    try {
      for (let index = 0; index < files.length; index += 1) {
        if (abortRef.current) break;
        const file = files[index]!;
        setProgress({ done: index, total: files.length, current: file.name });
        const skipFinished = !reimport && files.length > 1 && finishedNames.has(file.name);
        if (skipFinished) {
          already += 1;
          processed += 1;
          setProgress({ done: index + 1, total: files.length, current: `Skipped ${file.name}` });
          continue;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch(`/api/admin/automobile/import/${entity}`, {
            method: 'POST',
            body: formData,
          });
          const json = (await res.json()) as ImportResult;
          if (!res.ok) throw new Error(json.error?.message || 'Import failed');
          imported += json.data?.imported ?? 0;
          skipped += json.data?.skipped ?? 0;
          rememberFinished(file.name);
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Import failed';
          failed.push(`${file.name}: ${reason}`);
        }
        processed += 1;
        setProgress({ done: index + 1, total: files.length, current: file.name });
      }
      const stopped = abortRef.current;
      const fileCount = stopped ? `${processed} of ${files.length}` : String(files.length);
      const summary = [
        `${stopped ? 'Stopped. Imported' : 'Imported'} ${imported} rows from ${fileCount} file${
          processed === 1 ? '' : 's'
        }`,
        already ? `${already} already finished in this browser` : '',
        skipped ? `${skipped} rows skipped` : '',
        failed.length ? `${failed.length} failed` : '',
      ]
        .filter(Boolean)
        .join('. ');
      setMessage(failed.length ? `${summary}. ${failed.slice(0, 5).join(' · ')}` : summary);
      if (!stopped) {
        setFiles([]);
        setPickerKey((key) => key + 1);
      }
      router.refresh();
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  const percent = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="mb-6 space-y-3 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <a
          href={`/api/admin/automobile/export/${entity}`}
          className="inline-flex h-10 items-center rounded-md border border-[var(--varnarc-border)] px-4 text-sm font-medium hover:bg-[var(--varnarc-muted)]"
        >
          Export CSV
        </a>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">JSON or CSV files</span>
          <input
            key={`files-${pickerKey}`}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            multiple
            disabled={loading}
            onChange={(e) => chooseFiles(e.target.files)}
            className="text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-[var(--varnarc-subtle)]">
            Or a folder of JSON
          </span>
          <input
            key={`folder-${pickerKey}`}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            multiple
            disabled={loading}
            ref={(node) => {
              if (node) node.webkitdirectory = true;
            }}
            onChange={(e) => chooseFiles(e.target.files)}
            className="text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={reimport}
            disabled={loading}
            onChange={(e) => setReimport(e.target.checked)}
          />
          Upload again even if already saved
        </label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!files.length || loading}
          onClick={() => void importFiles()}
        >
          {loading
            ? 'Importing…'
            : `Import ${files.filter((file) => reimport || !finishedNames.has(file.name)).length || ''}`.trim()}
        </Button>
        {loading ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => (abortRef.current = true)}
          >
            Stop
          </Button>
        ) : null}
        <a
          href="/automobile/import"
          className="inline-flex h-10 items-center text-sm font-medium text-[var(--varnarc-brand)] hover:underline"
        >
          Merge all tables
        </a>
      </div>
      <p className="text-xs text-[var(--varnarc-subtle)]">
        JSON files are not kept on the server. A file updates vehicles that share its slug. In a
        folder upload, files that already finished are skipped unless you turn on Upload again.
      </p>
      {progress ? (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--varnarc-muted)]">
            <div className="h-full bg-[var(--varnarc-brand)]" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-sm text-[var(--varnarc-subtle)]">
            {progress.done} / {progress.total} — {progress.current}
          </p>
        </div>
      ) : null}
      {message ? <p className="text-sm text-[var(--varnarc-subtle)]">{message}</p> : null}
    </div>
  );
}
