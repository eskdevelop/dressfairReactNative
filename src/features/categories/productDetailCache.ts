import { fetchProductDetail, type ProductDetail } from './productDetailApi';

const TTL_MS = 10 * 60 * 1000;

type CacheEntry = {
  detail: ProductDetail;
  savedAt: number;
};

const memoryBySku = new Map<string, CacheEntry>();
const inFlightBySku = new Map<string, Promise<ProductDetail | null>>();

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.savedAt < TTL_MS;
}

function normalizeSku(sku: string): string {
  return sku.trim();
}

export function getCachedProductDetail(sku: string): ProductDetail | null {
  const key = normalizeSku(sku);
  if (!key) return null;
  const entry = memoryBySku.get(key) ?? null;
  if (!entry || !isFresh(entry)) return null;
  return entry.detail;
}

export function rememberProductDetail(detail: ProductDetail): void {
  saveDetail(detail.sku, detail);
}

function saveDetail(sku: string, detail: ProductDetail): void {
  memoryBySku.set(normalizeSku(sku), { detail, savedAt: Date.now() });
}

/** Deduped REST prefetch — safe to call from scroll, press-in, and viewability hooks. */
export async function prefetchProductDetail(sku: string): Promise<ProductDetail | null> {
  const key = normalizeSku(sku);
  if (!key) return null;

  const cached = getCachedProductDetail(key);
  if (cached) return cached;

  const existing = inFlightBySku.get(key);
  if (existing) return existing;

  const task = (async () => {
    const res = await fetchProductDetail(key);
    if (res.ok) {
      saveDetail(key, res.detail);
      return res.detail;
    }
    return null;
  })().finally(() => {
    inFlightBySku.delete(key);
  });

  inFlightBySku.set(key, task);
  return task;
}

/** Prefetch up to `limit` SKUs from a listing (visible tiles first). */
export function prefetchProductDetailsForSkus(skus: string[], limit = 6): void {
  const seen = new Set<string>();
  let count = 0;
  for (const raw of skus) {
    const sku = normalizeSku(raw);
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    void prefetchProductDetail(sku);
    count += 1;
    if (count >= limit) break;
  }
}
