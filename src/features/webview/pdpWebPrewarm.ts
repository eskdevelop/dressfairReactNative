import { getEnvConfig, productHrefForSku, type CountryCode } from '@shared/config/env';

/**
 * Temu-style PDP prewarming.
 *
 * react-native-webview instances share the OS-level HTTP/disk cache (Android:
 * shared WebView cache; iOS: shared `WKWebsiteDataStore.default()`), so loading
 * a product URL inside a tiny hidden background WebView warms the HTML, JS
 * chunks, Next.js data and CDN images. When the user then opens that product,
 * the real PDP WebView reads from cache and paints almost instantly.
 *
 * This module is the headless coordinator: screens push URLs to prewarm, and a
 * single mounted {@link PdpWebPrewarmHost} renders the hidden WebViews.
 */

const MAX_ACTIVE = 2; // concurrent hidden WebViews (memory cap)
const RECENT_LIMIT = 24; // URLs we won't re-warm again this session

type Listener = (urls: string[]) => void;

const listeners = new Set<Listener>();
const activeUrls: string[] = []; // currently mounted hidden WebViews (LRU: newest last)
const recentlyWarmed = new Set<string>(); // URLs already requested this session

function emit(): void {
  const snapshot = activeUrls.slice();
  listeners.forEach(l => {
    try {
      l(snapshot);
    } catch {
      /* listener errors must not break others */
    }
  });
}

function rememberRecent(url: string): void {
  recentlyWarmed.add(url);
  if (recentlyWarmed.size > RECENT_LIMIT) {
    const oldest = recentlyWarmed.values().next().value;
    if (oldest) recentlyWarmed.delete(oldest);
  }
}

/** Full absolute product URL for the active region, or `null` for an empty sku. */
export function productUrlForSku(sku: string, country: CountryCode): string | null {
  const path = productHrefForSku(sku, country);
  if (!path) return null;
  const base = getEnvConfig(country).webBaseUrl.replace(/\/+$/, '');
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Begin warming a product page in the background. Safe to call from press-in,
 * viewability, and prefetch paths — deduped per session and capped at
 * {@link MAX_ACTIVE} concurrent hidden WebViews.
 */
export function prewarmPdp(sku: string, country: CountryCode): void {
  const url = productUrlForSku(sku, country);
  if (!url) return;
  if (recentlyWarmed.has(url) || activeUrls.includes(url)) return;

  rememberRecent(url);
  activeUrls.push(url);
  while (activeUrls.length > MAX_ACTIVE) {
    activeUrls.shift(); // evict oldest in-flight warm
  }
  emit();
}

/** Host calls this once a hidden WebView finishes (or errors) so it can be unmounted. */
export function releasePrewarm(url: string): void {
  const idx = activeUrls.indexOf(url);
  if (idx === -1) return;
  activeUrls.splice(idx, 1);
  emit();
}

export function subscribePrewarm(listener: Listener): () => void {
  listeners.add(listener);
  listener(activeUrls.slice());
  return () => {
    listeners.delete(listener);
  };
}

/** Test/region-switch helper — clears all warmed state. */
export function resetPrewarm(): void {
  activeUrls.length = 0;
  recentlyWarmed.clear();
  emit();
}
