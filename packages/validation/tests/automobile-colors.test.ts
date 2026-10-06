import { describe, expect, it } from 'vitest';
import { automobileAvailableColorSchema } from '../src/automobile';

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
});
