import type { ProductDetail } from '@features/categories/productDetailApi';
import { fetchProductDetail } from '@features/categories/productDetailApi';

import type { CartLineItem, WebCartRawItem } from './cartTypes';

export const CART_QUANTITY_DROPDOWN_MAX = 5;
export const CART_QUANTITY_MAX = 99;

const asNum = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.floor(n);
  }
  return null;
};

/** Read stock from a web `localStorage.cart` row when the storefront includes it. */
export function availableQuantityFromWebItem(web: WebCartRawItem): number | null {
  const raw =
    web.available_quantity ??
    web.availableQuantity ??
    web.available_qty ??
    web.availableQty;
  const n = asNum(raw);
  return n !== null && n >= 0 ? n : null;
}

/** Stock for a variant: size option qty when `productOptionId` is set, else product-level qty. */
export function availableQuantityFromProductDetail(
  detail: ProductDetail,
  productOptionId: number,
): number {
  if (productOptionId > 0) {
    const opt = detail.sizeOptions.find(o => o.productOptionId === productOptionId);
    if (opt) return Math.max(0, Math.floor(opt.availableQuantity));
  }
  return Math.max(0, Math.floor(detail.availableQty));
}

export async function fetchAvailableQuantityForCartLine(
  row: Pick<CartLineItem, 'sku' | 'productOptionId' | 'availableQuantity'>,
  options?: { forceRefresh?: boolean },
): Promise<number> {
  if (
    !options?.forceRefresh &&
    row.availableQuantity != null &&
    row.availableQuantity >= 0
  ) {
    return row.availableQuantity;
  }
  const res = await fetchProductDetail(row.sku);
  if (!res.ok) return CART_QUANTITY_MAX;
  return availableQuantityFromProductDetail(res.detail, row.productOptionId);
}

export function clampCartQuantity(requested: number, available: number): number {
  const req = Math.floor(requested);
  if (available <= 0) return 0;
  return Math.min(Math.max(req, 1), CART_QUANTITY_MAX, available);
}

/** Dropdown presets 1…min(5, available). */
export function presetQuantityOptions(available: number): number[] {
  if (available <= 0) return [];
  const cap = Math.min(CART_QUANTITY_DROPDOWN_MAX, available);
  return Array.from({ length: cap }, (_, i) => i + 1);
}

export function canIncreaseCartQuantity(current: number, available: number): boolean {
  return current < clampCartQuantity(current + 1, available);
}

export type CartQuantityChangeResult =
  | { ok: true; quantity: number; available: number }
  | { ok: false; reason: 'not_found' | 'out_of_stock' | 'exceeds_stock'; available: number; requested: number };

export function evaluateCartQuantityChange(
  requested: number,
  available: number,
): CartQuantityChangeResult {
  const req = Math.floor(requested);
  if (available <= 0) {
    return { ok: false, reason: 'out_of_stock', available: 0, requested: req };
  }
  const clamped = clampCartQuantity(req, available);
  if (clamped === 0) {
    return { ok: false, reason: 'out_of_stock', available, requested: req };
  }
  if (clamped < req) {
    return { ok: false, reason: 'exceeds_stock', available, requested: req };
  }
  return { ok: true, quantity: clamped, available };
}

/** True once stock is known and the variant cannot be purchased. */
export function isCartLineUnavailable(
  available: number | undefined,
  stockKnown: boolean,
): boolean {
  return stockKnown && available === 0;
}

export function partitionCartLinesByStock(
  items: CartLineItem[],
  stockByLineKey: Record<string, number>,
): { available: CartLineItem[]; unavailable: CartLineItem[]; stockLoaded: boolean } {
  const stockLoaded =
    items.length === 0 || items.every(row => row.lineKey in stockByLineKey);

  if (!stockLoaded) {
    return { available: items, unavailable: [], stockLoaded: false };
  }

  const available: CartLineItem[] = [];
  const unavailable: CartLineItem[] = [];
  for (const row of items) {
    const stock = stockByLineKey[row.lineKey] ?? row.availableQuantity ?? CART_QUANTITY_MAX;
    if (isCartLineUnavailable(stock, true)) {
      unavailable.push({ ...row, availableQuantity: 0, isSelected: false });
    } else {
      available.push({
        ...row,
        availableQuantity: stock,
      });
    }
  }
  return { available, unavailable, stockLoaded: true };
}

export function withAvailableOnCartLine(
  row: CartLineItem,
  available: number,
  quantity?: number,
): CartLineItem {
  const q = quantity ?? row.quantity;
  return {
    ...row,
    quantity: q,
    availableQuantity: available,
    web: {
      ...row.web,
      quantity: q,
      available_quantity: available,
    },
  };
}
