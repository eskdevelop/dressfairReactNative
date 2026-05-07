import { store } from '@app/store';
import { setWishlist } from '@app/storeSlices/wishlistSlice';
import type { SearchProductHit } from '@features/search/searchApi';
import type { WishlistItem } from './wishlistStore';
import { wishlistStore } from './wishlistStore';
// Side-effecting wrapper around `wishlistStore` that also keeps the Redux
// mirror in sync. Every screen that wants to read or mutate the wishlist
// goes through this module so we never end up with Redux and AsyncStorage
// drifting out of agreement.
export const wishlist = {
  async hydrateFromStorage(): Promise<WishlistItem[]> {
    const list = await wishlistStore.list();
    store.dispatch(setWishlist(list));
    return list;
  },

  async toggle(hit: SearchProductHit): Promise<{ favourited: boolean }> {
    const { items, favourited } = await wishlistStore.toggle(hit);
    store.dispatch(setWishlist(items));
    return { favourited };
  },

  async remove(productId: string): Promise<void> {
    const next = await wishlistStore.remove(productId);
    store.dispatch(setWishlist(next));
  },

  async clearAll(): Promise<void> {
    await wishlistStore.clearAll();
    store.dispatch(setWishlist([]));
  },
};
