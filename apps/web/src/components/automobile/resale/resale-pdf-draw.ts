import type { jsPDF } from 'jspdf';
import {
  pdfPlain,
  type ResalePdfDocument,
  type ResalePdfRow,
  type ResalePdfSection,
} from './resale-pdf-document';

export function drawResalePdf(pdf: jsPDF, document: ResalePdfDocument) {
  const margin = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  let y = 30;

  function paintHeader() {
    pdf.setFillColor(11, 31, 58);
    pdf.rect(0, 0, pageWidth, 22, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Varnarc', margin, 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(253, 186, 116);
    pdf.text('CAR RESALE VALUE', margin, 16);
  }

  function nextPage() {
    pdf.addPage();
    paintHeader();
    y = 30;
  }

  function need(height: number) {
    if (y + height > 280) nextPage();
  }

  function paragraph(text: string, size = 9) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(pdfPlain(text), contentWidth) as string[];
    need(lines.length * 4.2 + 1);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(71, 85, 105);
    pdf.text(lines, margin, y);
    y += lines.length * 4.2 + 1.5;
  }

  function drawRow(row: ResalePdfRow) {
    const labelWidth = contentWidth * 0.58;
    const valueWidth = contentWidth * 0.38;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const labelLines = pdf.splitTextToSize(pdfPlain(row.label), labelWidth) as string[];
    const valueLines = pdf.splitTextToSize(pdfPlain(row.value), valueWidth) as string[];
    const lineCount = Math.max(labelLines.length, valueLines.length, 1);
    const height = lineCount * 4.2 + 2.6;
    need(height);
    if (row.emphasis) {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin - 1, y - 3.4, contentWidth + 2, height, 'F');
    }
    pdf.setFont('helvetica', row.emphasis ? 'bold' : 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text(labelLines, margin, y);
    pdf.setFont('helvetica', 'bold');
    if (row.tone === 'positive') pdf.setTextColor(6, 95, 70);
    else if (row.tone === 'negative') pdf.setTextColor(153, 27, 27);
    else pdf.setTextColor(11, 31, 58);
    pdf.text(valueLines, margin + contentWidth, y, { align: 'right' });
    y += height;
  }

  function drawSection(section: ResalePdfSection) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    const titleLines = pdf.splitTextToSize(pdfPlain(section.title), contentWidth) as string[];
    need(titleLines.length * 5 + 8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(11, 31, 58);
    pdf.text(titleLines, margin, y);
    y += titleLines.length * 5;
    pdf.setDrawColor(234, 88, 12);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, margin + 16, y);
    y += 5;
    if (section.intro) paragraph(section.intro);
    for (const row of section.rows) drawRow(row);
    if (section.bulletLabel && section.bullets?.length) {
      need(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(11, 31, 58);
      pdf.text(pdfPlain(section.bulletLabel), margin, y);
      y += 4.5;
    }
    for (const item of section.bullets ?? []) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const lines = pdf.splitTextToSize(pdfPlain(item), contentWidth - 5) as string[];
      need(lines.length * 4.2 + 1.2);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text('-', margin, y);
      pdf.text(lines, margin + 4, y);
      y += lines.length * 4.2 + 1.2;
    }
    y += 4;
  }

  paintHeader();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const titleLines = pdf.splitTextToSize(pdfPlain(document.vehicle), contentWidth) as string[];
  need(titleLines.length * 7 + 6);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(11, 31, 58);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 6.5 + 1;
  paragraph(document.subtitle);
  y += 1;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  const rangeLines = pdf.splitTextToSize(pdfPlain(document.range), contentWidth - 10) as string[];
  const rangeBlock = Math.max(rangeLines.length, 1) * 6.4;
  const marketValueOffset = 15 + rangeBlock + 7;
  const heroHeight = marketValueOffset + 6;
  need(heroHeight + 4);
  const heroTop = y;
  pdf.setFillColor(11, 31, 58);
  pdf.roundedRect(margin, heroTop, contentWidth, heroHeight, 2, 2, 'F');
  pdf.setTextColor(253, 186, 116);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text(pdfPlain(document.rangeLabel).toUpperCase(), margin + 5, heroTop + 7);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(15);
  pdf.text(rangeLines, margin + 5, heroTop + 15);
  const valueY = heroTop + 15 + rangeBlock + 1;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225);
  pdf.text(pdfPlain(document.marketLabel), margin + 5, valueY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text(pdfPlain(document.market), margin + 5, valueY + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225);
  pdf.text(pdfPlain(document.exact), margin + contentWidth - 5, valueY + 6, { align: 'right' });
  y += heroHeight + 8;

  for (const section of document.sections) drawSection(section);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  need(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(11, 31, 58);
  pdf.text('Notes', margin, y);
  y += 5;
  for (const note of document.notes) paragraph(note);

  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Varnarc car resale estimate', margin, 290);
    pdf.text(`${page} / ${total}`, pageWidth - margin, 290, { align: 'right' });
  }
}
