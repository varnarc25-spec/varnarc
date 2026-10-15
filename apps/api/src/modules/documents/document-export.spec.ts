import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderDocument } from '@varnarc/validation';
import {
  decryptDocumentPayload,
  documentEncryptionKey,
  encryptDocumentPayload,
} from './document-crypto';
import { renderDocumentPdf } from './document-pdf';
import { renderDocumentDocx } from './document-docx';
import { sanitizeAnalyticsQuery } from './document.service';

describe('document export', () => {
  it('round-trips encrypted personal data', () => {
    process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    const key = documentEncryptionKey();
    expect(key).toBeTruthy();
    const cipher = encryptDocumentPayload({ employeeName: 'Asha' }, key!);
    expect(cipher.includes('Asha')).toBe(false);
    expect(decryptDocumentPayload<{ employeeName: string }>(cipher, key!).employeeName).toBe(
      'Asha',
    );
  });

  it('drops identity-like search text', () => {
    expect(sanitizeAnalyticsQuery('resignation letter')).toBe('resignation letter');
    expect(sanitizeAnalyticsQuery('asha@example.com 123412341234')).toBeNull();
  });

  it('writes a PDF and a Word file that contain the entered name', async () => {
    const rendered = renderDocument({
      title: 'Resignation letter',
      fields: [{ key: 'employeeName', label: 'Name', type: 'text', required: true }],
      blocks: [{ type: 'paragraph', text: 'From {{employeeName}}' }],
      values: { employeeName: 'Asha' },
    });
    const pdf = await renderDocumentPdf(rendered);
    const docx = await renderDocumentDocx(rendered);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.toString('latin1')).toContain('(Resignation letter)');
    expect(pdf.toString('latin1')).toContain('/Count 1');
    expect(pdf.toString('latin1')).toContain('NotoSans-Regular');
    expect(docx.subarray(0, 2).toString()).toBe('PK');
    const dir = mkdtempSync(path.join(tmpdir(), 'varnarc-doc-'));
    const file = path.join(dir, 'letter.docx');
    writeFileSync(file, docx);
    const xml = execFileSync('unzip', ['-p', file, 'word/document.xml'], { encoding: 'utf8' });
    expect(xml).toContain('Asha');
  });
});
