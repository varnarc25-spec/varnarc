import { describe, expect, it } from 'vitest';
import { automobileAvailableColorSchema, automobileColorNameKey } from '../src/automobile';

describe('available colors', () => {
  it('accepts a named color with a hex swatch', () => {
    expect(
      automobileAvailableColorSchema.safeParse({ name: 'Pearl White', hex: '#f4f1ea' }).success,
    ).toBe(true);
  });

  it('rejects a color without a name', () => {
    expect(automobileAvailableColorSchema.safeParse({ name: '  ', hex: '#fff' }).success).toBe(
      false,
    );
  });

  it('treats the same color name as one catalogue row', () => {
    expect(automobileColorNameKey('  Pearl   White ')).toBe('pearl white');
    expect(automobileColorNameKey('Pearl White')).toBe(automobileColorNameKey('pearl white'));
  });
});
