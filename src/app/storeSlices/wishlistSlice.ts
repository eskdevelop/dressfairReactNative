import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { WishlistItem } from '@features/wishlist/wishlistStore';

// Mirrors the AsyncStorage-backed wishlist into Redux so the search heart
// icon, the Menu wishlist shortcut hint, and the WishlistScreen list all render
// reactively without each having to read AsyncStorage on focus. AsyncStorage
// is the source of truth across launches; Redux is a runtime cache replaced
// wholesale after every wishlistStore mutation.
type WishlistState = {
  items: WishlistItem[];
  hydrated: boolean;
};

const initialState: WishlistState = {
  items: [],
  hydrated: false,
};

const slice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },
  },
});

export const { setWishlist } = slice.actions;
export const wishlistReducer = slice.reducer;
