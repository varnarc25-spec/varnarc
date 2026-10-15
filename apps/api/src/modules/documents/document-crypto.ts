import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const VERSION = 'v1';

export function documentEncryptionKey(): Buffer | null {
  const raw = process.env.DOCUMENT_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const key = Buffer.from(raw, 'base64');
  return key.length === 32 ? key : null;
}

export function encryptDocumentPayload(value: unknown, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(value), 'utf8')),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptDocumentPayload<T>(payload: string, key: Buffer): T {
  const [version, ivText, tagText, dataText] = payload.split('.');
  if (version !== VERSION || !ivText || !tagText || !dataText) {
    throw new Error('Stored document could not be read.');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(dataText, 'base64url')),
    decipher.final(),
  ]);
  return JSON.parse(plain.toString('utf8')) as T;
}

export function signDocumentDownload(input: {
  id: string;
  userId: string;
  format: 'PDF' | 'DOCX' | 'HTML';
  exp: number;
}): string {
  const key = documentEncryptionKey();
  if (!key) throw new Error('Download links are unavailable.');
  const body = Buffer.from(JSON.stringify(input), 'utf8').toString('base64url');
  const sig = createHmac('sha256', key).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyDocumentDownload(token: string): {
  id: string;
  userId: string;
  format: 'PDF' | 'DOCX' | 'HTML';
  exp: number;
} | null {
  const key = documentEncryptionKey();
  if (!key) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', key).update(body).digest('base64url');
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      id?: string;
      userId?: string;
      format?: 'PDF' | 'DOCX' | 'HTML';
      exp?: number;
    };
    if (!parsed.id || !parsed.userId || !parsed.format || !parsed.exp) return null;
    if (parsed.exp < Date.now()) return null;
    return { id: parsed.id, userId: parsed.userId, format: parsed.format, exp: parsed.exp };
  } catch {
    return null;
  }
}
