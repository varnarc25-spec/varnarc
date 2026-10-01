import { INDIA_STATES, INDIA_UTS, MAJOR_CITIES } from '@varnarc/validation';

export type IndiaPlace = { slug: string; name: string };

const REGIONS: IndiaPlace[] = [...INDIA_STATES, ...INDIA_UTS]
  .map((row) => ({ slug: row.slug, name: row.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function indiaRegions(): IndiaPlace[] {
  return REGIONS;
}

export function regionName(slug: string): string {
  return REGIONS.find((row) => row.slug === slug)?.name ?? slug;
}

/** Cities for a state, plus an "other" option so every state can be used. */
export function citiesForRegion(stateSlug: string): IndiaPlace[] {
  const cities = MAJOR_CITIES.filter((city) => city.stateSlug === stateSlug)
    .map((city) => ({ slug: city.slug, name: city.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...cities, { slug: 'other', name: 'Other city in this state' }];
}

export function cityName(stateSlug: string, citySlug: string): string {
  return citiesForRegion(stateSlug).find((city) => city.slug === citySlug)?.name ?? citySlug;
}
