import type { CartLineItem, WebCartRawItem } from './cartTypes';

const asNum = (v: unknown, fallback = 0): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const asStr = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export function cartLineKey(sku: string, productOptionId: number): string {
  return `${sku}::${productOptionId}`;
}

/** Maps `localStorage.cart` JSON array → native cart lines. */
export function parseWebCartItems(raw: unknown): CartLineItem[] {
  if (!Array.isArray(raw)) return [];

  const out: CartLineItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const w = row as WebCartRawItem;
    const sku = asStr(w.sku);
    const name = asStr(w.name);
    const productId = asNum(w.id);
    const productOptionId = asNum(w.product_option_id ?? w.productOptionId);
    if (!sku || !name || productId <= 0) continue;

    const qtyRaw = asNum(w.quantity ?? w.qty, 1);
    const quantity = qtyRaw > 0 ? Math.min(Math.floor(qtyRaw), 99) : 1;
    const price = asNum(w.price);
    const normalRaw = asNum(w.normal_price ?? w.normalPrice, 0);
    const normalPrice = normalRaw > price ? normalRaw : undefined;
    const discountRaw = asNum(w.discount_percent ?? w.discountPercent, 0);
    const discountPercent =
      discountRaw > 0
        ? Math.round(discountRaw)
        : normalPrice && normalPrice > price
          ? Math.round((1 - price / normalPrice) * 100)
          : undefined;

    const imageRaw = asStr(w.image) || asStr(w.thumb);

    out.push({
      lineKey: cartLineKey(sku, productOptionId),
      productId,
      productOptionId,
      sku,
      name,
      quantity,
      price,
      normalPrice,
      discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
      isSelected: true,
      image: imageRaw || undefined,
      size: asStr(w.size) || asStr(w.option_label) || undefined,
      color: asStr(w.color) || asStr(w.option_color) || undefined,
      web: w,
    });
  }
  return out;
}

export function cartTotalQuantity(items: CartLineItem[]): number {
  return items.reduce((sum, row) => sum + row.quantity, 0);
}

export function cartSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, row) => sum + row.price * row.quantity, 0);
}

export function cartSelectedSubtotal(items: CartLineItem[]): number {
  return items
    .filter(row => row.isSelected)
    .reduce((sum, row) => sum + row.price * row.quantity, 0);
}

export function cartSelectedNormalSubtotal(items: CartLineItem[]): number {
  return items
    .filter(row => row.isSelected)
    .reduce((sum, row) => {
      const unit = row.normalPrice && row.normalPrice > row.price ? row.normalPrice : row.price;
      return sum + unit * row.quantity;
    }, 0);
}

export function hasSelectedCartItems(items: CartLineItem[]): boolean {
  return items.some(row => row.isSelected);
}

export function isAllCartSelectedForCheckout(items: CartLineItem[]): boolean {
  return items.length > 0 && items.every(row => row.isSelected);
}

/** Serialize native lines back to web `localStorage.cart` shape. */
export function cartItemsToWebJson(items: CartLineItem[]): string {
  const rows = items.map(row => {
    const base = { ...row.web };
    base.id = row.productId;
    base.product_option_id = row.productOptionId;
    base.sku = row.sku;
    base.name = row.name;
    base.quantity = row.quantity;
    base.price = row.price;
    if (row.image) base.image = row.image;
    if (row.size) base.size = row.size;
    if (row.color) base.color = row.color;
    return base;
  });
  return JSON.stringify(rows);
}
