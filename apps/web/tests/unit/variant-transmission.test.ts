import { describe, expect, it } from 'vitest';
import { variantFuelGroup, variantTransmissionGroup } from '@/lib/automobile/variant-transmission';

describe('variantTransmissionGroup', () => {
  it('keeps manual, CVT, DSG, and torque-converter automatics apart', () => {
    expect(variantTransmissionGroup('6-speed Manual')).toBe('Manual');
    expect(variantTransmissionGroup('CVT')).toBe('Automatic (CVT)');
    expect(variantTransmissionGroup('7-speed DSG')).toBe('Automatic (DCT)');
    expect(variantTransmissionGroup('8-speed Automatic')).toBe('Automatic');
    expect(variantTransmissionGroup('6-speed Automatic (TC)')).toBe('Automatic (TC)');
  });

  it('labels stored petrol and CNG without renaming other fuels', () => {
    expect(variantFuelGroup('PETROL')).toBe('Petrol');
    expect(variantFuelGroup('CNG')).toBe('CNG');
    expect(variantFuelGroup('PLUG_IN_HYBRID')).toBe('Plug-in hybrid');
    expect(variantFuelGroup(null)).toBeNull();
  });

  it('does not assign a combined gearbox to one side', () => {
    expect(variantTransmissionGroup('6-speed Manual / CVT')).toBe('Manual / Automatic');
    expect(variantTransmissionGroup('')).toBeNull();
    expect(variantTransmissionGroup(null)).toBeNull();
  });
});
