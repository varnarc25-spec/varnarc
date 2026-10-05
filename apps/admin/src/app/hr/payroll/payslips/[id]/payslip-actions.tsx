'use client';

import { useState } from 'react';
import type { jsPDF } from 'jspdf';

export type PayslipPdf = {
  fileName: string;
  companyName: string;
  addressLines: string[];
  contact: string;
  gstin: string;
  logoDataUrl: string | null;
  initials: string;
  periodTitle: string;
  identity: Array<[string, string, string, string]>;
  earnings: Array<[string, string]>;
  deductions: Array<[string, string]>;
  gross: string;
  deductionTotal: string;
  net: string;
  words: string;
  ytdGross: string;
  ytdDeductions: string;
  ytdTaxable: string;
  ytdTax: string;
  generatedOn: string;
};

export function PayslipActions({
  payslipId,
  employeeEmail,
  pdf: documentPdf,
}: {
  payslipId: string;
  employeeEmail: string | null;
  pdf: PayslipPdf;
}) {
  const [pending, setPending] = useState<'pdf' | 'email' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function buildPdf() {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    drawPayslip(pdf, documentPdf);
    return pdf;
  }

  async function download() {
    setPending('pdf');
    setError(null);
    try {
      const pdf = await buildPdf();
      pdf.save(documentPdf.fileName);
    } catch {
      setError('Could not create the PDF. Try again.');
    } finally {
      setPending(null);
    }
  }

  async function emailEmployee() {
    if (!employeeEmail) return;
    setPending('email');
    setError(null);
    setSentTo(null);
    try {
      const pdf = await buildPdf();
      const res = await fetch(`/api/admin/hr/payslips/${payslipId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: pdf.output('datauristring') }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { to?: string };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message || 'Could not send the email.');
      setSentTo(json.data?.to || employeeEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the email.');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        disabled={pending !== null}
        className="rounded-md border border-[var(--varnarc-border)] px-4 py-2 text-sm"
        onClick={() => window.print()}
      >
        Print
      </button>
      <button
        type="button"
        disabled={pending !== null}
        className="rounded-md border border-[var(--varnarc-border)] px-4 py-2 text-sm"
        onClick={() => void download()}
      >
        {pending === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      <button
        type="button"
        disabled={pending !== null || !employeeEmail}
        className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        onClick={() => void emailEmployee()}
      >
        {pending === 'email' ? 'Sending…' : 'Email employee'}
      </button>
      {employeeEmail ? null : (
        <span className="text-sm text-[var(--varnarc-subtle)]">
          Add an email on the employee to send this payslip.
        </span>
      )}
      {sentTo ? <span className="text-sm text-emerald-700">Sent to {sentTo}</span> : null}
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </div>
  );
}

function drawPayslip(pdf: jsPDF, slip: PayslipPdf) {
  const left = 12;
  const width = 186;
  let y = 12;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, 'F');

  const logo = 16;
  drawLogo(pdf, slip, left, y, logo);

  const headerLines = [
    ...slip.addressLines,
    slip.contact,
    slip.gstin ? `GSTIN: ${slip.gstin}` : '',
  ].filter(Boolean);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  const nameLines = pdf.splitTextToSize(slip.companyName, 140) as string[];
  nameLines.forEach((line, index) => {
    pdf.text(line, 105, y + 6 + index * 6, { align: 'center' });
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  headerLines.forEach((line, index) => {
    pdf.text(line, 105, y + 8 + nameLines.length * 6 + index * 4, { align: 'center' });
  });
  y += Math.max(logo, 8 + nameLines.length * 6 + headerLines.length * 4) + 6;

  pdf.setDrawColor(71, 85, 105);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  const periodWidth = pdf.getTextWidth(slip.periodTitle) + 16;
  pdf.rect((210 - periodWidth) / 2, y, periodWidth, 8);
  pdf.text(slip.periodTitle, 105, y + 5.4, { align: 'center' });
  y += 12;

  const columns = [width * 0.22, width * 0.28, width * 0.22, width * 0.28];
  for (const row of slip.identity) {
    let x = left;
    row.forEach((value, index) => {
      cell(pdf, x, y, columns[index] ?? 0, 8, value, {
        bold: index % 2 === 1,
        muted: index % 2 === 0,
      });
      x += columns[index] ?? 0;
    });
    y += 8;
  }
  y += 4;

  const amountWidth = 32;
  const labelWidth = (width - amountWidth * 2) / 2;
  const tableColumns = [labelWidth, amountWidth, labelWidth, amountWidth];
  let x = left;
  ['EARNINGS', 'AMOUNT', 'DEDUCTIONS', 'AMOUNT'].forEach((heading, index) => {
    cell(pdf, x, y, tableColumns[index] ?? 0, 8, heading, {
      bold: true,
      fill: true,
      align: index % 2 === 1 ? 'right' : 'left',
    });
    x += tableColumns[index] ?? 0;
  });
  y += 8;

  const rowCount = Math.max(slip.earnings.length, slip.deductions.length);
  for (let index = 0; index < rowCount; index += 1) {
    const earning = slip.earnings[index];
    const deduction = slip.deductions[index];
    const values = [
      earning?.[0] ?? '',
      earning?.[1] ?? '',
      deduction?.[0] ?? '',
      deduction?.[1] ?? '',
    ];
    x = left;
    values.forEach((value, column) => {
      cell(pdf, x, y, tableColumns[column] ?? 0, 7, value, {
        align: column % 2 === 1 ? 'right' : 'left',
      });
      x += tableColumns[column] ?? 0;
    });
    y += 7;
  }
  x = left;
  ['TOTAL EARNINGS', slip.gross, 'TOTAL DEDUCTIONS', slip.deductionTotal].forEach(
    (value, index) => {
      cell(pdf, x, y, tableColumns[index] ?? 0, 8, value, {
        bold: true,
        fill: true,
        align: index % 2 === 1 ? 'right' : 'left',
      });
      x += tableColumns[index] ?? 0;
    },
  );
  y += 12;

  const summaryLabel = width * 0.7;
  for (const [label, value] of [
    ['GROSS SALARY (A)', slip.gross],
    ['TOTAL DEDUCTIONS (B)', slip.deductionTotal],
    ['NET SALARY (A - B)', slip.net],
  ] as const) {
    cell(pdf, left, y, summaryLabel, 8, label, { bold: true });
    cell(pdf, left + summaryLabel, y, width - summaryLabel, 8, value, {
      bold: true,
      align: 'right',
    });
    y += 8;
  }

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Amount in Words: ', left, y);
  pdf.setFont('helvetica', 'normal');
  const labelWidthWords = pdf.getTextWidth('Amount in Words: ');
  const wordLines = pdf.splitTextToSize(slip.words, width - labelWidthWords) as string[];
  wordLines.forEach((line, index) => {
    pdf.text(line, left + (index === 0 ? labelWidthWords : 0), y + index * 4);
  });
  y += wordLines.length * 4 + 6;

  cell(pdf, left, y, width, 7, 'YEAR TO DATE', { bold: true, fill: true, align: 'center' });
  y += 7;
  const ytdWidth = width / 4;
  ['YTD GROSS PAY', 'YTD TOTAL DEDUCTIONS', 'YTD TAXABLE PAY', 'YTD INCOME TAX'].forEach(
    (heading, index) => {
      cell(pdf, left + index * ytdWidth, y, ytdWidth, 8, heading, {
        align: 'center',
        muted: true,
        size: 7,
      });
    },
  );
  y += 8;
  [slip.ytdGross, slip.ytdDeductions, slip.ytdTaxable, slip.ytdTax].forEach((value, index) => {
    cell(pdf, left + index * ytdWidth, y, ytdWidth, 8, value, {
      align: 'center',
      bold: true,
      size: 8,
    });
  });
  y += 16;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('This is a computer generated payslip and does not require a signature', left, y);
  pdf.text(`Generated On: ${slip.generatedOn}`, left + width, y, { align: 'right' });
}

function drawLogo(pdf: jsPDF, slip: PayslipPdf, x: number, y: number, size: number) {
  if (slip.logoDataUrl) {
    try {
      const format =
        slip.logoDataUrl.includes('image/jpeg') || slip.logoDataUrl.includes('image/jpg')
          ? 'JPEG'
          : slip.logoDataUrl.includes('image/webp')
            ? 'WEBP'
            : 'PNG';
      pdf.addImage(slip.logoDataUrl, format, x + 1, y + 1, size - 2, size - 2);
      return;
    } catch {
      // Fall through to initials when the logo cannot be embedded.
    }
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(slip.initials, x + size / 2, y + size / 2 + 1, { align: 'center' });
}

function cell(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  options: {
    align?: 'left' | 'right' | 'center';
    bold?: boolean;
    fill?: boolean;
    muted?: boolean;
    size?: number;
  },
) {
  if (options.fill) {
    pdf.setFillColor(224, 242, 254);
    pdf.rect(x, y, w, h, 'F');
  }
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.2);
  pdf.rect(x, y, w, h);
  pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
  pdf.setFontSize(options.size ?? 8);
  pdf.setTextColor(options.muted ? 71 : 15, options.muted ? 85 : 23, options.muted ? 105 : 42);
  const align = options.align ?? 'left';
  const pad = 1.8;
  const tx = align === 'right' ? x + w - pad : align === 'center' ? x + w / 2 : x + pad;
  const fitted =
    (pdf.splitTextToSize(text.replaceAll('₹', 'Rs. '), Math.max(w - pad * 2, 4)) as string[])[0] ??
    '';
  pdf.text(fitted, tx, y + h / 2 + 0.4, { align, baseline: 'middle' });
}
