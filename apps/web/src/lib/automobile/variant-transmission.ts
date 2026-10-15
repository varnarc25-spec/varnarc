/** Label for a stored fuel string. Does not invent a fuel. */
export function variantFuelGroup(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  if (!text) return null;
  const key = text.toLowerCase().replace(/[\s-]+/g, '_');
  if (key === 'petrol' || key === 'gasoline') return 'Petrol';
  if (key === 'cng') return 'CNG';
  if (key === 'diesel') return 'Diesel';
  if (key === 'electric') return 'Electric';
  if (key.includes('plug')) return 'Plug-in hybrid';
  if (key.includes('hybrid')) return 'Hybrid';
  return text;
}

/** Groups a stored gearbox string for the variant filter. Does not invent a gearbox. */
export function variantTransmissionGroup(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  if (!text) return null;
  const lower = text.toLowerCase();
  const manual = /\bmanual\b|\bmt\b/.test(lower);
  const cvt = /\bcvt\b/.test(lower);
  const dct = /\b(dsg|dct)\b/.test(lower);
  const amt = /\bamt\b/.test(lower);
  const tc = /\btc\b|torque converter/.test(lower);
  const automatic = /\bauto|\bat\b/.test(lower) || amt || tc;
  if (manual && (cvt || dct || automatic)) return 'Manual / Automatic';
  if (cvt) return 'Automatic (CVT)';
  if (dct) return 'Automatic (DCT)';
  if (amt) return 'Automatic (AMT)';
  if (tc) return 'Automatic (TC)';
  if (automatic) return 'Automatic';
  if (manual) return 'Manual';
  return text;
}
