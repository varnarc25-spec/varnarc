import { describe, expect, it } from 'vitest';
import { automobileListQuerySchema } from '../src/automobile';

describe('automobileListQuerySchema availableInIndia', () => {
  it('parses true/false query strings without treating "false" as true', () => {
    expect(automobileListQuerySchema.parse({ availableInIndia: 'true' }).availableInIndia).toBe(
      true,
    );
    expect(automobileListQuerySchema.parse({ availableInIndia: 'false' }).availableInIndia).toBe(
      false,
    );
    expect(automobileListQuerySchema.parse({}).availableInIndia).toBeUndefined();
  });

  it('parses model year bounds from query strings', () => {
    expect(
      automobileListQuerySchema.parse({
        modelYear: '2024',
        modelYearFrom: '2020',
        modelYearTo: '2026',
      }),
    ).toMatchObject({ modelYear: 2024, modelYearFrom: 2020, modelYearTo: 2026 });
  });
});
