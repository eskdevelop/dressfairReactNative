import { store } from '@app/store';
import { getEnvConfig, type CountryCode } from '@shared/config/env';

const trimSlash = (s: string): string => s.replace(/\/+$/, '');

export function getStorefrontCheckoutApiOrigin(
  country?: CountryCode,
): string {
  const c = country ?? store.getState().app.country;
  const override = store.getState().app.storefrontCheckoutApiOriginOverride?.trim();
  if (override) return trimSlash(override);
  return trimSlash(getEnvConfig(c).storefrontCheckoutApiBaseUrl);
}

/**
 * Ordered OC JSON API hosts (explicit mobile API base, checkout REST, marketing web).
 * Shared by mobile-categories and store-setting fetches so both hit the same “good” origin when one host returns SPA HTML.
 */
export function storefrontJsonApiOriginsToTry(country?: CountryCode): string[] {
  const c = country ?? store.getState().app.country;
  const cfg = getEnvConfig(c);
  const checkout = getStorefrontCheckoutApiOrigin(c);
  const explicit = cfg.mobileCategoriesApiBaseUrl?.trim();
  const web = trimSlash(cfg.webBaseUrl);
  const origins: string[] = [];
  if (explicit) origins.push(trimSlash(explicit));
  if (!origins.includes(checkout)) origins.push(checkout);
  if (!origins.includes(web)) origins.push(web);
  return origins;
}

/** Checkout customer routes: `/api/rest/store/checkout/{path}` */
export function storefrontCheckoutUrl(path: string): string {
  const base = getStorefrontCheckoutApiOrigin();
  const p = path.replace(/^\/+/, '');
  return `${base}/api/rest/store/checkout/${p}`;
}

/** General store routes under `/api/rest/store/{path}` (cities, areas). */
export function storefrontStoreUrl(path: string): string {
  const base = getStorefrontCheckoutApiOrigin();
  const p = path.replace(/^\/+/, '');
  return `${base}/api/rest/store/${p}`;
}

/** Origins to try for Flutter-parity `/api/rest/store/setting` (same host priority as categories). */
export function storefrontStoreSettingUrlCandidates(country?: CountryCode): string[] {
  const c = country ?? store.getState().app.country;
  const origins = storefrontJsonApiOriginsToTry(c);
  return [...new Set(origins.map(o => `${o}/api/rest/store/setting`))];
}

/**
 * Flutter-parity canonical path. Note: some hosts (e.g. `backend.dressfair.com`) serve HTML from `/api/rest/*`;
 * callers should try {@link storefrontMobileCategoriesUrlCandidates} until JSON parses.
 */
export function storefrontMobileCategoriesUrl(country?: CountryCode): string {
  const c = country ?? store.getState().app.country;
  const cfg = getEnvConfig(c);
  const base = cfg.mobileCategoriesApiBaseUrl?.trim()
    ? trimSlash(cfg.mobileCategoriesApiBaseUrl.trim())
    : getStorefrontCheckoutApiOrigin(c);
  return `${base}/api/rest/mobile-categories`;
}

/**
 * Candidate GET URLs. Tries (in order): optional OC origin, checkout API origin, marketing `webBaseUrl` —
 * each with Flutter paths `/api/rest/mobile-categories` and `/api/rest/store/mobile-categories`.
 * Removes guessed `index.php?route=rest_api.*` entries (404 on Dress Fair OC).
 */
export function storefrontMobileCategoriesUrlCandidates(country?: CountryCode): string[] {
  const c = country ?? store.getState().app.country;
  const origins = storefrontJsonApiOriginsToTry(c);
  const paths = ['/api/rest/mobile-categories', '/api/rest/store/mobile-categories'];
  const urls: string[] = [];
  for (const o of origins) {
    for (const p of paths) {
      urls.push(`${o}${p}`);
    }
  }
  return [...new Set(urls)];
}
