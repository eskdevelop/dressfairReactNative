import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryCode } from '@shared/config/env';

import type { ProductListingPagination } from './categoryApi';
import type { ListingProductRow } from './categoryModel';
import { parseListingProductRow } from './categoryModel';

const VERSION = 'v1';
/** Page-1 listing cache TTL — short enough to stay fresh, long enough to skip repeat spinners. */
const TTL_MS = 10 * 60 * 1000;

export type ListingPage1Cache = {
  products: ListingProductRow[];
  pagination: ProductListingPagination;
  savedAt: number;
};

const memoryByKey = new Map<string, ListingPage1Cache>();

function resolveCountry(country: CountryCode): CountryCode {
  return country;
}

export function listingPage1CacheKey(
  country: CountryCode,
  cateKey: string,
  sort: string,
  order: string,
): string {
  return `${VERSION}:${country}:${cateKey}:${sort}:${order}`;
}

function storageKey(country: CountryCode, cateKey: string, sort: string, order: string): string {
  return `@dressfair/listing_page1_${listingPage1CacheKey(country, cateKey, sort, order)}`;
}

function isFresh(entry: ListingPage1Cache): boolean {
  return Date.now() - entry.savedAt < TTL_MS;
}

export function getMemoryListingPage1(
  country: CountryCode,
  cateKey: string,
  sort: string,
  order: string,
): ListingPage1Cache | null {
  const key = listingPage1CacheKey(country, cateKey, sort, order);
  const entry = memoryByKey.get(key) ?? null;
  if (!entry || !isFresh(entry)) return null;
  return entry;
}

export async function loadCachedListingPage1(
  country: CountryCode,
  cateKey: string,
  sort: string,
  order: string,
): Promise<ListingPage1Cache | null> {
  const mem = getMemoryListingPage1(country, cateKey, sort, order);
  if (mem) return mem;

  const raw = await AsyncStorage.getItem(storageKey(country, cateKey, sort, order));
  if (!raw) return null;

  try {
    const decoded = JSON.parse(raw) as {
      products?: unknown;
      pagination?: ProductListingPagination;
      savedAt?: number;
    };
    if (!decoded.savedAt || !isFresh({ savedAt: decoded.savedAt, products: [], pagination: { currentPage: 1, lastPage: 1 } })) {
      return null;
    }
    const products = Array.isArray(decoded.products)
      ? (decoded.products.map(parseListingProductRow).filter(Boolean) as ListingProductRow[])
      : [];
    const pagination = decoded.pagination ?? { currentPage: 1, lastPage: 1 };
    const entry: ListingPage1Cache = { products, pagination, savedAt: decoded.savedAt };
    memoryByKey.set(listingPage1CacheKey(country, cateKey, sort, order), entry);
    return entry;
  } catch {
    return null;
  }
}

export async function saveCachedListingPage1(
  country: CountryCode,
  cateKey: string,
  sort: string,
  order: string,
  products: ListingProductRow[],
  pagination: ProductListingPagination,
): Promise<void> {
  const c = resolveCountry(country);
  const entry: ListingPage1Cache = {
    products,
    pagination,
    savedAt: Date.now(),
  };
  const key = listingPage1CacheKey(c, cateKey, sort, order);
  memoryByKey.set(key, entry);
  await AsyncStorage.setItem(storageKey(c, cateKey, sort, order), JSON.stringify(entry));
}

export function clearMemoryListingCache(): void {
  memoryByKey.clear();
}
