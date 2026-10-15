'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@varnarc/ui';

type Category = { id: string; name: string };

export default function NewDocumentTemplatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/admin/documents/categories')
      .then((response) => response.json())
      .then((payload: { data?: Category[] }) => {
        const rows = payload.data ?? [];
        setCategories(rows);
        const first = rows[0];
        if (first) setCategoryId(first.id);
      });
  }, []);

  async function createTemplate() {
    const response = await fetch('/api/admin/documents/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId,
        name,
        slug,
        shortDescription: 'A draft document template that an editor still needs to complete.',
        fullDescription:
          'This draft was created in the admin panel. Complete the form fields, sample wording, and review notes before publishing.',
        templateType: 'LETTER',
        fields: [{ key: 'senderName', label: 'Your name', type: 'text', required: true }],
        blocks: [
          { type: 'heading', level: 1, text: name || 'Draft' },
          { type: 'paragraph', text: 'From {{senderName}}' },
        ],
        editorial: {
          whatItIs:
            'A draft template. Replace this explanation with an original description of the document.',
          whenRequired: 'Describe the situation in which a reader would use this document.',
          requiredInformation: ['The facts the reader must supply'],
          steps: [
            'Complete the form',
            'Read the preview',
            'Download only after checking the wording',
          ],
          sampleFormat: 'From [name]',
          considerations: ['Do not publish this draft until the wording has been reviewed.'],
          relatedTools: [],
        },
        faqs: [
          {
            question: 'Is this draft ready to use?',
            answer:
              'No. A reviewer needs to check the wording and the form before it is published.',
          },
        ],
        focusKeyword: slug.replace(/-/g, ' ') || 'draft document',
        secondaryKeywords: [],
        seoTitle: `${name || 'Draft document'} format`.slice(0, 70),
        seoDescription:
          'Draft document template. Complete the wording and review it before publishing.',
        status: 'DRAFT',
        isFree: true,
        requiresReview: true,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      data?: { id?: string };
      error?: { message?: string };
    } | null;
    if (!response.ok || !payload?.data?.id) {
      setMessage(payload?.error?.message ?? 'Could not create the template.');
      return;
    }
    router.push(`/documents/templates/${payload.data.id}`);
  }

  return (
    <div>
      <PageHeader
        title="New template"
        description="Creates a draft. Publishing stays a separate action."
      />
      {message ? <p className="mb-3 text-sm text-red-700">{message}</p> : null}
      <form
        className="max-w-xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void createTemplate();
        }}
      >
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Slug
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Category
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded bg-[#0b1f3a] px-4 py-2 text-sm text-white" type="submit">
          Create draft
        </button>
      </form>
    </div>
  );
}
