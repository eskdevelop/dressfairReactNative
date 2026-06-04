import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@app/queryClient';
import type { CountryCode } from '@shared/config/env';

import { getMemoryCategories } from './categoryCache';
import { fetchNormalizeAndPersist, loadCategoryTreeForHub } from './categoryHydration';
import type { CategoryRow } from './categoryModel';

export function categoryTreeQueryKey(country: CountryCode): readonly ['categoryTree', CountryCode] {
  return ['categoryTree', country];
}

async function fetchCategoryTree(country: CountryCode): Promise<CategoryRow[]> {
  const result = await loadCategoryTreeForHub(country);
  if (!result.ok || result.categories.length === 0) {
    throw new Error(result.error ?? 'Could not load categories');
  }
  return result.categories;
}

/** Shared category tree with stale-while-revalidate across hub, search, and bootstrap. */
export function useCategoryTreeQuery(country: CountryCode) {
  const memorySeed = getMemoryCategories(country);

  return useQuery({
    queryKey: categoryTreeQueryKey(country),
    queryFn: () => fetchCategoryTree(country),
    placeholderData: memorySeed.length > 0 ? memorySeed : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/** Cold-start warmup: populate memory/disk then seed React Query cache. */
export async function prefetchCategoryTreeQuery(country: CountryCode): Promise<{
  ok: boolean;
  skipped: boolean;
  categories: CategoryRow[];
  error?: string;
}> {
  const memory = getMemoryCategories(country);
  if (memory.length > 0) {
    queryClient.setQueryData(categoryTreeQueryKey(country), memory);
    return { ok: true, skipped: true, categories: memory };
  }

  const fromDisk = await loadCategoryTreeForHub(country);
  if (fromDisk.ok && fromDisk.categories.length > 0) {
    queryClient.setQueryData(categoryTreeQueryKey(country), fromDisk.categories);
    return { ok: true, skipped: true, categories: fromDisk.categories };
  }

  const r = await fetchNormalizeAndPersist(country);
  if (r.ok && r.categories.length > 0) {
    queryClient.setQueryData(categoryTreeQueryKey(country), r.categories);
  }
  return { ok: r.ok, skipped: false, categories: r.categories, error: r.error };
}
