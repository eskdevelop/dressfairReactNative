import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryCode } from '@shared/config/env';

import type { DeletedCartLine } from './cartDeletedKeys';
import { pruneDeletedLines } from './cartDeletedKeys';
import type { CartLineItem } from './cartTypes';

const STORAGE_PREFIX = 'dressfair_native_cart_v1';
const DELETED_PREFIX = 'dressfair_native_cart_deleted_v1';

function storageKey(country: CountryCode): string {
  return `${STORAGE_PREFIX}_${country}`;
}

function deletedKey(country: CountryCode): string {
  return `${DELETED_PREFIX}_${country}`;
}

const isCartLine = (raw: unknown): raw is CartLineItem => {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.lineKey === 'string' &&
    typeof r.sku === 'string' &&
    typeof r.name === 'string' &&
    typeof r.quantity === 'number' &&
    typeof r.web === 'object'
  );
};

export async function loadPersistedCart(country: CountryCode): Promise<CartLineItem[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(country));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine).map(row => ({
      ...row,
      isSelected: row.isSelected ?? true,
    }));
  } catch {
    return [];
  }
}

export async function savePersistedCart(
  country: CountryCode,
  items: CartLineItem[],
): Promise<void> {
  await AsyncStorage.setItem(storageKey(country), JSON.stringify(items));
}

export async function clearPersistedCart(country: CountryCode): Promise<void> {
  await AsyncStorage.removeItem(storageKey(country));
}

export async function clearAllPersistedCarts(): Promise<void> {
  const keys = ['UAE', 'OMN', 'KSA'] as const;
  await Promise.all(
    keys.flatMap(c => [clearPersistedCart(c), savePersistedDeletedLines(c, [])]),
  );
}

const isDeletedLine = (raw: unknown): raw is DeletedCartLine => {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return typeof r.lineKey === 'string' && typeof r.deletedAt === 'number';
};

/**
 * Lines removed natively are remembered (within their TTL) so a stale web
 * `localStorage.cart` snapshot cannot re-add them. This guard normally lives in
 * redux, but a JS reload / cold start would drop it and let the storefront SPA
 * re-write the just-ordered line back into the cart — so we persist it too.
 */
export async function loadPersistedDeletedLines(
  country: CountryCode,
): Promise<DeletedCartLine[]> {
  try {
    const raw = await AsyncStorage.getItem(deletedKey(country));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return pruneDeletedLines(parsed.filter(isDeletedLine));
  } catch {
    return [];
  }
}

export async function savePersistedDeletedLines(
  country: CountryCode,
  lines: DeletedCartLine[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(deletedKey(country), JSON.stringify(pruneDeletedLines(lines)));
  } catch {
    // best-effort; the in-memory guard still applies for this session
  }
}
