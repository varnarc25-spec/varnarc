'use client';

import { useState } from 'react';
import type {
  DocumentBlock,
  DocumentEditorial,
  DocumentFaq,
  DocumentField,
} from '@varnarc/validation';

type TemplateRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  templateType: string;
  status: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  legalDisclaimer: string | null;
  officialSourceUrl: string | null;
  requiresReview: boolean;
  isFree: boolean;
  formSchema: { fields: DocumentField[] };
  templateContent: { blocks: DocumentBlock[] };
  editorial: DocumentEditorial;
  seo?: { focusKeyword: string; secondaryKeywords: string[]; faqContent: DocumentFaq[] } | null;
  versions?: Array<{ version: number; changeNotes: string | null; createdAt: string }>;
};

export function TemplateEditor({ template }: { template: TemplateRecord }) {
  const [name, setName] = useState(template.name);
  const [slug, setSlug] = useState(template.slug);
  const [seoTitle, setSeoTitle] = useState(template.seoTitle);
  const [seoDescription, setSeoDescription] = useState(template.seoDescription);
  const [disclaimer, setDisclaimer] = useState(template.legalDisclaimer ?? '');
  const [sourceUrl, setSourceUrl] = useState(template.officialSourceUrl ?? '');
  const [fields, setFields] = useState(template.formSchema.fields ?? []);
  const [blocksText, setBlocksText] = useState(
    JSON.stringify(template.templateContent.blocks ?? [], null, 2),
  );
  const [message, setMessage] = useState<string | null>(null);

  async function save(status?: string) {
    let blocks: DocumentBlock[];
    try {
      blocks = JSON.parse(blocksText) as DocumentBlock[];
    } catch {
      setMessage('Template blocks must be valid JSON.');
      return;
    }
    const response = await fetch(`/api/admin/documents/templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        seoTitle,
        seoDescription,
        legalDisclaimer: disclaimer,
        officialSourceUrl: sourceUrl,
        requiresReview: template.requiresReview,
        fields,
        blocks,
        status,
        editorial: template.editorial,
        faqs: template.seo?.faqContent ?? [],
        focusKeyword: template.seo?.focusKeyword ?? name,
        secondaryKeywords: template.seo?.secondaryKeywords ?? [],
        shortDescription: template.shortDescription,
        fullDescription: template.fullDescription,
        templateType: template.templateType,
        categoryId: template.categoryId,
        isFree: template.isFree,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    setMessage(
      response.ok ? 'Saved as a new version.' : (payload?.error?.message ?? 'Save failed.'),
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {message ? <p className="rounded border border-slate-200 px-3 py-2">{message}</p> : null}
      <label className="block">
        Name
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block">
        Slug
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      <label className="block">
        SEO title
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value)}
        />
      </label>
      <label className="block">
        SEO description
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
        />
      </label>
      <label className="block">
        Disclaimer
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          value={disclaimer}
          onChange={(event) => setDisclaimer(event.target.value)}
        />
      </label>
      <label className="block">
        Official source URL
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
        />
      </label>
      <fieldset className="space-y-3 rounded border border-slate-200 p-3">
        <legend className="px-1 font-medium">Form fields</legend>
        {fields.map((field, index) => (
          <div key={field.key} className="grid gap-2 sm:grid-cols-[1fr_140px_auto_auto]">
            <input
              aria-label="Label"
              className="rounded border px-2 py-1"
              value={field.label}
              onChange={(event) => updateField(index, { label: event.target.value })}
            />
            <select
              aria-label="Type"
              className="rounded border px-2 py-1"
              value={field.type}
              onChange={(event) =>
                updateField(index, { type: event.target.value as DocumentField['type'] })
              }
            >
              {[
                'text',
                'textarea',
                'number',
                'date',
                'email',
                'phone',
                'address',
                'select',
                'radio',
                'checkbox',
                'currency',
                'repeat',
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) => updateField(index, { required: event.target.checked })}
              />
              Required
            </label>
            <button
              type="button"
              className="text-red-800"
              onClick={() => setFields(fields.filter((_, item) => item !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="underline"
          onClick={() =>
            setFields([
              ...fields,
              {
                key: `field_${fields.length + 1}`,
                label: 'New field',
                type: 'text',
                required: false,
              },
            ])
          }
        >
          Add field
        </button>
      </fieldset>
      <label className="block">
        Template blocks (JSON)
        <textarea
          className="mt-1 h-64 w-full rounded border px-3 py-2 font-mono text-xs"
          value={blocksText}
          onChange={(event) => setBlocksText(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-[#0b1f3a] px-3 py-2 text-white"
          onClick={() => void save()}
        >
          Save draft version
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2"
          onClick={() => void save('REVIEW_REQUIRED')}
        >
          Mark for review
        </button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => void publish()}>
          Publish
        </button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => void archive()}>
          Archive
        </button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => void duplicate()}>
          Duplicate
        </button>
      </div>
      <section>
        <h2 className="mb-2 font-semibold">Versions</h2>
        <ul>
          {(template.versions ?? []).map((version) => (
            <li key={version.version} className="flex items-center justify-between border-b py-2">
              <span>
                v{version.version} · {version.changeNotes ?? 'Updated'}
              </span>
              <button
                type="button"
                className="underline"
                onClick={() => void rollback(version.version)}
              >
                Roll back
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  function updateField(index: number, patch: Partial<DocumentField>) {
    setFields(fields.map((field, item) => (item === index ? { ...field, ...patch } : field)));
  }

  async function publish() {
    await save();
    const response = await fetch(`/api/admin/documents/templates/${template.id}/publish`, {
      method: 'POST',
    });
    setMessage(response.ok ? 'Published.' : 'Publish failed. The template may still need fixes.');
  }

  async function archive() {
    const response = await fetch(`/api/admin/documents/templates/${template.id}/archive`, {
      method: 'POST',
    });
    setMessage(response.ok ? 'Archived.' : 'Archive failed.');
  }

  async function duplicate() {
    const response = await fetch(`/api/admin/documents/templates/${template.id}/duplicate`, {
      method: 'POST',
    });
    const payload = (await response.json().catch(() => null)) as { data?: { id?: string } } | null;
    if (response.ok && payload?.data?.id) {
      window.location.href = `/documents/templates/${payload.data.id}`;
      return;
    }
    setMessage('Duplicate failed.');
  }

  async function rollback(version: number) {
    const response = await fetch(`/api/admin/documents/templates/${template.id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
    setMessage(response.ok ? 'Rolled back to a draft. Reload to see it.' : 'Rollback failed.');
  }
}
