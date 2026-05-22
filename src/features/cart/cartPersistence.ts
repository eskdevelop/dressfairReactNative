import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryCode } from '@shared/config/env';

import type { CartLineItem } from './cartTypes';

const STORAGE_PREFIX = 'dressfair_native_cart_v1';

function storageKey(country: CountryCode): string {
  return `${STORAGE_PREFIX}_${country}`;
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
  await Promise.all(keys.map(c => clearPersistedCart(c)));
}
