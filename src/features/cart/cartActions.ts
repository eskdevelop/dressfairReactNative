import type { AppDispatch } from '@app/store';
import { store } from '@app/store';
import { setCartBadgeQuantity } from '@app/storeSlices/cartBadgeSlice';
import type { CountryCode } from '@shared/config/env';

import {
  ackPendingWebWrite,
  clearCart,
  markDeletedLineKeys,
  notifyNativeCartMutation,
  recordWebSnapshot,
  requestWebCartReload,
  setCartHydrated,
  setCartItems,
  setRecentlyDeletedLines,
  toggleCartLineSelected,
  toggleSelectAllForCheckout,
} from './cartSlice';
import { cartTotalQuantity, parseWebCartItems } from './parseWebCartItems';
import {
  clearPersistedCart,
  loadPersistedCart,
  loadPersistedDeletedLines,
  savePersistedCart,
  savePersistedDeletedLines,
} from './cartPersistence';
import { pruneDeletedLines } from './cartDeletedKeys';
import { reconcileWebCartSnapshot } from './cartSyncUtils';
import {
  CART_QUANTITY_MAX,
  clampCartQuantity,
  evaluateCartQuantityChange,
  fetchAvailableQuantityForCartLine,
  withAvailableOnCartLine,
  type CartQuantityChangeResult,
} from './cartStock';
import type { CartLineItem, WebCartRawItem } from './cartTypes';

export type { CartQuantityChangeResult } from './cartStock';
export type AddToCartResult = 'added' | 'exceeds_stock' | 'out_of_stock' | 'invalid';

function syncBadge(dispatch: AppDispatch, items: CartLineItem[]): void {
  dispatch(setCartBadgeQuantity(cartTotalQuantity(items)));
}

/** Persist the current deleted-lines guard so it survives a reload / cold start. */
function persistDeletedLines(country: CountryCode): void {
  void savePersistedDeletedLines(country, store.getState().cart.recentlyDeletedLines);
}

export async function hydrateNativeCart(
  dispatch: AppDispatch,
  country: CountryCode,
): Promise<void> {
  const [persistedItems, deletedLines] = await Promise.all([
    loadPersistedCart(country),
    loadPersistedDeletedLines(country),
  ]);
  if (deletedLines.length > 0) {
    dispatch(setRecentlyDeletedLines(deletedLines));
  }

  // User may add to cart before this async hydrate finishes on cold start — do not
  // overwrite in-memory lines with a stale empty read from AsyncStorage.
  const memoryItems = store.getState().cart.items;
  if (memoryItems.length > 0 && persistedItems.length === 0) {
    await savePersistedCart(country, memoryItems);
    syncBadge(dispatch, memoryItems);
  } else {
    dispatch(setCartItems(persistedItems));
    syncBadge(dispatch, persistedItems);
  }
  dispatch(setCartHydrated(true));
}

export type ApplyWebCartSnapshotResult = {
  /** Why the snapshot was or wasn't merged into the native cart. */
  outcome: 'matched' | 'blocked' | 'merged';
  /** Rows posted by the web bridge. */
  rawCount: number;
  /** Rows surviving the recently-deleted guard. */
  filteredCount: number;
  /** Native cart line count after handling. */
  nativeCount: number;
};

/** Reconcile the native cart with a web `localStorage.cart` snapshot. */
export async function applyWebCartSnapshot(
  dispatch: AppDispatch,
  country: CountryCode,
  rawItems: unknown[],
): Promise<ApplyWebCartSnapshotResult> {
  const state = store.getState().cart;
  const rawCount = Array.isArray(rawItems) ? rawItems.length : 0;

  const result = reconcileWebCartSnapshot({
    nativeItems: state.items,
    rawWebItems: rawItems,
    recentlyDeletedLines: state.recentlyDeletedLines,
    lastWebCartByKey: state.lastWebCartByKey,
    hasWebBaseline: state.webBaselineReady,
  });

  // Remember this snapshot so the next diff can spot deliberate re-adds.
  dispatch(recordWebSnapshot(result.nextWebCartByKey));

  // Persist any guard entries lifted by a deliberate re-add.
  const prunedPrevGuard = pruneDeletedLines(state.recentlyDeletedLines);
  if (result.nextDeletedLines.length !== prunedPrevGuard.length) {
    dispatch(setRecentlyDeletedLines(result.nextDeletedLines));
    void savePersistedDeletedLines(country, result.nextDeletedLines);
  }

  const filteredCount = result.items.length;

  if (result.isEmptyWeb) {
    if (state.pendingWebWriteAt) dispatch(ackPendingWebWrite());
    syncBadge(dispatch, state.items);
    return { outcome: 'blocked', rawCount, filteredCount: 0, nativeCount: state.items.length };
  }

  if (!result.changed) {
    if (state.pendingWebWriteAt) dispatch(ackPendingWebWrite());
    syncBadge(dispatch, result.items);
    return { outcome: 'matched', rawCount, filteredCount, nativeCount: result.items.length };
  }

  dispatch(setCartItems(result.items));
  await savePersistedCart(country, result.items);
  syncBadge(dispatch, result.items);
  if (state.pendingWebWriteAt) dispatch(ackPendingWebWrite());

  // Web still holds guarded ghosts — rewrite web localStorage from native truth.
  if (result.webHasGhosts) {
    dispatch(notifyNativeCartMutation());
  }

  return { outcome: 'merged', rawCount, filteredCount, nativeCount: result.items.length };
}

export async function persistCartItems(
  dispatch: AppDispatch,
  country: CountryCode,
  items: CartLineItem[],
  options?: { writeToWeb?: boolean },
): Promise<void> {
  const writeToWeb = options?.writeToWeb ?? true;
  if (writeToWeb) {
    dispatch(notifyNativeCartMutation());
  }
  dispatch(setCartItems(items));
  await savePersistedCart(country, items);
  syncBadge(dispatch, items);
}

export async function clearNativeCart(
  dispatch: AppDispatch,
  country: CountryCode,
): Promise<void> {
  const removedKeys = store.getState().cart.items.map(row => row.lineKey);
  if (removedKeys.length > 0) {
    dispatch(markDeletedLineKeys(removedKeys));
    persistDeletedLines(country);
  }
  dispatch(notifyNativeCartMutation());
  dispatch(clearCart());
  await clearPersistedCart(country);
  dispatch(setCartBadgeQuantity(0));
  // Reload the Home WebView so its SPA drops the just-cleared lines from memory.
  dispatch(requestWebCartReload());
}

/**
 * Native add-to-cart (quick-add sheet). Builds a web-shaped cart line so the
 * existing native->web write-back (`notifyNativeCartMutation`) syncs it into
 * webview `localStorage.cart`. Merges by `lineKey` (sku::product_option_id),
 * incrementing quantity when the same variant is already in the cart.
 */
export async function addProductToCartAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  web: WebCartRawItem,
  currentItems: CartLineItem[],
  options?: { availableQuantity?: number },
): Promise<AddToCartResult> {
  const [incoming] = parseWebCartItems([web]);
  if (!incoming) return 'invalid';

  const available =
    options?.availableQuantity ??
    incoming.availableQuantity ??
    (await fetchAvailableQuantityForCartLine(incoming));

  if (available <= 0) return 'out_of_stock';

  dispatch(setRecentlyDeletedLines(
    store.getState().cart.recentlyDeletedLines.filter(d => d.lineKey !== incoming.lineKey),
  ));
  persistDeletedLines(country);

  const existingIdx = currentItems.findIndex(r => r.lineKey === incoming.lineKey);
  let next: CartLineItem[];
  if (existingIdx >= 0) {
    const prev = currentItems[existingIdx];
    const requested = prev.quantity + incoming.quantity;
    const quantity = clampCartQuantity(requested, available);
    if (quantity < requested) return 'exceeds_stock';
    next = currentItems.map((row, i) =>
      i === existingIdx ? withAvailableOnCartLine(row, available, quantity) : row,
    );
  } else {
    const quantity = clampCartQuantity(incoming.quantity, available);
    if (quantity < incoming.quantity) return 'exceeds_stock';
    next = [withAvailableOnCartLine(incoming, available, quantity), ...currentItems];
  }

  await persistCartItems(dispatch, country, next);
  return 'added';
}

export async function updateCartLineQuantityWithStockCheck(
  dispatch: AppDispatch,
  country: CountryCode,
  lineKey: string,
  quantity: number,
  currentItems: CartLineItem[],
): Promise<CartQuantityChangeResult> {
  const row = currentItems.find(r => r.lineKey === lineKey);
  if (!row) {
    return { ok: false, reason: 'not_found', available: 0, requested: quantity };
  }

  const available = await fetchAvailableQuantityForCartLine(row, { forceRefresh: true });
  const verdict = evaluateCartQuantityChange(quantity, available);
  if (!verdict.ok) return verdict;

  const next = currentItems.map(r =>
    r.lineKey === lineKey ? withAvailableOnCartLine(r, available, verdict.quantity) : r,
  );
  await persistCartItems(dispatch, country, next);
  return verdict;
}

/** @deprecated Prefer {@link updateCartLineQuantityWithStockCheck} for UI flows. */
export async function updateCartLineQuantityAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  lineKey: string,
  quantity: number,
  currentItems: CartLineItem[],
): Promise<void> {
  const q = Math.min(Math.max(Math.floor(quantity), 1), CART_QUANTITY_MAX);
  const next = currentItems.map(row =>
    row.lineKey === lineKey ? { ...row, quantity: q, web: { ...row.web, quantity: q } } : row,
  );
  await persistCartItems(dispatch, country, next);
}

/** Unselect lines that are out of stock so checkout totals stay correct. */
export async function deselectUnavailableCartLines(
  dispatch: AppDispatch,
  country: CountryCode,
  currentItems: CartLineItem[],
  stockByLineKey: Record<string, number>,
): Promise<void> {
  const next = currentItems.map(row =>
    stockByLineKey[row.lineKey] === 0 ? { ...row, isSelected: false } : row,
  );
  const changed = next.some((row, i) => row.isSelected !== currentItems[i].isSelected);
  if (!changed) return;
  await persistCartItems(dispatch, country, next, { writeToWeb: false });
}

export async function removeCartLineAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  lineKey: string,
  currentItems: CartLineItem[],
): Promise<void> {
  dispatch(markDeletedLineKeys([lineKey]));
  persistDeletedLines(country);
  const next = currentItems.filter(r => r.lineKey !== lineKey);
  await persistCartItems(dispatch, country, next);
  // Reload the Home WebView so its SPA drops the removed line from memory.
  dispatch(requestWebCartReload());
}

export async function toggleCartLineSelectedAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  lineKey: string,
  currentItems: CartLineItem[],
): Promise<void> {
  dispatch(toggleCartLineSelected(lineKey));
  const next = currentItems.map(row =>
    row.lineKey === lineKey ? { ...row, isSelected: !row.isSelected } : row,
  );
  await persistCartItems(dispatch, country, next, { writeToWeb: false });
}

export async function toggleSelectAllForCheckoutAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  currentItems: CartLineItem[],
): Promise<void> {
  const allSelected = currentItems.length > 0 && currentItems.every(r => r.isSelected);
  const nextSelected = !allSelected;
  dispatch(toggleSelectAllForCheckout());
  const next = currentItems.map(row => ({ ...row, isSelected: nextSelected }));
  await persistCartItems(dispatch, country, next, { writeToWeb: false });
}

/** Select/deselect only in-stock lines; unavailable lines stay unchecked. */
export async function toggleSelectAllInStockForCheckoutAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  allItems: CartLineItem[],
  inStockLineKeys: string[],
): Promise<void> {
  const keySet = new Set(inStockLineKeys);
  const inStock = allItems.filter(r => keySet.has(r.lineKey));
  if (inStock.length === 0) return;
  const allSelected = inStock.every(r => r.isSelected);
  const nextSelected = !allSelected;
  const next = allItems.map(row =>
    keySet.has(row.lineKey) ? { ...row, isSelected: nextSelected } : { ...row, isSelected: false },
  );
  dispatch(setCartItems(next));
  await persistCartItems(dispatch, country, next, { writeToWeb: false });
}

export async function removeSelectedCartLinesAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  currentItems: CartLineItem[],
): Promise<void> {
  const removedKeys = currentItems.filter(row => row.isSelected).map(row => row.lineKey);
  if (removedKeys.length > 0) {
    dispatch(markDeletedLineKeys(removedKeys));
    persistDeletedLines(country);
  }
  const next = currentItems.filter(row => !row.isSelected);
  await persistCartItems(dispatch, country, next);
  // Reload the Home WebView so its SPA drops the removed lines from memory.
  dispatch(requestWebCartReload());
}

/** Flutter `removeCheckoutSelectedItems` — after successful native checkout. */
export async function removeSelectedCartLinesAfterOrder(
  dispatch: AppDispatch,
  country: CountryCode,
  currentItems: CartLineItem[],
): Promise<void> {
  await removeSelectedCartLinesAndPersist(dispatch, country, currentItems);
}
