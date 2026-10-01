const SHARE_FIELDS = [
  'make',
  'model',
  'variant',
  'year',
  'month',
  'km',
  'owners',
  'state',
  'city',
  'fuel',
  'transmission',
  'condition',
  'insurance',
  'service',
  'accident',
  'rc',
  'price',
  'paint',
  'recentTyres',
  'flood',
  'chassis',
  'majorAccident',
  'fullService',
  'battery',
  'batteryWarranty',
  'batteryReplaced',
] as const;

export type ResaleShareField = (typeof SHARE_FIELDS)[number];

export type ResaleShareState = Partial<Record<ResaleShareField, string>>;

/** Query keys that may appear on a shared result. None of these are personal data. */
export const RESALE_SHARE_QUERY_KEYS: readonly ResaleShareField[] = SHARE_FIELDS;

export function serializeResaleShare(state: ResaleShareState): string {
  const params = new URLSearchParams();
  for (const key of SHARE_FIELDS) {
    const value = state[key]?.trim();
    if (!value) continue;
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function parseResaleShare(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): ResaleShareState {
  const read = (key: string): string => {
    if (input instanceof URLSearchParams) return input.get(key)?.trim() ?? '';
    const value = input[key];
    if (Array.isArray(value)) return value[0]?.trim() ?? '';
    return value?.trim() ?? '';
  };
  const state: ResaleShareState = {};
  for (const key of SHARE_FIELDS) {
    const value = read(key);
    if (value) state[key] = value;
  }
  return state;
}
