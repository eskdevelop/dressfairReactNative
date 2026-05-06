import axios from 'axios';

import { store } from '@app/store';
import {
  OC_MERCHANT_ID,
  OC_MERCHANT_LANGUAGE,
} from '@features/api/sessionApi';
import type { CountryCode } from '@shared/config/env';
import { getEnvConfig, productHrefForSku } from '@shared/config/env';

// Suggestions returned by `feed_rest_api.getSearchSuggestions`.
//
// The OpenCart endpoint returns two visually distinct row types in a single
// flat list:
//
//   { "title": "Maxi Dress" }                                 -> kind:'query'
//   { "title": "Long Sleeved Maxi Dress - Black", "sku": "C-568BK" } -> kind:'product'
//
// Query rows act like search refinements; product rows deep-link directly to
// the product page. The screen renders them differently to match Flutter UX.
export type SearchSuggestion =
  | { kind: 'query'; title: string }
  | { kind: 'product'; title: string; sku: string };

// A normalised search hit ready for the results grid. `specialPrice` is null
// when the product is not on sale; the screen uses it to render a strike on
// `price`. `href` is a relative storefront path so `requestWebNav` can hand
// it to the WebView and have it resolved against `webBaseUrl`.
export type SearchProductHit = {
  productId: string;
  sku: string;
  name: string;
  price: string;
  specialPrice: string | null;
  imageUrl: string | null;
  currencyCode: string;
  href: string;
};

const RESULTS_PER_PAGE = 30;
const REQUEST_TIMEOUT_MS = 15000;

const buildBaseUrl = (): string => {
  const country = store.getState().app.country;
  const { apiHost, apiRoutePrefix } = getEnvConfig(country);
  return `${apiHost}${apiRoutePrefix}`;
};

const buildSuggestionsUrl = (query: string): string =>
  `${buildBaseUrl()}/feed_rest_api.getSearchSuggestions&query=${encodeURIComponent(query)}`;

const buildProductsLpUrl = (query: string, page: number): string =>
  `${buildBaseUrl()}/rest_api.productsLp&limit=${RESULTS_PER_PAGE}&page=${page}&simple=1&search_attribute=${encodeURIComponent(query)}`;

const requestHeaders = () => {
  const token = store.getState().app.apiSession?.token;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-oc-merchant-id': OC_MERCHANT_ID,
    'x-oc-merchant-language': OC_MERCHANT_LANGUAGE,
  };
  if (token && token.length > 0) {
    headers['x-oc-session'] = token;
  }
  return headers;
};

// OpenCart REST sometimes returns HTML when the plugin is mis-routed. Treat
// any non-JSON body as an empty payload so the screen falls back to its
// standard empty-state instead of throwing.
const safeJson = [
  (raw: unknown) => {
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
];

const isEnvelopeSuccess = (root: Record<string, unknown>): boolean => {
  const v = root.success;
  return v === true || v === 1 || v === '1' || v === 'true';
};

const asString = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const extractDataArray = (data: unknown): unknown[] => {
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    if (!isEnvelopeSuccess(root)) return [];
    const inner = root.data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
};

const extractLastPage = (data: unknown): number => {
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    const candidates = [root.last_page, root.total_pages];
    for (const c of candidates) {
      if (typeof c === 'number' && Number.isFinite(c) && c > 0) return c;
      if (typeof c === 'string') {
        const n = Number(c);
        if (Number.isFinite(n) && n > 0) return Math.floor(n);
      }
    }
  }
  return 1;
};

const mapSuggestion = (raw: unknown): SearchSuggestion | null => {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const title = asString(row.title ?? row.name).trim();
  if (title.length === 0) return null;
  const sku = asString(row.sku ?? row.model).trim();
  if (sku.length > 0) {
    return { kind: 'product', title, sku };
  }
  return { kind: 'query', title };
};

const mapProduct = (
  raw: unknown,
  country: CountryCode,
): SearchProductHit | null => {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const productId = asString(row.product_id ?? row.id).trim();
  const sku = asString(row.model ?? row.sku ?? row.product_sku).trim();
  const name = asString(row.name ?? row.title).trim();
  if (productId.length === 0 || name.length === 0) return null;

  const price = asString(row.price ?? row.formatted_price);
  const specialRaw = row.special;
  // Treat `special` as a real discount only when it is a positive value
  // strictly less than `price`. The live API returns `special: <price>` for
  // many non-discounted SKUs; rendering that as a strikethrough would be a
  // false-promise UX bug.
  const specialNum = isNonEmptyString(specialRaw) ? Number(specialRaw) : NaN;
  const priceNum = price.length > 0 ? Number(price) : NaN;
  const specialPrice =
    isNonEmptyString(specialRaw) &&
    Number.isFinite(specialNum) &&
    specialNum > 0 &&
    (!Number.isFinite(priceNum) || specialNum < priceNum)
      ? specialRaw
      : null;
  const image = row.image ?? row.m_image ?? row.original_image;
  const imageUrl = isNonEmptyString(image) ? image : null;
  const currencyCode = asString(row.currency_code).trim();

  // When the API omits the SKU we still surface the product but route the
  // tap to the regional storefront root (the locale prefix preceding
  // `/p/<sku>`) so the user lands somewhere useful instead of /404.
  const href =
    productHrefForSku(sku, country) ??
    getEnvConfig(country).productPathPrefix.replace(/\/p$/, '');

  return {
    productId,
    sku,
    name,
    price,
    specialPrice,
    imageUrl,
    currencyCode,
    href,
  };
};

export const fetchSuggestions = async (
  query: string,
  options?: { signal?: AbortSignal },
): Promise<SearchSuggestion[]> => {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const url = buildSuggestionsUrl(trimmed);
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT_MS,
    signal: options?.signal,
    headers: requestHeaders(),
    transformResponse: safeJson,
  });

  const items = extractDataArray(response.data);
  return items
    .map(mapSuggestion)
    .filter((item): item is SearchSuggestion => item !== null);
};

export const searchProductsLp = async (
  query: string,
  options?: { signal?: AbortSignal; page?: number },
): Promise<{ items: SearchProductHit[]; lastPage: number }> => {
  const trimmed = query.trim();
  if (trimmed.length === 0) return { items: [], lastPage: 1 };

  const page = options?.page ?? 1;
  const url = buildProductsLpUrl(trimmed, page);
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT_MS,
    signal: options?.signal,
    headers: requestHeaders(),
    transformResponse: safeJson,
  });

  const country: CountryCode = store.getState().app.country;
  const rows = extractDataArray(response.data);
  const items = rows
    .map(row => mapProduct(row, country))
    .filter((item): item is SearchProductHit => item !== null);
  const lastPage = extractLastPage(response.data);
  return { items, lastPage };
};
