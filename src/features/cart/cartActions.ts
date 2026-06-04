import type { AppDispatch } from '@app/store';
import { store } from '@app/store';
import { setCartBadgeQuantity } from '@app/storeSlices/cartBadgeSlice';
import type { CountryCode } from '@shared/config/env';

import { deletedLineKeySet } from './cartDeletedKeys';
import {
  ackPendingWebWrite,
  clearCart,
  markDeletedLineKeys,
  mergeWebCartSnapshot,
  notifyNativeCartMutation,
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
  savePersistedCart,
} from './cartPersistence';
import { cartContentsMatchNative, filterStaleWebCartRows, shouldApplyWebCartSnapshot } from './cartSyncUtils';
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

export async function hydrateNativeCart(
  dispatch: AppDispatch,
  country: CountryCode,
): Promise<void> {
  const items = await loadPersistedCart(country);
  dispatch(setCartItems(items));
  syncBadge(dispatch, items);
  dispatch(setCartHydrated(true));
}

/** Replace native cart with a web `localStorage.cart` snapshot. */
export async function applyWebCartSnapshot(
  dispatch: AppDispatch,
  country: CountryCode,
  rawItems: unknown[],
): Promise<void> {
  const { items: nativeItems, pendingWebWriteAt, recentlyDeletedLines } = store.getState().cart;
  const filteredRaw = filterStaleWebCartRows(rawItems, recentlyDeletedLines);

  if (cartContentsMatchNative(nativeItems, filteredRaw)) {
    if (pendingWebWriteAt) dispatch(ackPendingWebWrite());
    return;
  }

  if (!shouldApplyWebCartSnapshot(nativeItems, filteredRaw, pendingWebWriteAt)) {
    return;
  }

  const hadStaleRows = webSnapshotHasStaleDeletedLines(rawItems, recentlyDeletedLines);

  dispatch(mergeWebCartSnapshot(filteredRaw));
  const items = store.getState().cart.items;
  await savePersistedCart(country, items);
  syncBadge(dispatch, items);
  dispatch(ackPendingWebWrite());

  // Reconcile Home WebView localStorage with native truth (drops ghost lines).
  if (hadStaleRows || !cartContentsMatchNative(items, rawItems)) {
    dispatch(notifyNativeCartMutation());
  }
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
  dispatch(notifyNativeCartMutation());
  dispatch(clearCart());
  await clearPersistedCart(country);
  dispatch(setCartBadgeQuantity(0));
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
  const next = currentItems.filter(r => r.lineKey !== lineKey);
  await persistCartItems(dispatch, country, next);
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
  if (removedKeys.length > 0) dispatch(markDeletedLineKeys(removedKeys));
  const next = currentItems.filter(row => !row.isSelected);
  await persistCartItems(dispatch, country, next);
}

/** Flutter `removeCheckoutSelectedItems` — after successful native checkout. */
export async function removeSelectedCartLinesAfterOrder(
  dispatch: AppDispatch,
  country: CountryCode,
  currentItems: CartLineItem[],
): Promise<void> {
  await removeSelectedCartLinesAndPersist(dispatch, country, currentItems);
}

/** True when web snapshot still contains lines native recently deleted. */
export function webSnapshotHasStaleDeletedLines(
  rawItems: unknown[],
  recentlyDeletedLines: { lineKey: string; deletedAt: number }[],
): boolean {
  if (!Array.isArray(rawItems)) return false;
  const deleted = deletedLineKeySet(recentlyDeletedLines);
  if (deleted.size === 0) return false;
  return parseWebCartItems(rawItems).some(row => deleted.has(row.lineKey));
}
