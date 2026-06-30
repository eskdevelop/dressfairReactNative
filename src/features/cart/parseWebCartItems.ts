import { availableQuantityFromWebItem } from './cartStock';
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

/** Unwrap `localStorage.cart` payloads that are not a bare array. */
export function normalizeWebCartPayload(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  for (const key of ['items', 'data', 'products', 'cart', 'lines']) {
    const nested = o[key];
    if (Array.isArray(nested)) return nested;
  }
  const values = Object.values(o);
  if (
    values.length > 0 &&
    values.every(v => v != null && typeof v === 'object' && !Array.isArray(v))
  ) {
    return values;
  }
  return [];
}

function coerceWebCartRow(row: unknown): WebCartRawItem | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const sv = (...keys: string[]): string | number | undefined => {
    for (const k of keys) {
      const v = r[k];
      if (v != null && (typeof v === 'string' || typeof v === 'number')) return v;
    }
    return undefined;
  };
  const str = (...keys: string[]): string | undefined => {
    const v = sv(...keys);
    return v == null ? undefined : String(v);
  };
  return {
    ...(r as WebCartRawItem),
    id: sv('id', 'product_id', 'productId'),
    sku: str('sku', 'model', 'product_sku', 'productSku'),
    name: str('name', 'product_name', 'productName', 'title'),
    product_option_id: sv(
      'product_option_id',
      'productOptionId',
      'option_id',
      'optionId',
      'variant_id',
      'variantId',
    ),
    quantity: sv('quantity', 'qty'),
    price: sv('price', 'unit_price', 'unitPrice', 'special_price', 'specialPrice'),
    normal_price: sv('normal_price', 'normalPrice', 'compare_at_price', 'compareAtPrice'),
    image: str('image', 'thumb', 'thumbnail'),
    size: str('size', 'option_label', 'optionLabel'),
    color: str('color', 'option_color', 'optionColor'),
  };
}

/** Maps `localStorage.cart` JSON array → native cart lines. */
export function parseWebCartItems(raw: unknown): CartLineItem[] {
  const rows = normalizeWebCartPayload(raw);

  const out: CartLineItem[] = [];
  for (const row of rows) {
    const w = coerceWebCartRow(row);
    if (!w) continue;
    const sku = asStr(w.sku) || asStr(w.model);
    const name = asStr(w.name) || asStr(w.product_name) || asStr(w.title);
    const productOptionId = asNum(
      w.product_option_id ?? w.productOptionId ?? w.option_id ?? w.optionId,
    );
    let productId = asNum(w.id ?? w.product_id ?? w.productId);
    if (productId <= 0 && productOptionId > 0) productId = productOptionId;
    const displayName = name || sku;
    if (!sku || !displayName || productId <= 0) continue;

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
    const availableFromWeb = availableQuantityFromWebItem(w);
    const maxQty =
      availableFromWeb != null && availableFromWeb > 0
        ? Math.min(quantity, availableFromWeb)
        : quantity;

    out.push({
      lineKey: cartLineKey(sku, productOptionId),
      productId,
      productOptionId,
      sku,
      name: displayName,
      quantity: maxQty,
      availableQuantity: availableFromWeb,
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
