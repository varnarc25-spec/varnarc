import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { RenderedDocument } from '@varnarc/validation';

function text(value: string, bold = false): TextRun {
  return new TextRun({ text: value, bold, font: 'Calibri', size: bold ? 24 : 22 });
}

function paragraph(value: string, bold = false): Paragraph {
  return new Paragraph({ children: [text(value, bold)], spacing: { after: 160 } });
}

export async function renderDocumentDocx(document: RenderedDocument): Promise<Buffer> {
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: document.title, bold: true, font: 'Calibri', size: 32 })],
    }),
  ];

  for (const block of document.blocks) {
    if (block.type === 'heading') {
      children.push(
        new Paragraph({
          heading: block.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          alignment: block.level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [text(block.text, true)],
        }),
      );
    } else if (block.type === 'paragraph') {
      children.push(paragraph(block.text));
    } else if (block.type === 'list') {
      for (const item of block.items) children.push(paragraph(`• ${item}`));
    } else if (block.type === 'table') {
      const rows: TableRow[] = [];
      if (block.headers?.length) {
        rows.push(
          new TableRow({
            children: block.headers.map(
              (header) => new TableCell({ children: [paragraph(header, true)] }),
            ),
          }),
        );
      }
      for (const row of block.rows) {
        rows.push(
          new TableRow({
            children: row.map((cell) => new TableCell({ children: [paragraph(cell)] })),
          }),
        );
      }
      if (rows.length) {
        children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
    } else if (block.type === 'signature') {
      children.push(paragraph(''));
      children.push(paragraph('________________________'));
      children.push(paragraph(block.label));
      if (block.name) children.push(paragraph(block.name));
    } else if (block.type === 'pageBreak') {
      children.push(new Paragraph({ children: [], pageBreakBefore: true }));
    }
  }

  children.push(
    paragraph(
      'Sample generated on Varnarc for personal use. It is not a government certificate, seal, or legal advice.',
    ),
  );

  const file = new Document({
    title: document.title,
    creator: 'Varnarc',
    description: document.title,
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
                    font: 'Calibri',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(file);
}
