import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryCode } from '@shared/config/env';

import type { ListingProductRow } from '@features/categories/categoryModel';
import { parseListingProductRow } from '@features/categories/categoryModel';

const VERSION = 'v1';
const TTL_MS = 10 * 60 * 1000;

export type NewArrivalsPage1Cache = {
  products: ListingProductRow[];
  hasMore: boolean;
  savedAt: number;
};

const memoryByCountry = new Map<CountryCode, NewArrivalsPage1Cache>();

function storageKey(country: CountryCode): string {
  return `@dressfair/new_arrivals_page1_${VERSION}_${country}`;
}

function isFresh(entry: NewArrivalsPage1Cache): boolean {
  return Date.now() - entry.savedAt < TTL_MS;
}

export function getMemoryNewArrivalsPage1(country: CountryCode): NewArrivalsPage1Cache | null {
  const entry = memoryByCountry.get(country) ?? null;
  if (!entry || !isFresh(entry)) return null;
  return entry;
}

export async function loadCachedNewArrivalsPage1(country: CountryCode): Promise<NewArrivalsPage1Cache | null> {
  const mem = getMemoryNewArrivalsPage1(country);
  if (mem) return mem;

  const raw = await AsyncStorage.getItem(storageKey(country));
  if (!raw) return null;

  try {
    const decoded = JSON.parse(raw) as {
      products?: unknown;
      hasMore?: boolean;
      savedAt?: number;
    };
    if (
      !decoded.savedAt ||
      !isFresh({ savedAt: decoded.savedAt, products: [], hasMore: false })
    ) {
      return null;
    }
    const products = Array.isArray(decoded.products)
      ? (decoded.products.map(parseListingProductRow).filter(Boolean) as ListingProductRow[])
      : [];
    const entry: NewArrivalsPage1Cache = {
      products,
      hasMore: decoded.hasMore ?? products.length > 0,
      savedAt: decoded.savedAt,
    };
    memoryByCountry.set(country, entry);
    return entry;
  } catch {
    return null;
  }
}

export async function saveCachedNewArrivalsPage1(
  country: CountryCode,
  products: ListingProductRow[],
  hasMore: boolean,
): Promise<void> {
  const entry: NewArrivalsPage1Cache = {
    products,
    hasMore,
    savedAt: Date.now(),
  };
  memoryByCountry.set(country, entry);
  await AsyncStorage.setItem(storageKey(country), JSON.stringify(entry));
}

export function clearMemoryNewArrivalsCache(): void {
  memoryByCountry.clear();
}

export async function clearNewArrivalsCacheAllRegions(): Promise<void> {
  clearMemoryNewArrivalsCache();
  const countries: CountryCode[] = ['UAE', 'OMN', 'KSA'];
  await Promise.all(countries.map(c => AsyncStorage.removeItem(storageKey(c))));
}
