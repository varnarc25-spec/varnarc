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

export type ProposalDrawOptions = {
  fontFamily?: string;
  textSize?: number;
};

export function drawProposal(
  pdf: jsPDF,
  proposal: LaptopRentalDocument,
  logoDataUrl: string | null,
  options?: ProposalDrawOptions,
) {
  const family = options?.fontFamily ?? 'helvetica';
  const bodySize = options?.textSize ?? 10;
  const tableSize = options?.textSize ?? 8;
  const priceSize = options?.textSize ?? 7;
  const isPriceList = Boolean(
    proposal.modelRates &&
    proposal.modelRates.rows.length > 0 &&
    proposal.modelRates.headers.includes('Specification'),
  );
  const margin = isPriceList ? 12 : 14;
  const width = 210 - margin * 2;
  let y = 16;
  const leading = isPriceList ? 4.7 : 4.6;
  const paragraphGap = isPriceList ? 2.8 : 1.2;
  const headingBefore = isPriceList ? 3.2 : 0;
  const headingAfter = isPriceList ? 7.4 : 6;
  if (isPriceList) pdf.setLineHeightFactor((leading * 72) / (25.4 * bodySize));

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

  let sectionStarted = false;

  function heading(text: string, keepWithNext = 0) {
    if (headingBefore > 0 && sectionStarted) gap(headingBefore);
    need((isPriceList ? 18 : 8) + keepWithNext);
    sectionStarted = true;
    ink();
    pdf.setFont(family, 'bold');
    pdf.setFontSize(12);
    pdf.text(plain(text), margin, y);
    gap(headingAfter);
  }

  function paragraph(text: string, size = bodySize) {
    const blocks = text.split('\n');
    pdf.setFont(family, 'normal');
    pdf.setFontSize(size);
    ink();
    const lineGap = size === bodySize ? leading : (size * leading) / bodySize;
    for (const block of blocks) {
      const lines = pdf.splitTextToSize(plain(block), width) as string[];
      need(lines.length * lineGap + paragraphGap);
      pdf.text(lines, margin, y, {
        lineHeightFactor: (lineGap * 72) / (25.4 * size),
      });
      gap(lines.length * lineGap);
    }
    gap(paragraphGap);
  }

  function bullets(items: string[]) {
    pdf.setFont(family, 'normal');
    pdf.setFontSize(bodySize);
    ink();
    for (const item of items) {
      const lines = pdf.splitTextToSize(plain(item), width - 6) as string[];
      const itemHeight = lines.length * leading + 1;
      if (y + itemHeight > (isPriceList ? 289 : 282)) {
        pdf.addPage();
        y = isPriceList ? 18 : 16;
      }
      pdf.text('-', margin, y);
      pdf.text(lines, margin + 5, y, {
        lineHeightFactor: (leading * 72) / (25.4 * bodySize),
      });
      gap(lines.length * leading + 1.4);
    }
  }

  function runs(parts: LaptopRentalRun[]) {
    pdf.setFontSize(bodySize);
    ink();
    const tokens = parts.flatMap((part) =>
      plain(part.text)
        .split(/(\s+)/)
        .filter((text) => text.length > 0)
        .map((text) => ({ text, strong: Boolean(part.strong) })),
    );
    const maxWidth = width - 6;
    const lines: Array<Array<{ text: string; strong: boolean }>> = [];
    let line: Array<{ text: string; strong: boolean }> = [];
    let lineWidth = 0;
    const measure = (token: { text: string; strong: boolean }) => {
      pdf.setFont(family, token.strong ? 'bold' : 'normal');
      return pdf.getTextWidth(token.text);
    };
    for (const token of tokens) {
      const tokenWidth = measure(token);
      if (line.length > 0 && lineWidth + tokenWidth > maxWidth) {
        lines.push(line);
        line = [];
        lineWidth = 0;
        if (/^\s+$/.test(token.text)) continue;
      }
      line.push(token);
      lineWidth += tokenWidth;
    }
    if (line.length > 0) lines.push(line);
    need(Math.max(1, lines.length) * leading + 1);
    pdf.setFont(family, 'normal');
    pdf.text('-', margin, y);
    lines.forEach((row, lineIndex) => {
      let x = margin + 5;
      for (const token of row) {
        pdf.setFont(family, token.strong ? 'bold' : 'normal');
        pdf.text(token.text, x, y + lineIndex * leading);
        x += pdf.getTextWidth(token.text);
      }
    });
    gap(Math.max(1, lines.length) * leading + 1.4);
  }

  function table(
    headers: string[],
    rows: string[][],
    weights: number[],
    right: boolean[],
    emphasizeLast = false,
  ) {
    const wrapping = tableSize >= 10;
    const lineHeight = 4.4;
    const measureRow = (cells: string[]) => {
      pdf.setFont(family, 'bold');
      pdf.setFontSize(tableSize);
      const wrapped = cells.map((cell, index) => {
        const column = width * (weights[index] ?? 0);
        const lines = pdf.splitTextToSize(plain(cell), Math.max(10, column - 3)) as string[];
        return wrapping ? lines.slice(0, 2) : lines.slice(0, 1);
      });
      const lineCount = Math.max(1, ...wrapped.map((lines) => lines.length));
      const rowHeight = wrapping ? lineCount * lineHeight + 2.2 : 8;
      return { wrapped, rowHeight };
    };
    const headerMeasure = measureRow(headers);
    const firstMeasure = rows[0] ? measureRow(rows[0]) : null;
    if (y + headerMeasure.rowHeight + (firstMeasure?.rowHeight ?? 0) > 280) {
      pdf.addPage();
      y = isPriceList ? 18 : 16;
    }
    const drawRow = (cells: string[], header: boolean, emphasize: boolean) => {
      pdf.setFont(family, header || emphasize ? 'bold' : 'normal');
      pdf.setFontSize(tableSize);
      const wrapped = cells.map((cell, index) => {
        const column = width * (weights[index] ?? 0);
        const lines = pdf.splitTextToSize(plain(cell), Math.max(10, column - 3)) as string[];
        return wrapping ? lines.slice(0, 2) : lines.slice(0, 1);
      });
      const lineCount = Math.max(1, ...wrapped.map((lines) => lines.length));
      const rowHeight = wrapping ? lineCount * lineHeight + 2.2 : 8;
      if (!header && y + rowHeight > 280) {
        pdf.addPage();
        y = isPriceList ? 18 : 16;
        drawRow(headers, true, false);
      } else {
        need(rowHeight);
      }
      const top = wrapping ? 3.8 : 4.6;
      if (header) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, y - top, width, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont(family, 'bold');
      } else if (emphasize) {
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, y - top, width, rowHeight, 'F');
        ink();
        pdf.setFont(family, 'bold');
      } else {
        ink();
        pdf.setFont(family, 'normal');
      }
      pdf.setFontSize(tableSize);
      let x = margin;
      wrapped.forEach((lines, index) => {
        const column = width * (weights[index] ?? 0);
        lines.forEach((line, lineIndex) => {
          const textX = right[index] ? x + column - 1.5 : x + 1.5;
          pdf.text(line, textX, y + lineIndex * (wrapping ? lineHeight : 0), {
            align: right[index] ? 'right' : 'left',
          });
        });
        x += column;
      });
      gap(rowHeight);
    };
    drawRow(headers, true, false);
    rows.forEach((row, index) => drawRow(row, false, emphasizeLast && index === rows.length - 1));
    gap(2);
  }

  function wrapTable(headers: string[], body: string[][], weights: number[]) {
    const lineHeight = priceSize >= 10 ? 4.4 : 3.2;
    const textTop = priceSize >= 10 ? 3.8 : 3.4;
    const drawRow = (cells: string[], header: boolean) => {
      pdf.setFont(family, header ? 'bold' : 'normal');
      pdf.setFontSize(priceSize);
      const wrapped = cells.map((cell, index) => {
        const column = width * (weights[index] ?? 0);
        return pdf.splitTextToSize(plain(cell), Math.max(8, column - 2)) as string[];
      });
      const lineCount = Math.min(3, Math.max(1, ...wrapped.map((lines) => lines.length)));
      const rowHeight = lineCount * lineHeight + (priceSize >= 10 ? 2.4 : 2.2);
      need(rowHeight);
      if (header) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, y - textTop, width, rowHeight, 'F');
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

  function specRateTable(headers: string[], body: string[][]) {
    const tableWidth = width;
    const priceCount = Math.max(0, headers.length - 2);
    const amountSize = 9;
    pdf.setFont(family, 'normal');
    pdf.setFontSize(amountSize);
    const widestAmount = Math.max(
      0,
      ...body.flatMap((row) => row.slice(2).map((cell) => pdf.getTextWidth(plain(cell)))),
    );
    const priceColumn = Math.min(21, Math.max(19.4, widestAmount + 3));
    const nameColumn = 30;
    const specColumn = Math.max(32, tableWidth - nameColumn - priceColumn * priceCount);
    const columns = [
      nameColumn,
      specColumn,
      ...Array.from({ length: priceCount }, () => priceColumn),
    ];
    const used = columns.reduce((sum, column) => sum + column, 0);
    if (used > tableWidth) {
      const overflow = used - tableWidth;
      columns[1] = Math.max(30, (columns[1] ?? 32) - overflow);
    }
    const lineHeight = 4.65;
    const padTop = 3.6;
    const padX = 1.4;

    const drawHeader = () => {
      const headerLines = headers.map((header) => header.split('\n'));
      const lineCount = Math.max(1, ...headerLines.map((lines) => lines.length));
      const headerLeading = 4.6;
      const rowHeight = padTop + Math.max(0, lineCount - 1) * headerLeading + 2.8;
      if (y + rowHeight > 280) {
        pdf.addPage();
        y = 18;
      }
      pdf.setFillColor(15, 23, 42);
      pdf.rect(margin, y - padTop, tableWidth, rowHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(family, 'bold');
      let x = margin;
      headerLines.forEach((lines, index) => {
        const column = columns[index] ?? 0;
        const alignRight = index >= 2;
        lines.forEach((line, lineIndex) => {
          pdf.setFontSize(lineIndex === 0 ? 8.5 : 7);
          const textX = alignRight ? x + column - padX : x + padX;
          pdf.text(plain(line), textX, y + lineIndex * headerLeading, {
            align: alignRight ? 'right' : 'left',
          });
        });
        x += column;
      });
      gap(rowHeight);
    };

    drawHeader();
    body.forEach((row, rowIndex) => {
      const wrapped = row.map((cell, index) => {
        const column = columns[index] ?? 0;
        const amount = index >= 2;
        pdf.setFont(family, index === 0 ? 'bold' : 'normal');
        pdf.setFontSize(amount ? amountSize : bodySize);
        const inner = Math.max(8, column - padX * 2);
        return pdf.splitTextToSize(plain(cell), inner) as string[];
      });
      const lineCount = Math.max(1, ...wrapped.map((lines) => lines.length));
      const rowHeight = padTop + Math.max(0, lineCount - 1) * lineHeight + 2.6;
      if (y + rowHeight > 280) {
        pdf.addPage();
        y = 18;
        drawHeader();
      }
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, y - padTop, tableWidth, rowHeight, 'F');
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.15);
      pdf.line(margin, y - padTop + rowHeight, margin + tableWidth, y - padTop + rowHeight);
      ink();
      let x = margin;
      wrapped.forEach((lines, index) => {
        const column = columns[index] ?? 0;
        const alignRight = index >= 2;
        const blockHeight = Math.max(0, lines.length - 1) * lineHeight;
        const textBlock = Math.max(0, lineCount - 1) * lineHeight;
        const start = alignRight ? y + Math.max(0, (textBlock - blockHeight) / 2) : y;
        pdf.setFont(family, index === 0 ? 'bold' : 'normal');
        pdf.setFontSize(alignRight ? amountSize : bodySize);
        lines.forEach((line, lineIndex) => {
          const textX = alignRight ? x + column - padX : x + padX;
          pdf.text(line, textX, start + lineIndex * lineHeight, {
            align: alignRight ? 'right' : 'left',
          });
        });
        x += column;
      });
      gap(rowHeight);
    });
    gap(1);
  }

  ink();
  pdf.setFont(family, 'bold');
  pdf.setFontSize(bodySize);
  muted();
  pdf.text(proposal.kicker, margin, y);
  placeLogo(pdf, logoDataUrl, 210 - margin, y - 4, 36, 14);
  gap(isPriceList ? 8 : 7);
  ink();
  pdf.setFontSize(16);
  const titleWidth = logoDataUrl ? width - 40 : width;
  const title = pdf.splitTextToSize(plain(proposal.headline), titleWidth) as string[];
  pdf.text(title, margin, y, { lineHeightFactor: 1.15 });
  gap(title.length * (isPriceList ? 8 : 7));

  pdf.setFontSize(bodySize);
  const meta = [
    ['Prepared for', proposal.preparedFor],
    ['Prepared by', proposal.preparedBy],
    ['Date', proposal.dateLabel],
    ['Proposal no.', proposal.proposalNumber],
  ];
  for (const [label, value] of meta) {
    need(5);
    muted();
    pdf.setFont(family, 'normal');
    pdf.text(label ?? '', margin, y);
    ink();
    pdf.setFont(family, 'bold');
    pdf.text(plain(value ?? ''), margin + 34, y);
    gap(isPriceList ? 6.2 : 5);
  }
  gap(isPriceList ? 3 : 2);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, margin + width, y);
  gap(isPriceList ? 4.5 : 8);

  heading('1. Proposal');
  proposal.intro.forEach((item) => paragraph(item));

  heading('2. Proposed Laptop Specification');
  const specRates = proposal.modelRates;
  if (specRates && specRates.rows.length > 0 && specRates.headers.includes('Specification')) {
    specRateTable(specRates.headers, specRates.rows);
  } else {
    table(
      ['Specification', 'Details'],
      proposal.specifications.map((row) => [row.label, row.value]),
      [0.32, 0.68],
      [false, false],
    );
  }
  if (proposal.assignedLaptops.length > 0) {
    paragraph('Laptops on this proposal');
    proposal.assignedLaptops.forEach((laptop) => paragraph(laptop));
  }

  heading('3. Rental Pricing');
  const ratesAlreadyShown =
    specRates && specRates.rows.length > 0 && specRates.headers.includes('Specification');
  if (ratesAlreadyShown) {
    paragraph(proposal.gstNote);
    need(8);
    pdf.setFont(family, 'bold');
    pdf.setFontSize(bodySize);
    ink();
    pdf.text('Recommended Plan', margin, y);
    gap(headingAfter);
    for (const row of proposal.recommended) {
      if (!row.label || row.label === proposal.gstNote) continue;
      paragraph(row.amount ? `${row.label} ${row.amount}` : row.label);
    }
  } else if (proposal.modelRates && proposal.modelRates.rows.length > 0) {
    const count = proposal.modelRates.headers.length;
    const nameWeight = priceSize >= 10 ? 0.28 : 0.3;
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
  if (!ratesAlreadyShown) paragraph(`GST: ${proposal.gstNote}`);
  if (!ratesAlreadyShown) {
    pdf.setFont(family, 'bold');
    pdf.setFontSize(bodySize);
    ink();
    need(6);
    pdf.text('Recommended Plan', margin, y);
    gap(6);
    for (const row of proposal.recommended) {
      if (row.amount) {
        paragraph(row.label, bodySize);
        pdf.setFont(family, 'bold');
        pdf.setFontSize(bodySize);
        ink();
        need(6);
        pdf.text(plain(row.amount), margin, y);
        gap(6);
        continue;
      }
      pdf.setFont(family, 'bold');
      pdf.setFontSize(bodySize);
      ink();
      const lines = pdf.splitTextToSize(plain(row.label), width) as string[];
      need(lines.length * 5);
      pdf.text(lines, margin, y);
      gap(lines.length * 5 + 1);
    }
  }

  heading('4. Security Deposit', isPriceList ? 36 : 0);
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

  heading('9. Return of Equipment', isPriceList ? 52 : 0);
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
    family,
  );
  drawSignature(
    pdf,
    margin + width / 2 + 4,
    y,
    column,
    proposal.signatures.issuerHeading,
    proposal.signatures.issuerName,
    proposal.signatures.issuerDesignation,
    family,
  );
  gap(36);

  need(22);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, margin + width, y);
  gap(5);
  pdf.setFont(family, 'bold');
  pdf.setFontSize(bodySize);
  ink();
  pdf.text(plain(proposal.footer.name), margin, y);
  gap(isPriceList ? 5.6 : 4.5);
  pdf.setFont(family, 'normal');
  pdf.setFontSize(bodySize);
  muted();
  for (const line of proposal.footer.addressLines) {
    pdf.text(plain(line), margin, y);
    gap(isPriceList ? 5.2 : 4);
  }
  if (proposal.footer.contact) {
    pdf.text(plain(proposal.footer.contact), margin, y);
    gap(isPriceList ? 5.2 : 4);
  }
  if (proposal.footer.gstin) {
    pdf.text(plain(`GSTIN: ${proposal.footer.gstin}`), margin, y);
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFont(family, 'normal');
    pdf.setFontSize(bodySize);
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
  family = 'helvetica',
) {
  pdf.setFont(family, 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  const title = (pdf.splitTextToSize(plain(heading), width) as string[]).slice(0, 2);
  title.forEach((line, index) => pdf.text(line, x, y + index * 5));
  const base = y + Math.max(0, title.length - 1) * 5;
  pdf.setFont(family, 'normal');
  pdf.setFontSize(10);
  pdf.text(`Name: ${name || '________________'}`, x, base + 8);
  pdf.text(`Designation: ${designation || '________________'}`, x, base + 14);
  pdf.text('Signature: ________________', x, base + 20);
  pdf.text('Date: ________________', x, base + 26);
}

function plain(value: string) {
  return value.replaceAll('₹', 'Rs. ').replaceAll('–', '-').replaceAll('·', '-');
}

type PlacedLogo = { x: number; y: number; width: number; height: number };

function placeLogo(
  pdf: jsPDF,
  dataUrl: string | null,
  right: number,
  top: number,
  maxWidth: number,
  maxHeight: number,
): PlacedLogo | null {
  if (!dataUrl?.startsWith('data:image/')) return null;
  try {
    const props = pdf.getImageProperties(dataUrl);
    const ratio = props.width / props.height;
    if (!Number.isFinite(ratio) || ratio <= 0) return null;
    let width = maxWidth;
    let height = width / ratio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    const x = right - width;
    pdf.addImage(dataUrl, props.fileType, x, top, width, height, undefined, 'SLOW');
    return { x, y: top, width, height };
  } catch {
    return null;
  }
}

export async function prepareRateCardLogo(dataUrl: string | null): Promise<string | null> {
  if (!dataUrl?.startsWith('data:image/') || typeof document === 'undefined') return dataUrl;
  try {
    const image = await loadLogo(dataUrl);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return dataUrl;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return dataUrl;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return dataUrl;
  }
}

function loadLogo(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Logo could not be read.'));
    image.src = dataUrl;
  });
}

async function fontBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Font file is missing.');
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

export async function registerVerdana(pdf: jsPDF) {
  const [regular, bold] = await Promise.all([
    fontBase64('/fonts/verdana.ttf'),
    fontBase64('/fonts/verdana-bold.ttf'),
  ]);
  pdf.addFileToVFS('verdana.ttf', regular);
  pdf.addFont('verdana.ttf', 'Verdana', 'normal');
  pdf.addFileToVFS('verdana-bold.ttf', bold);
  pdf.addFont('verdana-bold.ttf', 'Verdana', 'bold');
  pdf.setFont('Verdana', 'normal');
}
