import { describe, expect, it } from 'vitest';
import { gcsCreateFolderSchema, normalizeGcsPrefix } from '../src/media';

describe('gcs browser paths', () => {
  it('normalizes a folder prefix and keeps the bucket root empty', () => {
    expect(normalizeGcsPrefix('')).toBe('');
    expect(normalizeGcsPrefix('/cars/images')).toBe('cars/images/');
    expect(normalizeGcsPrefix('cars/images/')).toBe('cars/images/');
  });

  it('rejects folder names that could escape the current prefix', () => {
    expect(gcsCreateFolderSchema.safeParse({ prefix: 'cars/', name: '..' }).success).toBe(false);
    expect(gcsCreateFolderSchema.safeParse({ prefix: 'cars', name: '2026' }).success).toBe(true);
  });
});
