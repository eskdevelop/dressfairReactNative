import type { CountryCode } from '@shared/config/env';

import type { CartLineItem } from './cartTypes';

/** Mirrors Flutter `CountryConfigModel.shippingAmount` / `freeShippingLimit`. */
export type CartShippingConfig = {
  shippingAmount: number;
  freeShippingLimit: number;
};

const FALLBACK_SHIPPING: Record<CountryCode, CartShippingConfig> = {
  UAE: { shippingAmount: 15, freeShippingLimit: 200 },
  OMN: { shippingAmount: 0, freeShippingLimit: 0 },
  KSA: { shippingAmount: 0, freeShippingLimit: 0 },
};

export function parseShippingConfigFromStore(
  shippingAmountRaw?: string,
  freeShippingLimitRaw?: string,
  country: CountryCode = 'UAE',
): CartShippingConfig {
  const fallback = FALLBACK_SHIPPING[country];
  const shippingAmount = Number(shippingAmountRaw);
  const freeShippingLimit = Number(freeShippingLimitRaw);
  return {
    shippingAmount: Number.isFinite(shippingAmount) ? shippingAmount : fallback.shippingAmount,
    freeShippingLimit: Number.isFinite(freeShippingLimit) ? freeShippingLimit : fallback.freeShippingLimit,
  };
}

/** Unit price × qty — web `localStorage.cart` stores per-unit `price`. */
export function cartLineSaleTotal(row: CartLineItem): number {
  return row.price * row.quantity;
}

export function cartLineNormalTotal(row: CartLineItem): number {
  const unit = row.normalPrice && row.normalPrice > row.price ? row.normalPrice : row.price;
  return unit * row.quantity;
}

export function selectedCartLines(items: CartLineItem[]): CartLineItem[] {
  return items.filter(row => row.isSelected);
}

/** Flutter `selectedTotalPrice` — sum of selected line sale totals. */
export function selectedTotalPrice(items: CartLineItem[]): number {
  return selectedCartLines(items).reduce((sum, row) => sum + cartLineSaleTotal(row), 0);
}

/** Flutter `selectedTotalNormalPrice` — sum of selected line compare-at totals. */
export function selectedTotalNormalPrice(items: CartLineItem[]): number {
  return selectedCartLines(items).reduce((sum, row) => sum + cartLineNormalTotal(row), 0);
}

/** Flutter `selectedDiscount`. */
export function selectedDiscount(items: CartLineItem[]): number {
  const discount = selectedTotalNormalPrice(items) - selectedTotalPrice(items);
  return discount > 0 ? discount : 0;
}

/**
 * Flutter `checkShipping` — returns shipping charge (0 = free).
 */
export function checkShipping(subtotal: number, config: CartShippingConfig): number {
  const { shippingAmount, freeShippingLimit } = config;
  if (subtotal <= 0) return 0;
  if (shippingAmount === 0) return 0;
  if (freeShippingLimit === 0) return shippingAmount;
  if (subtotal >= freeShippingLimit) return 0;
  return shippingAmount;
}

/**
 * Flutter `totalWithShippingCharges` — bottom bar total.
 */
export function totalWithShippingCharges(
  subtotal: number,
  config: CartShippingConfig,
): number {
  if (subtotal <= 0) return 0;
  const { shippingAmount, freeShippingLimit } = config;
  if (subtotal > 0 && subtotal <= freeShippingLimit && shippingAmount > 0) {
    return subtotal + shippingAmount;
  }
  return subtotal;
}
