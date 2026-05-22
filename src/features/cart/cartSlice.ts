import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CartLineItem } from './cartTypes';
import { cartTotalQuantity, parseWebCartItems } from './parseWebCartItems';
import type { DeletedCartLine } from './cartDeletedKeys';
import { deletedLineKeySet, mergeDeletedLines, pruneDeletedLines } from './cartDeletedKeys';

type CartState = {
  items: CartLineItem[];
  hydrated: boolean;
  lastSyncedAt: number | null;
  /** Native cart changed (delete/qty) — must write back to web before applying web reads. */
  pendingWebWriteAt: number | null;
  webWriteGeneration: number;
  /** Lines removed natively — block stale web from re-adding for a TTL window. */
  recentlyDeletedLines: DeletedCartLine[];
};

const initialState: CartState = {
  items: [],
  hydrated: false,
  lastSyncedAt: null,
  pendingWebWriteAt: null,
  webWriteGeneration: 0,
  recentlyDeletedLines: [],
};

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    setCartItems(state, action: PayloadAction<CartLineItem[]>) {
      state.items = action.payload;
      state.lastSyncedAt = Date.now();
    },
    notifyNativeCartMutation(state) {
      state.pendingWebWriteAt = Date.now();
      state.webWriteGeneration += 1;
    },
    ackPendingWebWrite(state) {
      state.pendingWebWriteAt = null;
    },
    setRecentlyDeletedLines(state, action: PayloadAction<DeletedCartLine[]>) {
      state.recentlyDeletedLines = pruneDeletedLines(action.payload);
    },
    markDeletedLineKeys(state, action: PayloadAction<string[]>) {
      state.recentlyDeletedLines = mergeDeletedLines(state.recentlyDeletedLines, action.payload);
    },
    mergeWebCartSnapshot(state, action: PayloadAction<unknown[]>) {
      const prevByKey = new Map(state.items.map(row => [row.lineKey, row]));
      const deleted = deletedLineKeySet(state.recentlyDeletedLines);
      const incoming = parseWebCartItems(action.payload).filter(row => !deleted.has(row.lineKey));
      const merged = [...state.items];

      for (const row of incoming) {
        const prev = prevByKey.get(row.lineKey);
        if (prev) {
          const idx = merged.findIndex(m => m.lineKey === row.lineKey);
          if (idx >= 0) merged[idx] = { ...row, isSelected: prev.isSelected };
        } else {
          merged.push(row);
        }
      }

      state.items = merged;
      state.lastSyncedAt = Date.now();
      state.recentlyDeletedLines = pruneDeletedLines(state.recentlyDeletedLines);
    },
    toggleCartLineSelected(state, action: PayloadAction<string>) {
      const row = state.items.find(r => r.lineKey === action.payload);
      if (row) row.isSelected = !row.isSelected;
    },
    toggleSelectAllForCheckout(state) {
      const allSelected = state.items.length > 0 && state.items.every(r => r.isSelected);
      state.items.forEach(row => {
        row.isSelected = !allSelected;
      });
    },
    removeSelectedCartLines(state) {
      state.items = state.items.filter(row => !row.isSelected);
    },
    removeCartLine(state, action: PayloadAction<string>) {
      state.items = state.items.filter(row => row.lineKey !== action.payload);
    },
    setCartLineQuantity(
      state,
      action: PayloadAction<{ lineKey: string; quantity: number }>,
    ) {
      const { lineKey, quantity } = action.payload;
      const q = Math.min(Math.max(Math.floor(quantity), 1), 99);
      const row = state.items.find(r => r.lineKey === lineKey);
      if (row) row.quantity = q;
    },
    clearCart(state) {
      state.items = [];
      state.lastSyncedAt = null;
    },
  },
});

export const {
  setCartHydrated,
  setCartItems,
  notifyNativeCartMutation,
  ackPendingWebWrite,
  setRecentlyDeletedLines,
  markDeletedLineKeys,
  mergeWebCartSnapshot,
  removeCartLine,
  setCartLineQuantity,
  toggleCartLineSelected,
  toggleSelectAllForCheckout,
  removeSelectedCartLines,
  clearCart,
} = slice.actions;

export const cartReducer = slice.reducer;

export const selectCartItems = (state: { cart: CartState }): CartLineItem[] =>
  state.cart.items;

export const selectCartBadgeQuantity = (state: { cart: CartState }): number =>
  cartTotalQuantity(state.cart.items);

export const selectCartHydrated = (state: { cart: CartState }): boolean =>
  state.cart.hydrated;

export const selectPendingWebWriteAt = (state: { cart: CartState }): number | null =>
  state.cart.pendingWebWriteAt;

export const selectWebWriteGeneration = (state: { cart: CartState }): number =>
  state.cart.webWriteGeneration;
