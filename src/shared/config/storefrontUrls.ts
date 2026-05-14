import { store } from '@app/store';
import { getEnvConfig, type CountryCode } from '@shared/config/env';

const trimSlash = (s: string): string => s.replace(/\/+$/, '');

export function getStorefrontCheckoutApiOrigin(
  country?: CountryCode,
): string {
  const c = country ?? store.getState().app.country;
  return trimSlash(getEnvConfig(c).storefrontCheckoutApiBaseUrl);
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
