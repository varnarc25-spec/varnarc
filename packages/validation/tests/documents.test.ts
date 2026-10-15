import { describe, expect, it } from 'vitest';
import {
  blankDocumentInputs,
  formatDocumentInr,
  renderDocument,
  validateDocumentInputs,
  validateDocumentTemplate,
  type DocumentBlock,
  type DocumentEditorial,
  type DocumentField,
} from '../src/documents';

const editorial: DocumentEditorial = {
  whatItIs: 'A sample letter the sender can customise before sending it to an employer.',
  whenRequired: 'Use it when you resign and your workplace expects a written notice.',
  requiredInformation: ['Your name', 'Last working day'],
  steps: ['Fill the form', 'Read the preview', 'Download PDF or Word'],
  sampleFormat: 'Date, recipient, subject, notice, and signature.',
  considerations: ['Follow the notice period in your appointment letter.'],
  relatedTools: [{ label: 'Calculators', href: '/calculators' }],
};

const fields: DocumentField[] = [
  { key: 'employeeName', label: 'Employee name', type: 'text', required: true },
  { key: 'reason', label: 'Reason', type: 'textarea', required: false },
  {
    key: 'showNote',
    label: 'Add a note',
    type: 'select',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'note',
    label: 'Note',
    type: 'text',
    required: true,
    visibleWhen: { field: 'showNote', equals: 'yes' },
  },
  { key: 'rent', label: 'Monthly rent', type: 'currency', required: true },
  {
    key: 'items',
    label: 'Items',
    type: 'repeat',
    required: true,
    maxItems: 5,
    itemFields: [
      { key: 'description', label: 'Description', type: 'text', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'currency', required: true },
    ],
  },
];

const blocks: DocumentBlock[] = [
  { type: 'heading', level: 1, text: 'Resignation' },
  { type: 'paragraph', text: 'I, {{employeeName}}, resign.' },
  { type: 'paragraph', text: '{{reason}}' },
  { type: 'paragraph', text: '{{note}}' },
  { type: 'paragraph', text: 'Rent {{rent}}' },
  {
    type: 'lineItems',
    field: 'items',
    columns: [
      { header: 'Description', key: 'description' },
      { header: 'Amount', product: ['quantity', 'rate'], format: 'currency' },
    ],
  },
  { type: 'signature', label: 'Employee', nameField: 'employeeName' },
];

describe('documents engine', () => {
  it('formats Indian currency', () => {
    expect(formatDocumentInr(1234567.5)).toBe('₹12,34,567.50');
    expect(formatDocumentInr(1000, 'rs')).toBe('Rs. 1,000.00');
  });

  it('escapes HTML and omits empty optional paragraphs', () => {
    const rendered = renderDocument({
      title: 'Resignation',
      fields,
      blocks,
      values: {
        employeeName: '<script>alert(1)</script>',
        showNote: 'no',
        rent: 15000,
        items: [{ description: 'Desk', quantity: 2, rate: 100 }],
      },
    });
    expect(rendered.html).toContain('&lt;script&gt;');
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.blocks.some((block) => block.type === 'paragraph' && block.text === '')).toBe(
      false,
    );
    expect(rendered.html).toContain('₹15,000.00');
    expect(rendered.html).toContain('₹200.00');
    const note = rendered.blocks.find(
      (block) => block.type === 'paragraph' && block.text.includes('Note'),
    );
    expect(note).toBeUndefined();
  });

  it('requires conditional fields only when visible', () => {
    const hidden = validateDocumentInputs(fields, {
      employeeName: 'Asha',
      showNote: 'no',
      rent: 1,
      items: [{ description: 'Desk', quantity: 1, rate: 1 }],
    });
    expect(hidden.find((error) => error.field === 'note')).toBeUndefined();
    const shown = validateDocumentInputs(fields, {
      employeeName: 'Asha',
      showNote: 'yes',
      rent: 1,
      items: [{ description: 'Desk', quantity: 1, rate: 1 }],
    });
    expect(shown.find((error) => error.field === 'note')).toBeTruthy();
  });

  it('rejects identity-number fields before publish', () => {
    const issues = validateDocumentTemplate({
      fields: [{ key: 'aadhaar_number', label: 'Aadhaar', type: 'text', required: true }],
      blocks: [{ type: 'paragraph', text: '{{aadhaar_number}}' }],
      editorial,
      faqs: [
        { question: 'Is this official?', answer: 'No. It is a sample you must check yourself.' },
      ],
    });
    expect(issues.some((issue) => issue.message.includes('identity number'))).toBe(true);
  });

  it('builds a blank download without throwing', () => {
    const values = blankDocumentInputs(fields);
    const rendered = renderDocument({ title: 'Blank', fields, blocks, values });
    expect(rendered.blocks.length).toBeGreaterThan(0);
    expect(rendered.html).toContain('________');
  });
});
