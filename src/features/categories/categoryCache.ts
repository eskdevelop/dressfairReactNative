import AsyncStorage from '@react-native-async-storage/async-storage';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';

import type { CategoryRow } from './categoryModel';
import { parseCategoryRow } from './categoryModel';
import { insertSyntheticFeaturedRow } from './categoryNormalize';

const VERSION = 'v2';

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
    if (fixed) void saveCachedCategories(withFeature, country);
    return withFeature;
  } catch {
    return [];
  }
}

export async function saveCachedCategories(rows: CategoryRow[], country?: CountryCode): Promise<void> {
  const key = categoryStorageKey(country);
  await AsyncStorage.setItem(key, JSON.stringify(rows));
}
