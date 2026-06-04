import AsyncStorage from '@react-native-async-storage/async-storage';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';

import type { CategoryRow } from './categoryModel';
import { parseCategoryRow } from './categoryModel';
import { insertSyntheticFeaturedRow } from './categoryNormalize';

const VERSION = 'v2';

/** Process-lifetime cache so bootstrap prefetch is visible synchronously on first tab visit. */
const memoryByCountry = new Map<CountryCode, CategoryRow[]>();

export function getMemoryCategories(country?: CountryCode): CategoryRow[] {
  const c = country ?? store.getState().app.country;
  return memoryByCountry.get(c) ?? [];
}

export function setMemoryCategories(rows: CategoryRow[], country?: CountryCode): void {
  const c = country ?? store.getState().app.country;
  if (rows.length === 0) {
    memoryByCountry.delete(c);
    return;
  }
  memoryByCountry.set(c, rows);
}

export function clearMemoryCategoriesAllRegions(): void {
  memoryByCountry.clear();
}

function ensureFeaturedFirstRow(rows: CategoryRow[]): { rows: CategoryRow[]; fixed: boolean } {
  if (rows.length === 0) return { rows, fixed: false };
  const head = rows[0];
  if (head?.id === 0 && head?.name === 'All') return { rows, fixed: false };
  const sansDupFeature = rows.filter(r => !(r.id === 0 && r.name === 'All'));
  const base = sansDupFeature.length > 0 ? sansDupFeature : rows;
  return { rows: insertSyntheticFeaturedRow(base), fixed: true };
}

export function categoryStorageKey(country?: CountryCode): string {
  const c = country ?? store.getState().app.country;
  return `@dressfair/mobile_categories_${VERSION}_${c}`;
}

export async function loadCachedCategories(country?: CountryCode): Promise<CategoryRow[]> {
  const raw = await AsyncStorage.getItem(categoryStorageKey(country));
  if (!raw) return [];

  try {
    const decoded = JSON.parse(raw) as unknown;
    if (!Array.isArray(decoded)) return [];
    const parsed = decoded.map(parseCategoryRow).filter(Boolean) as CategoryRow[];
    const { rows: withFeature, fixed } = ensureFeaturedFirstRow(parsed);
    setMemoryCategories(withFeature, country);
    if (fixed) void saveCachedCategories(withFeature, country);
    return withFeature;
  } catch {
    return [];
  }
}

export async function saveCachedCategories(rows: CategoryRow[], country?: CountryCode): Promise<void> {
  const c = country ?? store.getState().app.country;
  setMemoryCategories(rows, c);
  const key = categoryStorageKey(c);
  await AsyncStorage.setItem(key, JSON.stringify(rows));
}

const ALL_COUNTRY_CODES: CountryCode[] = ['UAE', 'OMN', 'KSA'];

/** After a region switch, drop cached trees so the hub refetches for the active storefront. */
export async function clearMobileCategoriesCacheAllRegions(): Promise<void> {
  clearMemoryCategoriesAllRegions();
  await Promise.all(ALL_COUNTRY_CODES.map(c => AsyncStorage.removeItem(categoryStorageKey(c))));
}
