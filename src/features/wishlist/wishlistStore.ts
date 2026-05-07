import AsyncStorage from '@react-native-async-storage/async-storage';
import type {SearchProductHit} from '@features/search/searchApi';

const STORAGE_KEY = 'dressfair_wishlist_v1';
const MAX_STORED = 200;

// A wishlist entry is a `SearchProductHit` augmented with the timestamp of
// when the user favourited it, so we can sort newest-first in the UI without
// needing a server round trip. Storing the entire hit (not just the id) is
// what makes the wishlist work fully offline — the user can browse names,
// prices, and images even with no internet.
export type WishlistItem = SearchProductHit & {
  favouritedAt: number;
};

const isWishlistItem = (raw: unknown): raw is WishlistItem => {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.productId === 'string' &&
    typeof r.name === 'string' &&
    typeof r.href === 'string' &&
    typeof r.favouritedAt === 'number'
  );
};

export const wishlistStore = {
  async list(): Promise<WishlistItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isWishlistItem);
    } catch {
      return [];
    }
  },

  async add(hit: SearchProductHit): Promise<WishlistItem[]> {
    const current = await wishlistStore.list();
    const item: WishlistItem = { ...hit, favouritedAt: Date.now() };
    const next = [
      item,
      ...current.filter(existing => existing.productId !== hit.productId),
    ].slice(0, MAX_STORED);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async remove(productId: string): Promise<WishlistItem[]> {
    const current = await wishlistStore.list();
    const next = current.filter(item => item.productId !== productId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  // Toggle the favourited state for a hit. Returns the next list and a
  // boolean that tells the caller whether the item is now favourited (true)
  // or was just removed (false), which lets the UI animate / snackbar
  // accordingly without a second list read.
  async toggle(
    hit: SearchProductHit,
  ): Promise<{ items: WishlistItem[]; favourited: boolean }> {
    const current = await wishlistStore.list();
    const wasFavourited = current.some(
      item => item.productId === hit.productId,
    );
    if (wasFavourited) {
      const items = await wishlistStore.remove(hit.productId);
      return { items, favourited: false };
    }
    const items = await wishlistStore.add(hit);
    return { items, favourited: true };
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
