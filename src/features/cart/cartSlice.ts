import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CartLineItem } from './cartTypes';
import { cartTotalQuantity } from './parseWebCartItems';
import type { DeletedCartLine } from './cartDeletedKeys';
import { mergeDeletedLines, pruneDeletedLines } from './cartDeletedKeys';

type CartState = {
  items: CartLineItem[];
  hydrated: boolean;
  lastSyncedAt: number | null;
  /** Native cart changed (delete/qty) — must write back to web before applying web reads. */
  pendingWebWriteAt: number | null;
  webWriteGeneration: number;
  /** Lines removed natively — block stale web from re-adding for a TTL window. */
  recentlyDeletedLines: DeletedCartLine[];
  /** Quantities from the previous web snapshot this session (key → qty) for diffing re-adds. */
  lastWebCartByKey: Record<string, number>;
  /** True once we've recorded a web snapshot this session (baseline for deliberate-add detection). */
  webBaselineReady: boolean;
  /** Bumped when a native delete/clear must reload the Home WebView so its SPA drops ghost lines. */
  webCartReloadSeq: number;
};

const initialState: CartState = {
  items: [],
  hydrated: false,
  lastSyncedAt: null,
  pendingWebWriteAt: null,
  webWriteGeneration: 0,
  recentlyDeletedLines: [],
  lastWebCartByKey: {},
  webBaselineReady: false,
  webCartReloadSeq: 0,
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
    recordWebSnapshot(state, action: PayloadAction<Record<string, number>>) {
      state.lastWebCartByKey = action.payload;
      state.webBaselineReady = true;
    },
    requestWebCartReload(state) {
      state.webCartReloadSeq += 1;
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
  recordWebSnapshot,
  requestWebCartReload,
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

export const selectWebCartReloadSeq = (state: { cart: CartState }): number =>
  state.cart.webCartReloadSeq;
