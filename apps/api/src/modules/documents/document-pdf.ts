import { existsSync } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { RenderedDocument } from '@varnarc/validation';

function notoFont(): string | null {
  const candidates = [
    path.join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf'),
    path.join(process.cwd(), 'apps/api/src/assets/fonts/NotoSans-Regular.ttf'),
    path.join(process.cwd(), 'src/assets/fonts/NotoSans-Regular.ttf'),
    path.join(process.cwd(), 'dist/assets/fonts/NotoSans-Regular.ttf'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function pdfText(value: string, unicode: boolean): string {
  if (unicode) return value;
  return [...value.replace(/₹/g, 'Rs. ')].filter((char) => char.charCodeAt(0) <= 0xff).join('');
}

export function renderDocumentPdf(document: RenderedDocument): Promise<Buffer> {
  const font = notoFont();
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: 'A4',
      margins: { top: 64, bottom: 72, left: 56, right: 56 },
      bufferPages: true,
      info: {
        Title: document.title,
        Author: 'Varnarc',
        Creator: 'Varnarc Documents',
      },
    });
    const chunks: Buffer[] = [];
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);
    if (font) pdf.font(font);
    else pdf.font('Helvetica');

    const write = (value: string) => pdfText(value, Boolean(font));
    pdf.fontSize(16).text(write(document.title), { align: 'center' });
    pdf.moveDown();

    for (const block of document.blocks) {
      if (block.type === 'heading') {
        pdf
          .fontSize(block.level === 1 ? 16 : 13)
          .text(write(block.text), { align: block.level === 1 ? 'center' : 'left' });
        pdf.moveDown(0.4);
      } else if (block.type === 'paragraph') {
        pdf.fontSize(11).text(write(block.text), { align: 'left' });
        pdf.moveDown(0.4);
      } else if (block.type === 'list') {
        pdf.fontSize(11);
        for (const item of block.items) pdf.text(`• ${write(item)}`, { indent: 12 });
        pdf.moveDown(0.4);
      } else if (block.type === 'table') {
        pdf.fontSize(10);
        if (block.caption) pdf.text(write(block.caption));
        if (block.headers?.length) pdf.text(write(block.headers.join('  |  ')));
        for (const row of block.rows) pdf.text(write(row.join('  |  ')));
        pdf.moveDown(0.5);
      } else if (block.type === 'signature') {
        pdf.moveDown();
        pdf.fontSize(11).text('________________________');
        pdf.text(write(block.label));
        if (block.name) pdf.text(write(block.name));
        pdf.moveDown();
      } else if (block.type === 'pageBreak') {
        pdf.addPage();
      } else {
        pdf.moveDown();
      }
    }

    const range = pdf.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      pdf.switchToPage(range.start + index);
      const previousBottom = pdf.page.margins.bottom;
      pdf.page.margins.bottom = 0;
      pdf
        .fontSize(8)
        .fillColor('#4b5563')
        .text(
          'Sample generated on Varnarc for personal use. It is not a government certificate, seal, or legal advice.',
          56,
          pdf.page.height - 58,
          { width: pdf.page.width - 112, align: 'center', lineBreak: false },
        );
      pdf
        .fontSize(9)
        .fillColor('#111827')
        .text(`Page ${index + 1} of ${range.count}`, 56, pdf.page.height - 40, {
          width: pdf.page.width - 112,
          align: 'center',
          lineBreak: false,
        });
      pdf.page.margins.bottom = previousBottom;
    }
    pdf.end();
  });
}
