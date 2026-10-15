import type { DocumentBlock, DocumentEditorial, DocumentField, DocumentItemField } from './schema';

export type RenderedBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; caption?: string; headers?: string[]; rows: string[][] }
  | { type: 'signature'; label: string; name?: string }
  | { type: 'spacer' }
  | { type: 'pageBreak' };

export type RenderedDocument = {
  title: string;
  blocks: RenderedBlock[];
  html: string;
};

export type FieldError = { field: string; message: string };

const TOKEN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const BUILT_INS = new Set(['today']);

export function formatDocumentInr(value: number, style: 'symbol' | 'rs' = 'symbol'): string {
  if (!Number.isFinite(value)) return '';
  const negative = value < 0;
  const [wholeRaw, frac] = Math.abs(value).toFixed(2).split('.');
  const whole = wholeRaw ?? '0';
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const head = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = head ? `${head},${last3}` : last3;
  const prefix = style === 'symbol' ? '₹' : 'Rs. ';
  return `${negative ? '-' : ''}${prefix}${grouped}.${frac ?? '00'}`;
}

export function formatDocumentDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return '';
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizePlainText(value: string, max = 5000): string {
  const withoutControls = [...value]
    .filter((char) => {
      const code = char.charCodeAt(0);
      if (code === 0x09 || code === 0x0a || code === 0x0d) return true;
      return code >= 0x20 && code !== 0x7f;
    })
    .join('');
  return withoutControls
    .replace(/\s+/g, (chunk) => (chunk.includes('\n') ? '\n' : ' '))
    .trim()
    .slice(0, max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function isDocumentFieldVisible(
  field: DocumentField,
  values: Record<string, unknown>,
): boolean {
  if (!field.visibleWhen) return true;
  return String(values[field.visibleWhen.field] ?? '') === field.visibleWhen.equals;
}

function optionLabel(field: DocumentField | DocumentItemField, value: string): string {
  return field.options?.find((option) => option.value === value)?.label ?? value;
}

function displayScalar(
  field: DocumentField | DocumentItemField,
  raw: unknown,
  currencyStyle: 'symbol' | 'rs',
): string {
  if (raw == null) return '';
  if (field.type === 'checkbox') {
    const on = raw === true || raw === 'true' || raw === 'yes' || raw === 'on';
    return on ? 'Yes' : 'No';
  }
  if (typeof raw === 'number') {
    if (field.type === 'currency') return formatDocumentInr(raw, currencyStyle);
    return String(raw);
  }
  if (typeof raw !== 'string') return '';
  const text = sanitizePlainText(
    raw,
    field.type === 'textarea' || field.type === 'address' ? 5000 : 500,
  );
  if (!text) return '';
  if (field.type === 'date') return formatDocumentDate(text) || text;
  if (field.type === 'currency' || field.type === 'number') {
    const amount = Number(text.replace(/,/g, ''));
    if (!Number.isFinite(amount)) return '';
    return field.type === 'currency' ? formatDocumentInr(amount, currencyStyle) : String(amount);
  }
  if (field.type === 'select' || field.type === 'radio') return optionLabel(field, text);
  return text;
}

function lookup(
  token: string,
  values: Record<string, unknown>,
  fields: DocumentField[],
  item: Record<string, unknown> | null,
  itemFields: DocumentItemField[] | null,
  currencyStyle: 'symbol' | 'rs',
): string {
  if (token === 'today') return formatDocumentDate(new Date().toISOString().slice(0, 10));
  if (token.startsWith('item.')) {
    const key = token.slice(5);
    const field = itemFields?.find((candidate) => candidate.key === key);
    if (!field || !item) return '';
    return displayScalar(field, item[key], currencyStyle);
  }
  const field = fields.find((candidate) => candidate.key === token);
  if (!field || field.type === 'repeat') return '';
  if (!isDocumentFieldVisible(field, values)) return '';
  return displayScalar(field, values[token], currencyStyle);
}

function interpolate(
  template: string,
  values: Record<string, unknown>,
  fields: DocumentField[],
  item: Record<string, unknown> | null,
  itemFields: DocumentItemField[] | null,
  currencyStyle: 'symbol' | 'rs',
): string {
  return template.replace(TOKEN, (_match, token: string) => {
    if (
      BUILT_INS.has(token) ||
      token.startsWith('item.') ||
      fields.some((field) => field.key === token)
    ) {
      return lookup(token, values, fields, item, itemFields, currencyStyle);
    }
    return '';
  });
}

function isBlank(text: string): boolean {
  return !/[\p{L}\p{N}]/u.test(text);
}

function validateScalar(
  field: DocumentField | DocumentItemField,
  raw: unknown,
  path: string,
  required: boolean,
): FieldError | null {
  const empty =
    raw == null ||
    raw === '' ||
    (typeof raw === 'string' && raw.trim() === '') ||
    (field.type === 'checkbox' && raw !== true && raw !== 'true' && raw !== 'yes' && raw !== 'on');
  if (field.type === 'checkbox') {
    if (required && empty) return { field: path, message: `${field.label} is required.` };
    return null;
  }
  if (empty) {
    return required ? { field: path, message: `${field.label} is required.` } : null;
  }
  const text = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw.trim() : '';
  if (!text && typeof raw !== 'number') {
    return required ? { field: path, message: `${field.label} is required.` } : null;
  }
  const maxLength =
    field.validation?.maxLength ??
    (field.type === 'textarea' || field.type === 'address' ? 2000 : 200);
  if (text.length > maxLength) {
    return { field: path, message: `${field.label} is too long.` };
  }
  if (field.validation?.minLength && text.length < field.validation.minLength) {
    return { field: path, message: `${field.label} is too short.` };
  }
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return { field: path, message: `Enter a valid email for ${field.label}.` };
  }
  if (field.type === 'phone' && !/^\+?[0-9][0-9\s()-]{7,18}$/.test(text)) {
    return { field: path, message: `Enter a valid phone number for ${field.label}.` };
  }
  if (field.type === 'date' && !formatDocumentDate(text)) {
    return { field: path, message: `Enter a valid date for ${field.label}.` };
  }
  if (field.type === 'number' || field.type === 'currency') {
    const amount = typeof raw === 'number' ? raw : Number(text.replace(/,/g, ''));
    if (!Number.isFinite(amount))
      return { field: path, message: `${field.label} must be a number.` };
    if (field.validation?.min != null && amount < field.validation.min) {
      return { field: path, message: `${field.label} is below the minimum.` };
    }
    if (field.validation?.max != null && amount > field.validation.max) {
      return { field: path, message: `${field.label} is above the maximum.` };
    }
    if (field.type === 'currency' && field.validation?.min == null && amount < 0) {
      return { field: path, message: `${field.label} cannot be negative.` };
    }
  }
  if ((field.type === 'select' || field.type === 'radio') && field.options?.length) {
    if (!field.options.some((option) => option.value === text)) {
      return { field: path, message: `Choose a valid option for ${field.label}.` };
    }
  }
  if (field.validation?.pattern && text) {
    try {
      if (!new RegExp(field.validation.pattern).test(text)) {
        return { field: path, message: `${field.label} is not in the expected format.` };
      }
    } catch {
      return { field: path, message: `${field.label} could not be checked.` };
    }
  }
  return null;
}

export function validateDocumentInputs(
  fields: DocumentField[],
  values: Record<string, unknown>,
): FieldError[] {
  const errors: FieldError[] = [];
  for (const field of fields) {
    if (!isDocumentFieldVisible(field, values)) continue;
    if (field.type === 'repeat') {
      const rows = values[field.key];
      const list = Array.isArray(rows) ? rows : [];
      if (field.required && list.length === 0) {
        errors.push({ field: field.key, message: `Add at least one ${field.label}.` });
        continue;
      }
      const maxItems = field.maxItems ?? 20;
      if (list.length > maxItems) {
        errors.push({ field: field.key, message: `${field.label} has too many rows.` });
      }
      list.forEach((row, index) => {
        const record = asRecord(row);
        if (!record) {
          errors.push({
            field: `${field.key}.${index}`,
            message: `${field.label} row is invalid.`,
          });
          return;
        }
        for (const item of field.itemFields ?? []) {
          const error = validateScalar(
            item,
            record[item.key],
            `${field.key}.${index}.${item.key}`,
            item.required,
          );
          if (error) errors.push(error);
        }
      });
      continue;
    }
    const error = validateScalar(field, values[field.key], field.key, field.required);
    if (error) errors.push(error);
  }
  return errors;
}

export function pickDocumentInputs(
  fields: DocumentField[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const field of fields) {
    if (!isDocumentFieldVisible(field, values)) continue;
    if (field.type === 'repeat') {
      const rows = Array.isArray(values[field.key]) ? values[field.key] : [];
      picked[field.key] = (rows as unknown[]).slice(0, field.maxItems ?? 20).map((row) => {
        const record = asRecord(row) ?? {};
        const item: Record<string, unknown> = {};
        for (const child of field.itemFields ?? []) item[child.key] = record[child.key] ?? '';
        return item;
      });
      continue;
    }
    if (field.type === 'checkbox') {
      const raw = values[field.key];
      picked[field.key] = raw === true || raw === 'true' || raw === 'yes' || raw === 'on';
      continue;
    }
    const raw = values[field.key];
    picked[field.key] =
      typeof raw === 'number' ? raw : typeof raw === 'string' ? sanitizePlainText(raw) : '';
  }
  return picked;
}

export function blankDocumentInputs(fields: DocumentField[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'checkbox') {
      values[field.key] = false;
      continue;
    }
    if (field.type === 'repeat') {
      const row: Record<string, unknown> = {};
      for (const item of field.itemFields ?? []) row[item.key] = '________';
      values[field.key] = [row];
      continue;
    }
    if (field.type === 'select' || field.type === 'radio') {
      values[field.key] = field.options?.[0]?.value ?? '';
      continue;
    }
    values[field.key] = '________';
  }
  return values;
}

function productAmount(
  row: Record<string, unknown>,
  keys: [string, string] | undefined,
): number | null {
  if (!keys) return null;
  const left = Number(String(row[keys[0]] ?? '').replace(/,/g, ''));
  const right = Number(String(row[keys[1]] ?? '').replace(/,/g, ''));
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return Math.round(left * right * 100) / 100;
}

function renderBlocks(
  blocks: DocumentBlock[],
  values: Record<string, unknown>,
  fields: DocumentField[],
  item: Record<string, unknown> | null,
  itemFields: DocumentItemField[] | null,
  currencyStyle: 'symbol' | 'rs',
): RenderedBlock[] {
  const rendered: RenderedBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'spacer' || block.type === 'pageBreak') {
      rendered.push(block);
      continue;
    }
    if (block.type === 'repeat') {
      const field = fields.find((candidate) => candidate.key === block.field);
      const rows = Array.isArray(values[block.field]) ? (values[block.field] as unknown[]) : [];
      for (const row of rows) {
        const record = asRecord(row);
        if (!record) continue;
        rendered.push(
          ...renderBlocks(
            block.blocks,
            values,
            fields,
            record,
            field?.itemFields ?? [],
            currencyStyle,
          ),
        );
      }
      continue;
    }
    if (block.type === 'lineItems') {
      const field = fields.find((candidate) => candidate.key === block.field);
      const rows = Array.isArray(values[block.field]) ? (values[block.field] as unknown[]) : [];
      const headers = block.columns.map((column) => column.header);
      const body = rows.flatMap((row) => {
        const record = asRecord(row);
        if (!record || !field) return [];
        return [
          block.columns.map((column) => {
            if (column.product) {
              const amount = productAmount(record, column.product);
              return amount == null ? '' : formatDocumentInr(amount, currencyStyle);
            }
            const itemField = field.itemFields?.find((candidate) => candidate.key === column.key);
            if (!itemField || !column.key) return '';
            const text = displayScalar(itemField, record[column.key], currencyStyle);
            if (column.format === 'currency' && itemField.type !== 'currency') {
              const amount = Number(text.replace(/[^\d.-]/g, ''));
              return Number.isFinite(amount) ? formatDocumentInr(amount, currencyStyle) : text;
            }
            return text;
          }),
        ];
      });
      if (body.length) rendered.push({ type: 'table', headers, rows: body });
      continue;
    }
    if (block.type === 'heading') {
      const text = interpolate(block.text, values, fields, item, itemFields, currencyStyle);
      if (!isBlank(text)) rendered.push({ type: 'heading', level: block.level, text });
      continue;
    }
    if (block.type === 'paragraph') {
      const text = interpolate(block.text, values, fields, item, itemFields, currencyStyle);
      if (!isBlank(text)) rendered.push({ type: 'paragraph', text });
      continue;
    }
    if (block.type === 'list') {
      const items = block.items
        .map((itemText) => interpolate(itemText, values, fields, item, itemFields, currencyStyle))
        .filter((itemText) => !isBlank(itemText));
      if (items.length) rendered.push({ type: 'list', items });
      continue;
    }
    if (block.type === 'table') {
      const headers = block.headers?.map((header) =>
        interpolate(header, values, fields, item, itemFields, currencyStyle),
      );
      const rows = block.rows.map((row) =>
        row.map((cell) => interpolate(cell, values, fields, item, itemFields, currencyStyle)),
      );
      rendered.push({
        type: 'table',
        caption: block.caption
          ? interpolate(block.caption, values, fields, item, itemFields, currencyStyle)
          : undefined,
        headers,
        rows,
      });
      continue;
    }
    if (block.type === 'signature') {
      const label = interpolate(block.label, values, fields, item, itemFields, currencyStyle);
      const name = block.nameField
        ? lookup(block.nameField, values, fields, item, itemFields, currencyStyle)
        : undefined;
      rendered.push({ type: 'signature', label, name: name || undefined });
    }
  }
  return rendered;
}

export function renderDocument(input: {
  title: string;
  fields: DocumentField[];
  blocks: DocumentBlock[];
  values: Record<string, unknown>;
  currencyStyle?: 'symbol' | 'rs';
  disclaimer?: string | null;
}): RenderedDocument {
  const currencyStyle = input.currencyStyle ?? 'symbol';
  const values = pickDocumentInputs(input.fields, input.values);
  const blocks = renderBlocks(input.blocks, values, input.fields, null, null, currencyStyle);
  if (input.disclaimer?.trim()) {
    blocks.push({ type: 'paragraph', text: input.disclaimer.trim() });
  }
  return {
    title: sanitizePlainText(input.title, 180),
    blocks,
    html: renderedDocumentHtml({ title: input.title, blocks }),
  };
}

export function renderedDocumentHtml(document: { title: string; blocks: RenderedBlock[] }): string {
  const body = document.blocks
    .map((block) => {
      if (block.type === 'heading') {
        const tag = block.level === 1 ? 'h1' : block.level === 2 ? 'h2' : 'h3';
        return `<${tag}>${escapeHtml(block.text)}</${tag}>`;
      }
      if (block.type === 'paragraph') {
        return `<p>${escapeHtml(block.text).replace(/\n/g, '<br>')}</p>`;
      }
      if (block.type === 'list') {
        return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      }
      if (block.type === 'table') {
        const caption = block.caption ? `<caption>${escapeHtml(block.caption)}</caption>` : '';
        const head = block.headers?.length
          ? `<thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>`
          : '';
        const rows = block.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
          .join('');
        return `<table>${caption}${head}<tbody>${rows}</tbody></table>`;
      }
      if (block.type === 'signature') {
        return `<div class="signature"><div class="signature-line"></div><p>${escapeHtml(block.label)}</p>${block.name ? `<p>${escapeHtml(block.name)}</p>` : ''}</div>`;
      }
      if (block.type === 'pageBreak') return '<div class="page-break"></div>';
      return '<div class="spacer"></div>';
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(document.title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111827; font-family: "Noto Sans", "Segoe UI", sans-serif; font-size: 12pt; line-height: 1.5; }
  article { max-width: 180mm; margin: 0 auto; padding: 18mm 16mm 20mm; }
  h1 { font-size: 18pt; text-align: center; margin: 0 0 12pt; }
  h2 { font-size: 14pt; margin: 14pt 0 6pt; }
  h3 { font-size: 12pt; margin: 12pt 0 4pt; }
  p { margin: 0 0 8pt; white-space: pre-wrap; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; }
  th, td { border: 1px solid #111827; padding: 6px 8px; vertical-align: top; text-align: left; }
  th { background: #f3f4f6; }
  ul { margin: 0 0 8pt; padding-left: 18px; }
  .signature { margin-top: 28pt; }
  .signature-line { width: 220px; border-bottom: 1px solid #111827; height: 36px; }
  .page-break { break-before: page; page-break-before: always; }
  .spacer { height: 12pt; }
  footer { margin-top: 24pt; font-size: 9pt; color: #4b5563; }
  @media print {
    article { padding: 0; max-width: none; }
  }
</style>
</head>
<body>
<article>
${body}
<footer>Sample generated on Varnarc for personal use. It is not a government certificate, seal, or legal advice.</footer>
</article>
</body>
</html>`;
}

export function documentPlainText(document: { title: string; blocks: RenderedBlock[] }): string {
  const lines = [document.title, ''];
  for (const block of document.blocks) {
    if (block.type === 'heading') lines.push(block.text, '');
    else if (block.type === 'paragraph') lines.push(block.text, '');
    else if (block.type === 'list') lines.push(...block.items.map((item) => `• ${item}`), '');
    else if (block.type === 'table') {
      if (block.caption) lines.push(block.caption);
      if (block.headers?.length) lines.push(block.headers.join(' | '));
      for (const row of block.rows) lines.push(row.join(' | '));
      lines.push('');
    } else if (block.type === 'signature') {
      lines.push('________________________', block.label, block.name ?? '', '');
    } else if (block.type === 'pageBreak') lines.push('', '— page —', '');
  }
  return lines.join('\n').trim();
}

export type PublicDocumentCard = {
  slug: string;
  name: string;
  shortDescription: string;
  categorySlug: string;
  categoryName: string;
  templateType: string;
  isFree: boolean;
  requiresReview: boolean;
};

export function editorialOrEmpty(value: unknown): DocumentEditorial | null {
  if (!value || typeof value !== 'object') return null;
  return value as DocumentEditorial;
}
