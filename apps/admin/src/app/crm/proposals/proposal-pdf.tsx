'use client';

import { useState } from 'react';
import type { jsPDF } from 'jspdf';
import type { LaptopRentalDocument, LaptopRentalRun } from '@varnarc/validation';

export function ProposalPdfButton({
  document: proposal,
  logoDataUrl,
}: {
  document: LaptopRentalDocument;
  logoDataUrl?: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setPending(true);
    setError(null);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      drawProposal(pdf, proposal, logoDataUrl ?? null);
      pdf.save(proposal.fileName);
    } catch {
      setError('Could not create the PDF. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void download()}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function drawProposal(
  pdf: jsPDF,
  proposal: LaptopRentalDocument,
  logoDataUrl: string | null,
) {
  const margin = 14;
  const width = 210 - margin * 2;
  let y = 16;

  const ink = () => pdf.setTextColor(15, 23, 42);
  const muted = () => pdf.setTextColor(71, 85, 105);

  function need(height: number) {
    if (y + height <= 282) return;
    pdf.addPage();
    y = 16;
  }

  function gap(amount = 3) {
    y += amount;
  }

  function heading(text: string) {
    need(8);
    ink();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(plain(text), margin, y);
    gap(6);
  }

  function paragraph(text: string, size = 10) {
    const blocks = text.split('\n');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(size);
    ink();
    for (const block of blocks) {
      const lines = pdf.splitTextToSize(plain(block), width) as string[];
      need(lines.length * 4.6);
      pdf.text(lines, margin, y);
      gap(lines.length * 4.6);
    }
    gap(1.2);
  }

  function bullets(items: string[]) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    ink();
    for (const item of items) {
      const lines = pdf.splitTextToSize(plain(item), width - 6) as string[];
      need(lines.length * 4.6 + 1);
      pdf.text('-', margin, y);
      pdf.text(lines, margin + 5, y);
      gap(lines.length * 4.6 + 1.2);
    }
  }

  function runs(parts: LaptopRentalRun[]) {
    const text = parts.map((part) => part.text).join('');
    const strong = parts.some((part) => part.strong);
    pdf.setFont('helvetica', strong ? 'bold' : 'normal');
    pdf.setFontSize(10);
    ink();
    const lines = pdf.splitTextToSize(plain(text), width - 6) as string[];
    need(lines.length * 4.6 + 1);
    pdf.setFont('helvetica', 'normal');
    pdf.text('-', margin, y);
    pdf.setFont('helvetica', strong ? 'bold' : 'normal');
    pdf.text(lines, margin + 5, y);
    gap(lines.length * 4.6 + 1.2);
  }

  function table(
    headers: string[],
    rows: string[][],
    weights: number[],
    right: boolean[],
    emphasizeLast = false,
  ) {
    const rowHeight = 8;
    const drawRow = (cells: string[], header: boolean, emphasize: boolean) => {
      need(rowHeight);
      if (header) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, y - 4.6, width, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
      } else if (emphasize) {
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, y - 4.6, width, rowHeight, 'F');
        ink();
        pdf.setFont('helvetica', 'bold');
      } else {
        ink();
        pdf.setFont('helvetica', 'normal');
      }
      pdf.setFontSize(8);
      let x = margin;
      cells.forEach((cell, index) => {
        const column = width * (weights[index] ?? 0);
        const value = (pdf.splitTextToSize(plain(cell), column - 3) as string[])[0] ?? '';
        const textX = right[index] ? x + column - 1.5 : x + 1.5;
        pdf.text(value, textX, y, { align: right[index] ? 'right' : 'left' });
        x += column;
      });
      gap(rowHeight);
    };
    drawRow(headers, true, false);
    rows.forEach((row, index) => drawRow(row, false, emphasizeLast && index === rows.length - 1));
    gap(2);
  }

  function wrapTable(headers: string[], body: string[][], weights: number[]) {
    const lineHeight = 3.2;
    const drawRow = (cells: string[], header: boolean) => {
      pdf.setFont('helvetica', header ? 'bold' : 'normal');
      pdf.setFontSize(7);
      const wrapped = cells.map((cell, index) => {
        const column = width * (weights[index] ?? 0);
        return pdf.splitTextToSize(plain(cell), Math.max(8, column - 2)) as string[];
      });
      const lineCount = Math.min(3, Math.max(1, ...wrapped.map((lines) => lines.length)));
      const rowHeight = lineCount * lineHeight + 2.2;
      need(rowHeight);
      if (header) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, y - 3.4, width, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255);
      } else {
        ink();
      }
      let x = margin;
      wrapped.forEach((lines, index) => {
        const column = width * (weights[index] ?? 0);
        const shown = lines.slice(0, 3);
        shown.forEach((line, lineIndex) => {
          const textX = index === 0 ? x + 1.2 : x + column - 1.2;
          pdf.text(line, textX, y + lineIndex * lineHeight, {
            align: index === 0 ? 'left' : 'right',
          });
        });
        x += column;
      });
      gap(rowHeight);
    };
    drawRow(headers, true);
    body.forEach((row) => drawRow(row, false));
    gap(2);
  }

  ink();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  muted();
  pdf.text(proposal.kicker, margin, y);
  if (logoDataUrl?.startsWith('data:image/')) {
    try {
      const kind = logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(logoDataUrl, kind, 210 - margin - 28, y - 4, 28, 12);
    } catch {
      // A logo that jsPDF cannot draw still leaves the proposal readable.
    }
  }
  gap(7);
  ink();
  pdf.setFontSize(16);
  const title = pdf.splitTextToSize(plain(proposal.headline), width) as string[];
  pdf.text(title, margin, y);
  gap(title.length * 7);

  pdf.setFontSize(10);
  const meta = [
    ['Prepared for', proposal.preparedFor],
    ['Prepared by', proposal.preparedBy],
    ['Date', proposal.dateLabel],
    ['Proposal no.', proposal.proposalNumber],
  ];
  for (const [label, value] of meta) {
    need(5);
    muted();
    pdf.setFont('helvetica', 'normal');
    pdf.text(label ?? '', margin, y);
    ink();
    pdf.setFont('helvetica', 'bold');
    pdf.text(plain(value ?? ''), margin + 32, y);
    gap(5);
  }
  gap(2);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, margin + width, y);
  gap(8);

  heading('1. Proposal');
  proposal.intro.forEach((item) => paragraph(item));

  heading('2. Proposed Laptop Specification');
  table(
    ['Specification', 'Details'],
    proposal.specifications.map((row) => [row.label, row.value]),
    [0.32, 0.68],
    [false, false],
  );
  if (proposal.assignedLaptops.length > 0) {
    paragraph('Laptops on this proposal');
    proposal.assignedLaptops.forEach((laptop) => paragraph(laptop));
  }

  heading('3. Rental Pricing');
  if (proposal.modelRates && proposal.modelRates.rows.length > 0) {
    const count = proposal.modelRates.headers.length;
    const nameWeight = 0.3;
    const rest = count > 1 ? (1 - nameWeight) / (count - 1) : 1;
    wrapTable(proposal.modelRates.headers, proposal.modelRates.rows, [
      nameWeight,
      ...Array.from({ length: Math.max(0, count - 1) }, () => rest),
    ]);
  } else {
    table(
      ['Rental Plan', 'Per Laptop', 'Qty', 'Monthly Rental'],
      proposal.plans.map((plan) => [plan.name, plan.perLaptop, plan.quantity, plan.monthly]),
      [0.34, 0.24, 0.14, 0.28],
      [false, true, true, true],
    );
  }
  paragraph(`GST: ${proposal.gstNote}`);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  ink();
  need(6);
  pdf.text('Recommended Plan', margin, y);
  gap(6);
  for (const row of proposal.recommended) {
    if (row.amount) {
      paragraph(row.label, 10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      ink();
      need(6);
      pdf.text(plain(row.amount), margin, y);
      gap(6);
      continue;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    ink();
    const lines = pdf.splitTextToSize(plain(row.label), width) as string[];
    need(lines.length * 5);
    pdf.text(lines, margin, y);
    gap(lines.length * 5 + 1);
  }

  heading('4. Security Deposit');
  paragraph(
    proposal.depositIntro ??
      `A refundable security deposit of ${proposal.depositRows[0]?.value ?? ''} per laptop is applicable.`,
  );
  table(
    ['Description', 'Amount'],
    proposal.depositRows.map((row) => [row.label, row.value]),
    [0.72, 0.28],
    [false, true],
    true,
  );
  paragraph(proposal.depositNote);

  heading('5. Services Included');
  bullets(proposal.services);

  heading('6. Support & Replacement');
  proposal.support.forEach((item) => paragraph(item));

  heading('7. Customer Responsibilities');
  paragraph(proposal.responsibilitiesIntro);
  bullets(proposal.responsibilities);

  heading('8. Payment Terms');
  proposal.paymentTerms.forEach((parts) => runs(parts));

  heading('9. Return of Equipment');
  paragraph(proposal.returnIntro);
  paragraph(proposal.returnInspectLabel);
  bullets(proposal.returnChecks);
  paragraph(proposal.wearNote);

  heading('10. Acceptance');
  proposal.acceptance.forEach((item) => paragraph(item));
  gap(2);
  need(36);
  const column = width / 2 - 4;
  drawSignature(
    pdf,
    margin,
    y,
    column,
    proposal.signatures.customerHeading,
    proposal.signatures.customerName,
    proposal.signatures.customerDesignation,
  );
  drawSignature(
    pdf,
    margin + width / 2 + 4,
    y,
    column,
    proposal.signatures.issuerHeading,
    proposal.signatures.issuerName,
    proposal.signatures.issuerDesignation,
  );
  gap(36);

  need(22);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, margin + width, y);
  gap(5);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  ink();
  pdf.text(plain(proposal.footer.name), margin, y);
  gap(4.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  muted();
  for (const line of proposal.footer.addressLines) {
    pdf.text(plain(line), margin, y);
    gap(4);
  }
  if (proposal.footer.contact) {
    pdf.text(plain(proposal.footer.contact), margin, y);
    gap(4);
  }
  if (proposal.footer.gstin) {
    pdf.text(plain(`GSTIN: ${proposal.footer.gstin}`), margin, y);
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Page ${page} of ${pages}`, 210 - margin, 290, { align: 'right' });
  }
}

function drawSignature(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  heading: string,
  name: string,
  designation: string,
) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  const title = (pdf.splitTextToSize(plain(heading), width) as string[])[0] ?? '';
  pdf.text(title, x, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Name: ${name || '________________'}`, x, y + 8);
  pdf.text(`Designation: ${designation || '________________'}`, x, y + 14);
  pdf.text('Signature: ________________', x, y + 20);
  pdf.text('Date: ________________', x, y + 26);
}

function plain(value: string) {
  return value.replaceAll('₹', 'Rs. ').replaceAll('–', '-');
}
