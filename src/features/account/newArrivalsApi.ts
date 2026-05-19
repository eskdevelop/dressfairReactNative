import axios from 'axios';

import type { ListingProductRow } from '@features/categories/categoryModel';
import { parseListingProductRow } from '@features/categories/categoryModel';
import { storefrontStoreUrl } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

const REQUEST_MS = 20_000;

export type NewArrivalsPageResult = {
  ok: boolean;
  products: ListingProductRow[];
  /** False when this page had no items (Flutter NewArrivalController stops on empty page). */
  hasMore: boolean;
  error?: string;
};

function newArrivalsUrl(page: number): string {
  const base = storefrontStoreUrl('new-arrivals');
  if (page <= 1) return base;
  return `${base}?page=${String(page)}`;
}

/**
 * Flutter `NewArrivalRepository.getNewArrivals`: GET `/api/rest/store/new-arrivals`
 * (no `page` on first fetch; `?page=n` when paginating).
 */
export async function fetchNewArrivalsPage(page: number): Promise<NewArrivalsPageResult> {
  const url = newArrivalsUrl(page);
  try {
    const headers = await buildStorefrontAuthHeaders();
    const res = await axios.get(url, {
      headers,
      timeout: REQUEST_MS,
      validateStatus: status => typeof status === 'number' && status < 600,
    });

    const data = res.data;
    if (typeof data !== 'object' || data === null) {
      return {
        ok: false,
        products: [],
        hasMore: false,
        error: res.status !== 200 ? `HTTP ${String(res.status)}` : 'Invalid response',
      };
    }

    const body = data as Record<string, unknown>;

    if (res.status !== 200) {
      return {
        ok: false,
        products: [],
        hasMore: false,
        error: typeof body.error === 'string' ? body.error : `HTTP ${String(res.status)}`,
      };
    }

    if (body.success !== true) {
      return {
        ok: false,
        products: [],
        hasMore: false,
        error: typeof body.error === 'string' ? body.error : 'New arrivals request failed',
      };
    }

    const dataRaw = body.data;
    const items: ListingProductRow[] = Array.isArray(dataRaw)
      ? dataRaw.map(parseListingProductRow).filter(Boolean) as ListingProductRow[]
      : [];

    const pag = (body.pagination ?? {}) as Record<string, unknown>;
    const currentPageRaw = pag.current_page;
    const lastPageRaw = pag.last_page;

    let hasMore = items.length > 0;
    if (typeof currentPageRaw === 'number' && typeof lastPageRaw === 'number') {
      hasMore = currentPageRaw < lastPageRaw;
    } else if (typeof currentPageRaw === 'string' && typeof lastPageRaw === 'string') {
      const c = Number.parseInt(currentPageRaw, 10);
      const l = Number.parseInt(lastPageRaw, 10);
      if (!Number.isNaN(c) && !Number.isNaN(l)) {
        hasMore = c < l;
      }
    }

    return { ok: true, products: items, hasMore };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return {
      ok: false,
      products: [],
      hasMore: false,
      error: message,
    };
  }
}
