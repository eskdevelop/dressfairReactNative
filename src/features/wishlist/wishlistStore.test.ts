import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SearchProductHit } from '@features/search/searchApi';

import { wishlistStore } from './wishlistStore';

const baseHit = (overrides: Partial<SearchProductHit> = {}): SearchProductHit => ({
  productId: '101',
  sku: 'C-101',
  name: 'Maxi Dress',
  price: '120.00',
  specialPrice: null,
  imageUrl: 'https://example.com/i.jpg',
  currencyCode: 'AED',
  href: '/ae/p/C-101',
  ...overrides,
});

describe('wishlistStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('returns an empty list when storage is empty', async () => {
    await expect(wishlistStore.list()).resolves.toEqual([]);
  });

  test('add persists a hit and stamps it with favouritedAt', async () => {
    const before = Date.now();
    const items = await wishlistStore.add(baseHit());
    const after = Date.now();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject(baseHit());
    expect(items[0].favouritedAt).toBeGreaterThanOrEqual(before);
    expect(items[0].favouritedAt).toBeLessThanOrEqual(after);
  });

  test('add de-dupes by productId, keeping the newest entry first', async () => {
    await wishlistStore.add(baseHit({ productId: '1', name: 'A' }));
    await wishlistStore.add(baseHit({ productId: '2', name: 'B' }));
    const items = await wishlistStore.add(
      baseHit({ productId: '1', name: 'A updated' }),
    );
    expect(items.map(i => i.productId)).toEqual(['1', '2']);
    expect(items[0].name).toBe('A updated');
  });

  test('toggle adds when missing and removes when present', async () => {
    const first = await wishlistStore.toggle(baseHit({ productId: '1' }));
    expect(first.favourited).toBe(true);
    expect(first.items).toHaveLength(1);

    const second = await wishlistStore.toggle(baseHit({ productId: '1' }));
    expect(second.favourited).toBe(false);
    expect(second.items).toHaveLength(0);
  });

  test('remove drops the requested productId', async () => {
    await wishlistStore.add(baseHit({ productId: '1' }));
    await wishlistStore.add(baseHit({ productId: '2' }));
    const items = await wishlistStore.remove('1');
    expect(items.map(i => i.productId)).toEqual(['2']);
  });

  test('list ignores corrupted shapes', async () => {
    await AsyncStorage.setItem(
      'dressfair_wishlist_v1',
      JSON.stringify([{ wrongShape: true }, baseHit({ productId: 'ok' })]),
    );
    // The valid entry is missing the required `favouritedAt`, so both are
    // dropped — the store never returns half-formed records to the UI.
    await expect(wishlistStore.list()).resolves.toEqual([]);
  });
});
