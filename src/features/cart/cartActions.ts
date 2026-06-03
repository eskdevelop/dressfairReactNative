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
import type { CartLineItem, WebCartRawItem } from './cartTypes';

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
): Promise<boolean> {
  const [incoming] = parseWebCartItems([web]);
  if (!incoming) return false;

  // A native add must clear any recent-delete tombstone for this line so the
  // write-back is not filtered as a stale re-add.
  dispatch(setRecentlyDeletedLines(
    store.getState().cart.recentlyDeletedLines.filter(d => d.lineKey !== incoming.lineKey),
  ));

  const existingIdx = currentItems.findIndex(r => r.lineKey === incoming.lineKey);
  let next: CartLineItem[];
  if (existingIdx >= 0) {
    const prev = currentItems[existingIdx];
    const quantity = Math.min(prev.quantity + incoming.quantity, 99);
    next = currentItems.map((row, i) =>
      i === existingIdx
        ? { ...row, quantity, web: { ...row.web, quantity } }
        : row,
    );
  } else {
    next = [incoming, ...currentItems];
  }

  await persistCartItems(dispatch, country, next);
  return true;
}

export async function updateCartLineQuantityAndPersist(
  dispatch: AppDispatch,
  country: CountryCode,
  lineKey: string,
  quantity: number,
  currentItems: CartLineItem[],
): Promise<void> {
  const q = Math.min(Math.max(Math.floor(quantity), 1), 99);
  const next = currentItems.map(row =>
    row.lineKey === lineKey ? { ...row, quantity: q, web: { ...row.web, quantity: q } } : row,
  );
  await persistCartItems(dispatch, country, next);
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
