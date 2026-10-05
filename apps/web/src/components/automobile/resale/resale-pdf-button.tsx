'use client';

import { useState } from 'react';
import type { ResaleValuationResult } from '@varnarc/validation';
import { trackAutomobileEvent } from '@/lib/automobile/analytics';
import type { ResaleFormState } from './form';
import { drawResalePdf } from './resale-pdf-draw';
import { buildResalePdfDocument } from './resale-pdf-document';

type Props = {
  result: ResaleValuationResult;
  form: ResaleFormState;
};

export function ResalePdfButton({ result, form }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setPending(true);
    setError(null);
    try {
      const { jsPDF } = await import('jspdf');
      const document = buildResalePdfDocument({
        result,
        form,
        generatedAt: new Date(),
        shareUrl: window.location.href,
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      drawResalePdf(pdf, document);
      pdf.save(document.fileName);
      trackAutomobileEvent('resale_pdf_downloaded', {
        manufacturer: form.manufacturerSlug,
        model: form.modelSlug,
        confidence_level: result.confidenceLevel,
      });
    } catch {
      setError('Could not create the PDF. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void download()}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-[#0b1f3a] disabled:opacity-60"
      >
        {pending ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      {error ? (
        <p className="basis-full text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
