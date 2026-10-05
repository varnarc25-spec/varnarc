import { describe, expect, it } from 'vitest';
import { sendContactTestEmailSchema } from '../src/contact';
import {
  adsenseSettingsSchema,
  auth0SettingsSchema,
  companyProfileSchema,
  gcsSettingsSchema,
  generalSettingsSchema,
  maintenanceSettingsSchema,
  securitySettingsSchema,
} from '../src/settings';

describe('companyProfileSchema', () => {
  it('accepts a legal name and blanks', () => {
    const parsed = companyProfileSchema.parse({
      legalName: 'Extern Data Solutions (OPC) Private Limited',
      pan: '',
      website: '',
    });
    expect(parsed.legalName).toContain('Extern');
    expect(parsed.pan).toBeNull();
  });

  it('names the field when PAN or email is invalid', () => {
    const result = companyProfileSchema.safeParse({
      pan: 'NOT-A-PAN',
      email: 'not-an-email',
      website: 'https://',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    expect(messages.some((line) => line.startsWith('pan:'))).toBe(true);
    expect(messages.some((line) => line.startsWith('email:'))).toBe(true);
    expect(messages.join(' ')).toContain('ABCDE1234F');
  });
});

describe('generalSettingsSchema', () => {
  it('applies defaults', () => {
    const parsed = generalSettingsSchema.parse({ siteName: 'Varnarc' });
    expect(parsed.timezone).toBe('UTC');
    expect(parsed.locale).toBe('en');
  });

  it('rejects empty site name', () => {
    expect(() => generalSettingsSchema.parse({ siteName: '' })).toThrow();
  });
});

describe('maintenanceSettingsSchema', () => {
  it('parses maintenance flags', () => {
    const parsed = maintenanceSettingsSchema.parse({
      enabled: true,
      message: 'Down for maintenance',
    });
    expect(parsed.enabled).toBe(true);
    expect(parsed.bypassRoles).toEqual([]);
  });
});

describe('adsenseSettingsSchema', () => {
  it('accepts a publisher ID and named slots', () => {
    const parsed = adsenseSettingsSchema.parse({
      enabled: true,
      client: 'ca-pub-6274053387170397',
      defaultSlot: '1234567890',
      slots: { 'calculator-sidebar': '1234567891' },
    });
    expect(parsed.client).toBe('ca-pub-6274053387170397');
    expect(parsed.slots['calculator-sidebar']).toBe('1234567891');
  });

  it('rejects an invalid publisher ID', () => {
    expect(() => adsenseSettingsSchema.parse({ client: 'pub-123' })).toThrow();
  });
});

describe('auth0SettingsSchema', () => {
  it('keeps empty secrets so the API can preserve stored values', () => {
    const parsed = auth0SettingsSchema.parse({
      enabled: true,
      domain: 'varnarc.auth0.com',
      clientId: 'abc',
      clientSecret: '',
      secret: '',
    });
    expect(parsed.domain).toBe('varnarc.auth0.com');
    expect(parsed.clientSecret).toBe('');
  });
});

describe('gcsSettingsSchema', () => {
  it('accepts bucket credentials and empty private key', () => {
    const parsed = gcsSettingsSchema.parse({
      enabled: true,
      bucket: 'varnarc-media',
      clientEmail: 'media@project.iam.gserviceaccount.com',
      privateKey: '',
    });
    expect(parsed.enabled).toBe(true);
    expect(parsed.bucket).toBe('varnarc-media');
    expect(parsed.privateKey).toBe('');
  });

  it('repairs a truncated https public base URL', () => {
    const parsed = gcsSettingsSchema.parse({
      enabled: true,
      bucket: 'varnarc_files',
      publicBaseUrl: 'ttps://storage.googleapis.com/varnarc_files',
    });
    expect(parsed.publicBaseUrl).toBe('https://storage.googleapis.com/varnarc_files');
  });
});

describe('securitySettingsSchema', () => {
  it('enforces rate limit bounds', () => {
    expect(() => securitySettingsSchema.parse({ rateLimitPerMinute: 0 })).toThrow();
    const parsed = securitySettingsSchema.parse({});
    expect(parsed.rateLimitPerMinute).toBe(120);
  });
});

describe('sendContactTestEmailSchema', () => {
  it('accepts an email address', () => {
    expect(sendContactTestEmailSchema.parse({ to: 'varnarc25@gmail.com' }).to).toBe(
      'varnarc25@gmail.com',
    );
    expect(sendContactTestEmailSchema.safeParse({ to: 'not-an-email' }).success).toBe(false);
  });
});
