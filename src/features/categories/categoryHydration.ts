import type { CountryCode } from '@shared/config/env';

import { fetchCategoriesFromNetwork } from './categoryApi';
import { loadCachedCategories, saveCachedCategories } from './categoryCache';
import type { CategoryRow } from './categoryModel';
import { insertSyntheticFeaturedRow } from './categoryNormalize';

export type NormalizePersistResult = {
  ok: boolean;
  categories: CategoryRow[];
  error?: string;
};

/**
 * Fetches mobile-categories, applies Flutter-parity synthetic "Feature" row, persists AsyncStorage.
 * Does not read cache — use `loadCategoryTreeForHub` or `prefetchCategoryCacheIfStale` at call sites.
 */
export async function fetchNormalizeAndPersist(country: CountryCode): Promise<NormalizePersistResult> {
  const res = await fetchCategoriesFromNetwork(country);
  if (!res.ok || !res.categories?.length) {
    return { ok: false, categories: [], error: res.error ?? 'Categories request failed' };
  }

  const merged = insertSyntheticFeaturedRow(res.categories);
  await saveCachedCategories(merged, country);
  return { ok: true, categories: merged };
}

/** Flutter Hive short-circuit: return cache when non-empty; otherwise fetch + persist. */
export async function loadCategoryTreeForHub(country: CountryCode): Promise<NormalizePersistResult> {
  const cached = await loadCachedCategories(country);
  if (cached.length > 0) {
    return { ok: true, categories: cached };
  }
  return fetchNormalizeAndPersist(country);
}

/** Cold-start warmup: skip network when cache already populated. */
export async function prefetchCategoryCacheIfStale(country: CountryCode): Promise<{
  ok: boolean;
  skipped: boolean;
  categories: CategoryRow[];
  error?: string;
}> {
  const cached = await loadCachedCategories(country);
  if (cached.length > 0) {
    return { ok: true, skipped: true, categories: cached };
  }

  const r = await fetchNormalizeAndPersist(country);
  return { ok: r.ok, skipped: false, categories: r.categories, error: r.error };
}
