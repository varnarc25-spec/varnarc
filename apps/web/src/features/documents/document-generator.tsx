'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  isDocumentFieldVisible,
  renderDocument,
  validateDocumentInputs,
  type DocumentBlock,
  type DocumentField,
  type DocumentFileFormat,
} from '@varnarc/validation';
import { DocumentPreview } from '@/features/documents/document-preview';

type RepeatRow = Record<string, string>;

export function DocumentGenerator({
  slug,
  title,
  fields,
  blocks,
  disclaimer,
  canSave,
  initialValues,
  savedId,
}: {
  slug: string;
  title: string;
  fields: DocumentField[];
  blocks: DocumentBlock[];
  disclaimer?: string | null;
  canSave: boolean;
  initialValues?: Record<string, unknown>;
  savedId?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...emptyValues(fields),
    ...(initialValues ?? {}),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<DocumentFileFormat | 'save' | null>(null);

  const visibleFields = fields.filter((field) => isDocumentFieldVisible(field, values));
  const required = visibleFields.filter((field) => field.required);
  const filled = required.filter((field) => isFilled(field, values)).length;
  const preview = useMemo(
    () =>
      renderDocument({
        title,
        fields,
        blocks,
        values,
        disclaimer,
      }),
    [blocks, disclaimer, fields, title, values],
  );

  function setField(key: string, value: unknown) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next = Object.fromEntries(
      validateDocumentInputs(fields, values).map((error) => [error.field, error.message]),
    );
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function download(format: DocumentFileFormat, blank = false) {
    if (!blank && !validate()) {
      setStatus('Fix the fields marked below before downloading.');
      return;
    }
    setBusy(format);
    setStatus(null);
    try {
      const response = await fetch('/api/documents/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, format, inputs: values, blank }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { message?: string; details?: Array<{ field: string; message: string }> };
        } | null;
        if (payload?.error?.details?.length) {
          setErrors(
            Object.fromEntries(payload.error.details.map((item) => [item.field, item.message])),
          );
        }
        setStatus(payload?.error?.message ?? 'The file could not be created.');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${slug}.${format.toLowerCase()}`;
      link.click();
      URL.revokeObjectURL(url);
      void fetch('/api/documents/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'download', templateSlug: slug, format }),
      });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!validate()) {
      setStatus('Fix the fields marked below before saving.');
      return;
    }
    setBusy('save');
    setStatus(null);
    const response = await fetch(
      savedId ? `/api/documents/saved/${savedId}` : '/api/documents/save',
      {
        method: savedId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          savedId ? { inputs: values, title } : { templateSlug: slug, inputs: values, title },
        ),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      data?: { id?: string };
      error?: { message?: string };
    } | null;
    setBusy(null);
    if (!response.ok || !payload?.data?.id) {
      setStatus(payload?.error?.message ?? 'The document could not be saved.');
      return;
    }
    window.location.href = `/account/documents/${payload.data.id}`;
  }

  function reset() {
    if (!window.confirm('Clear every field in this form?')) return;
    setValues(emptyValues(fields));
    setErrors({});
    setStatus(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void download('PDF');
        }}
        noValidate
      >
        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            {filled} of {required.length} required fields completed
          </p>
          <button type="button" className="underline" onClick={reset}>
            Reset
          </button>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-slate-100">
          <div
            className="h-full bg-[#f97316]"
            style={{
              width: required.length ? `${Math.round((filled / required.length) * 100)}%` : '0%',
            }}
          />
        </div>
        {status ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {status}
          </p>
        ) : null}
        {visibleFields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            value={values[field.key]}
            error={errors[field.key]}
            errors={errors}
            onChange={(value) => setField(field.key, value)}
          />
        ))}
        <div className="hidden flex-wrap gap-2 lg:flex">
          <ActionButtons busy={busy} canSave={canSave} onDownload={download} onSave={save} />
        </div>
      </form>
      <div id="document-preview" className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-3 text-sm font-medium text-slate-600">Preview</p>
        <DocumentPreview title={preview.title} blocks={preview.blocks} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-slate-200 bg-white p-3 lg:hidden">
        <a
          href="#document-preview"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
        >
          Preview
        </a>
        <button
          type="button"
          className="flex-1 rounded-md bg-[#0b1f3a] px-3 py-2 text-sm text-white disabled:opacity-60"
          disabled={busy !== null}
          onClick={() => void download('PDF')}
        >
          PDF
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
          disabled={busy !== null}
          onClick={() => void download('DOCX')}
        >
          Word
        </button>
      </div>
    </div>
  );
}

function ActionButtons({
  busy,
  canSave,
  onDownload,
  onSave,
}: {
  busy: DocumentFileFormat | 'save' | null;
  canSave: boolean;
  onDownload: (format: DocumentFileFormat, blank?: boolean) => Promise<void>;
  onSave: () => Promise<void>;
}) {
  return (
    <>
      <button
        type="submit"
        className="rounded-md bg-[#0b1f3a] px-4 py-2 text-sm text-white"
        disabled={busy !== null}
      >
        {busy === 'PDF' ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      <button
        type="button"
        className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        disabled={busy !== null}
        onClick={() => void onDownload('DOCX')}
      >
        {busy === 'DOCX' ? 'Preparing Word…' : 'Download Word'}
      </button>
      <button
        type="button"
        className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        disabled={busy !== null}
        onClick={() => void onDownload('HTML')}
      >
        Print HTML
      </button>
      <button
        type="button"
        className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        disabled={busy !== null}
        onClick={() => void onDownload('PDF', true)}
      >
        Blank PDF
      </button>
      {canSave ? (
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          disabled={busy !== null}
          onClick={() => void onSave()}
        >
          {busy === 'save' ? 'Saving…' : 'Save to my account'}
        </button>
      ) : (
        <a
          href="/auth/login?returnTo=/documents"
          className="self-center text-sm text-[#0b1f3a] underline"
        >
          Sign in to save
        </a>
      )}
    </>
  );
}

function FieldControl({
  field,
  value,
  error,
  errors,
  onChange,
}: {
  field: DocumentField;
  value: unknown;
  error?: string;
  errors: Record<string, string>;
  onChange: (value: unknown) => void;
}) {
  const describedBy = error
    ? `${field.key}-error`
    : field.helpText
      ? `${field.key}-help`
      : undefined;
  const label = (
    <label htmlFor={field.key} className="mb-1 block text-sm font-medium text-slate-800">
      {field.label}
      {field.required ? <span className="text-red-700"> *</span> : null}
    </label>
  );
  let control: ReactNode;
  if (field.type === 'textarea' || field.type === 'address') {
    control = (
      <textarea
        id={field.key}
        className={inputClass(Boolean(error))}
        rows={field.type === 'address' ? 3 : 4}
        value={typeof value === 'string' ? value : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  } else if (field.type === 'select') {
    control = (
      <select
        id={field.key}
        className={inputClass(Boolean(error))}
        value={typeof value === 'string' ? value : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'radio') {
    control = (
      <div id={field.key} className="space-y-1" role="radiogroup" aria-describedby={describedBy}>
        {field.options?.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={field.key}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  } else if (field.type === 'checkbox') {
    control = (
      <label className="flex items-center gap-2 text-sm">
        <input
          id={field.key}
          type="checkbox"
          checked={value === true}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.checked)}
        />
        {field.label}
      </label>
    );
  } else if (field.type === 'repeat') {
    const rows = Array.isArray(value) ? (value as RepeatRow[]) : [];
    control = (
      <div className="space-y-3">
        {rows.map((row, index) => (
          <fieldset key={index} className="space-y-2 rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-xs text-slate-500">
              {field.label} {index + 1}
            </legend>
            {field.itemFields?.map((item) => (
              <div key={item.key}>
                <label htmlFor={`${field.key}-${index}-${item.key}`} className="mb-1 block text-sm">
                  {item.label}
                </label>
                <input
                  id={`${field.key}-${index}-${item.key}`}
                  className={inputClass(Boolean(error))}
                  value={row[item.key] ?? ''}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => {
                    const next = rows.map((candidate, rowIndex) =>
                      rowIndex === index
                        ? { ...candidate, [item.key]: event.target.value }
                        : candidate,
                    );
                    onChange(next);
                  }}
                />
                {errors[`${field.key}.${index}.${item.key}`] ? (
                  <p className="mt-1 text-sm text-red-700">
                    {errors[`${field.key}.${index}.${item.key}`]}
                  </p>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-red-800 underline"
              onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
            >
              Remove
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="text-sm font-medium text-[#0b1f3a] underline"
          onClick={() =>
            onChange([
              ...rows,
              Object.fromEntries((field.itemFields ?? []).map((item) => [item.key, ''])),
            ])
          }
        >
          Add {field.label}
        </button>
      </div>
    );
  } else {
    control = (
      <input
        id={field.key}
        className={inputClass(Boolean(error))}
        type={
          field.type === 'date'
            ? 'date'
            : field.type === 'email'
              ? 'email'
              : field.type === 'number' || field.type === 'currency'
                ? 'text'
                : 'text'
        }
        inputMode={
          field.type === 'currency' || field.type === 'number' || field.type === 'phone'
            ? 'decimal'
            : undefined
        }
        value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <div>
      {field.type === 'checkbox' ? null : label}
      {control}
      {field.helpText ? (
        <p id={`${field.key}-help`} className="mt-1 text-xs text-slate-500">
          {field.helpText}
        </p>
      ) : null}
      {error && !error.includes('.') ? (
        <p id={`${field.key}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm ${invalid ? 'border-red-500' : 'border-slate-300'}`;
}

function emptyValues(fields: DocumentField[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'checkbox') values[field.key] = false;
    else if (field.type === 'repeat') values[field.key] = [];
    else values[field.key] = field.defaultValue ?? '';
  }
  return values;
}

function isFilled(field: DocumentField, values: Record<string, unknown>) {
  const value = values[field.key];
  if (field.type === 'repeat') return Array.isArray(value) && value.length > 0;
  if (field.type === 'checkbox') return value === true;
  return String(value ?? '').trim().length > 0;
}
