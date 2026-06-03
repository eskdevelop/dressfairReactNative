import axios from 'axios';

import { storefrontStoreUrl } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

import type { ProductPriceModel } from './categoryModel';
import { parseProductPrice } from './categoryModel';

const REQUEST_MS = 20_000;

/** One selectable size/option variant for a product (Flutter `options[]`). */
export type ProductSizeOption = {
  productOptionId: number;
  optionId: number;
  optionName: string;
  label: string;
  availableQuantity: number;
};

/** A sibling color (separate SKU) of the same product group (Flutter `product_colors[]`). */
export type ProductColorOption = {
  sku: string;
  color: string;
  image: string;
};

export type ProductDetail = {
  productId: number;
  productGroupId: number;
  availableQty: number;
  sku: string;
  currencyCode: string;
  name: string;
  color: string;
  price: ProductPriceModel;
  /** CDN-relative image paths in sort order. */
  images: string[];
  sizeOptions: ProductSizeOption[];
  colorOptions: ProductColorOption[];
};

export type ProductDetailResult =
  | { ok: true; detail: ProductDetail }
  | { ok: false; error: string };

function parseNum(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function parseSizeOption(json: unknown): ProductSizeOption | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const productOptionId = parseNum(o.product_option_id ?? o.productOptionId);
  if (productOptionId <= 0) return null;
  return {
    productOptionId,
    optionId: parseNum(o.option_id ?? o.optionId),
    optionName: String(o.option_name ?? o.optionName ?? ''),
    label: String(o.option_label ?? o.optionLabel ?? '').trim(),
    availableQuantity: parseNum(o.available_quantity ?? o.availableQuantity, 0),
  };
}

function parseColorOption(json: unknown): ProductColorOption | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const sku = String(o.sku ?? '').trim();
  if (!sku) return null;
  return {
    sku,
    color: String(o.color ?? '').trim(),
    image: String(o.image ?? '').trim(),
  };
}

export function parseProductDetail(json: unknown): ProductDetail | null {
  if (!json || typeof json !== 'object') return null;
  const data = json as Record<string, unknown>;

  const sku = String(data.product_sku ?? data.sku ?? '').trim();
  const productId = parseNum(data.product_id ?? data.productId);
  if (!sku || productId <= 0) return null;

  let priceJson: Record<string, unknown> = {};
  const rawPrice = data.price;
  if (Array.isArray(rawPrice) && rawPrice.length > 0 && rawPrice[0] && typeof rawPrice[0] === 'object') {
    priceJson = rawPrice[0] as Record<string, unknown>;
  } else if (rawPrice && typeof rawPrice === 'object') {
    priceJson = rawPrice as Record<string, unknown>;
  }

  const imagesRaw = data.images;
  const images: string[] = Array.isArray(imagesRaw)
    ? imagesRaw
        .map(i => (i && typeof i === 'object' ? String((i as Record<string, unknown>).image ?? '') : ''))
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const optionsRaw = data.options;
  const sizeOptions: ProductSizeOption[] = Array.isArray(optionsRaw)
    ? (optionsRaw.map(parseSizeOption).filter(Boolean) as ProductSizeOption[])
    : [];

  const colorsRaw = data.product_colors;
  const colorOptions: ProductColorOption[] = Array.isArray(colorsRaw)
    ? (colorsRaw.map(parseColorOption).filter(Boolean) as ProductColorOption[])
    : [];

  return {
    productId,
    productGroupId: parseNum(data.product_group_id ?? data.productGroupId),
    availableQty: parseNum(data.available_qty ?? data.availableQty, 0),
    sku,
    currencyCode: String(data.currency_code ?? data.currencyCode ?? '').trim(),
    name: String(data.name ?? '').trim(),
    color: String(data.color ?? '').trim(),
    price: parseProductPrice(priceJson),
    images,
    sizeOptions,
    colorOptions,
  };
}

/**
 * Flutter product-detail call: `GET /api/rest/store/product/{sku}`.
 * Returns `{ success, message, data }` where `data.options[]` are size variants
 * (with `product_option_id` + `available_quantity`) and `data.product_colors[]`
 * are sibling color SKUs.
 */
export async function fetchProductDetail(sku: string): Promise<ProductDetailResult> {
  const trimmed = sku.trim();
  if (!trimmed) return { ok: false, error: 'Missing product' };

  const url = storefrontStoreUrl(`product/${encodeURIComponent(trimmed)}`);
  try {
    const headers = await buildStorefrontAuthHeaders();
    const res = await axios.get(url, {
      headers,
      timeout: REQUEST_MS,
      validateStatus: status => typeof status === 'number' && status < 600,
    });

    const body = res.data;
    if (typeof body !== 'object' || body === null) {
      return {
        ok: false,
        error: res.status !== 200 ? `HTTP ${String(res.status)}` : 'Invalid response',
      };
    }

    const o = body as Record<string, unknown>;
    if (res.status !== 200 || o.success !== true) {
      return {
        ok: false,
        error: typeof o.error === 'string' ? o.error : typeof o.message === 'string' && o.success !== true ? o.message : `HTTP ${String(res.status)}`,
      };
    }

    const detail = parseProductDetail(o.data);
    if (!detail) {
      return { ok: false, error: 'Could not read product details' };
    }
    return { ok: true, detail };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: message };
  }
}
