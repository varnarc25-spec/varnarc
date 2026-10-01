import { describe, expect, it } from 'vitest';
import { vehicleMatchesIndiaCatalog } from '../src/automobile-india-catalog';

describe('vehicleMatchesIndiaCatalog', () => {
  it('matches Maruti Swift variants', () => {
    expect(
      vehicleMatchesIndiaCatalog({
        manufacturerName: 'Maruti Suzuki',
        name: 'Maruti Swift VXI',
        model: 'Swift',
        variant: 'VXI',
      }),
    ).toBe(true);
  });

  it('matches Hyundai Creta', () => {
    expect(
      vehicleMatchesIndiaCatalog({
        manufacturerName: 'Hyundai',
        name: 'Hyundai Creta SX',
        model: 'Creta',
        variant: 'SX',
      }),
    ).toBe(true);
  });

  it('rejects brands not in the India list', () => {
    expect(
      vehicleMatchesIndiaCatalog({
        manufacturerName: 'Zenvo',
        name: 'Zenvo TSR-S',
        model: 'TSR-S',
      }),
    ).toBe(false);
  });

  it('does not match a listed model from the wrong manufacturer', () => {
    expect(
      vehicleMatchesIndiaCatalog({
        manufacturerName: 'Toyota',
        name: 'Toyota Swift',
        model: 'Swift',
      }),
    ).toBe(false);
  });
});
