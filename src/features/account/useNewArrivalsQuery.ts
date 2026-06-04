import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@app/queryClient';
import type { CountryCode } from '@shared/config/env';

import { fetchNewArrivalsPage, type NewArrivalsPageResult } from './newArrivalsApi';
import {
  getMemoryNewArrivalsPage1,
  loadCachedNewArrivalsPage1,
  saveCachedNewArrivalsPage1,
} from './newArrivalsCache';

export function newArrivalsPage1QueryKey(country: CountryCode): readonly ['newArrivals', CountryCode, 1] {
  return ['newArrivals', country, 1];
}

async function fetchNewArrivalsPage1(country: CountryCode): Promise<NewArrivalsPageResult> {
  const res = await fetchNewArrivalsPage(1);
  if (!res.ok) {
    throw new Error(res.error ?? 'Could not load new arrivals');
  }
  void saveCachedNewArrivalsPage1(country, res.products, res.hasMore);
  return res;
}

/** Shared page-1 new arrivals for Cart and Menu tabs — dedupes in-flight requests. */
export function useNewArrivalsPage1Query(country: CountryCode) {
  const memorySeed = getMemoryNewArrivalsPage1(country);

  return useQuery({
    queryKey: newArrivalsPage1QueryKey(country),
    queryFn: () => fetchNewArrivalsPage1(country),
    placeholderData: memorySeed
      ? { ok: true as const, products: memorySeed.products, hasMore: memorySeed.hasMore }
      : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/** Warm Cart/Menu new-arrivals after Home paints or during idle bootstrap. */
export async function prefetchNewArrivalsPage1Query(country: CountryCode): Promise<void> {
  const memory = getMemoryNewArrivalsPage1(country);
  if (memory) {
    queryClient.setQueryData(newArrivalsPage1QueryKey(country), {
      ok: true,
      products: memory.products,
      hasMore: memory.hasMore,
    });
    return;
  }

  const disk = await loadCachedNewArrivalsPage1(country);
  if (disk) {
    queryClient.setQueryData(newArrivalsPage1QueryKey(country), {
      ok: true,
      products: disk.products,
      hasMore: disk.hasMore,
    });
  }

  await queryClient.prefetchQuery({
    queryKey: newArrivalsPage1QueryKey(country),
    queryFn: () => fetchNewArrivalsPage1(country),
    staleTime: 5 * 60 * 1000,
  });
}
