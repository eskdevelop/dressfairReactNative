import axios from 'axios';

import type { CountryCode } from '@shared/config/env';
import { storefrontMobileCategoriesUrlCandidates, storefrontStoreUrl } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

import type { CategoryRow, ListingProductRow } from './categoryModel';
import { parseCategoryRow, parseListingProductRow } from './categoryModel';

const REQUEST_MS = 20_000;

/** Short Metro-safe log (never dump 20k+ element arrays). */
function logCategoriesDebug(
  phase: string,
  info: {
    url: string;
    status: number;
    raw: unknown;
  },
): void {
  if (!__DEV__) return;
  const { url, status, raw } = info;
  let kind: string;
  let detail: string;
  if (raw === null || raw === undefined) {
    kind = 'pending';
    detail = '(before_response)';
  } else if (Array.isArray(raw)) {
    kind = 'root_array';
    const first = raw[0];
    const firstDesc =
      first && typeof first === 'object'
        ? Object.keys(first as object).slice(0, 15).join(',')
        : String(first).slice(0, 80);
    detail = `length=${String(raw.length)} firstRowKeys=${firstDesc}`;
  } else if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    kind = 'object';
    detail = `keys=${Object.keys(o).slice(0, 25).join(',')}${Object.keys(o).length > 25 ? '…' : ''} success=${String(o.success)}`;
  } else {
    kind = typeof raw;
    detail = String(raw).slice(0, 200);
  }
  // eslint-disable-next-line no-console
  console.warn(`[categories] ${phase}`, { url, httpStatus: status, payloadKind: kind, detail });
}

/**
 * Some storefronts return `{ success, data: [...] }` (Flutter path). Others return the category list as a **JSON array only** at 200 — that was breaking RN when we only checked `body.success`.
 */
function extractCategoriesPayload(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;

  if (o.success === false) {
    return null;
  }

  if (Array.isArray(o.data)) {
    return o.data;
  }

  // Rare: categories under another key
  if (Array.isArray(o.categories)) {
    return o.categories;
  }

  return null;
}

/** Axios may return SPA HTML (`<!DOCTYPE html>…`) when `/api/rest/*` is routed to Next instead of OpenCart. */
function responseLooksLikeHtmlDocument(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const t = raw.trimStart().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html') || t.startsWith('<!--');
}

export type CategoriesApiResult = {
  ok: boolean;
  categories?: CategoryRow[];
  error?: string;
};

/** GET mobile category tree — fires candidate URLs in parallel; first valid JSON by URL priority wins. */
export async function fetchCategoriesFromNetwork(country?: CountryCode): Promise<CategoriesApiResult> {
  const urls = storefrontMobileCategoriesUrlCandidates(country);
  const headers = await buildStorefrontAuthHeaders();
  let lastError = 'Categories request failed';

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[categories] parallel_fetch', { urlsCount: urls.length });
  }

  type AttemptOk = { idx: number; url: string; res: Awaited<ReturnType<typeof axios.get<unknown>>> };
  type AttemptFail = { idx: number; url: string; error: string };

  const attempts = await Promise.all(
    urls.map(async (url, idx): Promise<AttemptOk | AttemptFail> => {
      try {
        const res = await axios.get(url, {
          headers,
          timeout: REQUEST_MS,
          validateStatus: status => typeof status === 'number' && status < 600,
        });
        return { idx, url, res };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        return { idx, url, error: message };
      }
    }),
  );

  attempts.sort((a, b) => a.idx - b.idx);

  for (const att of attempts) {
    if ('error' in att) {
      lastError = att.error;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[categories] request_failed', { url: att.url, message: att.error });
      }
      continue;
    }

    const { url, res, idx } = att;
    const raw = res.data;

    if (res.status !== 200) {
      logCategoriesDebug('response_error_status', { url, status: res.status, raw });
      const errObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
      lastError =
        typeof errObj?.error === 'string'
          ? errObj.error
          : typeof errObj?.message === 'string'
            ? errObj.message
            : `HTTP ${String(res.status)}`;
      continue;
    }

    logCategoriesDebug('response_ok', { url, status: res.status, raw });

    if (responseLooksLikeHtmlDocument(raw)) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[categories] html_not_json', { url, candidateIndex: idx });
      }
      lastError = 'Server returned HTML instead of JSON (wrong API route for this host)';
      continue;
    }

    const dataRaw = extractCategoriesPayload(raw);
    if (!dataRaw) {
      const errObj =
        raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
      const serverError =
        typeof errObj?.error === 'string'
          ? errObj.error
          : typeof errObj?.message === 'string'
            ? errObj.message
            : null;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[categories] unparseable_payload', {
          hint: 'Expected JSON array of categories or { success:true, data:[] }',
          serverError,
          url,
        });
      }
      lastError = serverError ?? 'Invalid categories payload (not array and no data[])';
      continue;
    }

    const categories = dataRaw.map(parseCategoryRow).filter(Boolean) as CategoryRow[];

    if (categories.length === 0) {
      lastError = 'No categories in response';
      continue;
    }

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[categories] parsed', { count: categories.length, url, candidateIndex: idx });
      if (idx > 0) {
        // eslint-disable-next-line no-console
        console.warn('[categories] ok_via_fallback_candidate', { url, candidateIndex: idx });
      }
    }

    return { ok: true, categories };
  }

  return { ok: false, error: lastError };
}

export type ProductListingPagination = {
  currentPage: number;
  lastPage: number;
};

export type ProductListingResult = {
  ok: boolean;
  products: ListingProductRow[];
  pagination: ProductListingPagination;
  error?: string;
};

export type ProductListingQueryOpts = {
  /** API `sort` param (e.g. `new`, `popular`, `price`) */
  sort?: string;
  /** API `order` param (`asc` / `desc`) */
  order?: string;
  /** dressfair.com `color=` query (human-readable, e.g. `Green`) */
  color?: string;
  /** dressfair.com `size=` query (e.g. `XL`) */
  size?: string;
  country?: CountryCode;
};

/**
 * Build store REST listing URL — dressfair.com `/api/rest/store/products/{slug}` parity.
 */
export function buildProductsListingUrl(
  cateSlug: string,
  page: number,
  opts?: ProductListingQueryOpts,
): string {
  const basePath = `products/${encodeURIComponent(cateSlug)}`;
  const baseUrl = storefrontStoreUrl(basePath);
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  const sort = opts?.sort?.trim();
  const order = opts?.order?.trim();
  const color = opts?.color?.trim();
  const size = opts?.size?.trim();
  if (sort) qs.set('sort', sort);
  if (order) qs.set('order', order);
  if (color) qs.set('color', color);
  if (size) qs.set('size', size);
  return `${baseUrl}?${qs.toString()}`;
}

/**
 * GET `/api/rest/store/products/{cateSlug}` + optional sort/order/color/size filters.
 */
export async function fetchProductsBySlug(
  cateSlug: string,
  page: number,
  opts?: ProductListingQueryOpts,
): Promise<ProductListingResult> {
  const url = buildProductsListingUrl(cateSlug, page, opts);

  try {
    const headers = await buildStorefrontAuthHeaders();
    const res = await axios.get(url, {
      headers,
      timeout: REQUEST_MS,
      validateStatus: status => typeof status === 'number' && status < 600,
    });

    const body = res.data as Record<string, unknown>;

    if (res.status !== 200) {
      return {
        ok: false,
        products: [],
        pagination: { currentPage: page, lastPage: page },
        error: typeof body?.error === 'string' ? body.error : `HTTP ${String(res.status)}`,
      };
    }

    if (body.success !== true) {
      return {
        ok: false,
        products: [],
        pagination: { currentPage: page, lastPage: page },
        error: typeof body.error === 'string' ? body.error : 'Products request failed',
      };
    }

    const dataRaw = body.data;
    const items: ListingProductRow[] = Array.isArray(dataRaw)
      ? dataRaw.map(parseListingProductRow).filter(Boolean) as ListingProductRow[]
      : [];

    const pag = (body.pagination ?? {}) as Record<string, unknown>;
    const current =
      typeof pag.current_page === 'number'
        ? pag.current_page
        : Number.parseInt(String(pag.current_page ?? page), 10) || page;
    const last =
      typeof pag.last_page === 'number'
        ? pag.last_page
        : Number.parseInt(String(pag.last_page ?? current), 10) || current;

    return {
      ok: true,
      products: items,
      pagination: { currentPage: current, lastPage: last },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return {
      ok: false,
      products: [],
      pagination: { currentPage: page, lastPage: page },
      error: message,
    };
  }
}
