import type { CountryCode } from '@shared/config/env';
import { getEnvConfig } from '@shared/config/env';

const SUPPORTS = /\.(jpg|jpeg|png|webp)(\?|$)/i;

/** Flutter `SimpleMethode.isSupportedFormat`. */
export function isSupportedRemoteImage(uri: string): boolean {
  return SUPPORTS.test(uri.toLowerCase());
}

/**
 * Resolve a listing/search image to a fetchable URI.
 * Search/LP often return an absolute `https://eskdxb.com/...` URL. Prefixing
 * that with the S3 CDN produces a 403 (`cdn/https://...`) and an unhandled
 * `Image.prefetch` rejection.
 */
export function cdnAssetUrl(country: CountryCode, relativePath: string): string {
  const t = relativePath.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  const base = getEnvConfig(country).customerAvatarCdnBaseUrl.replace(/\/+$/, '');
  return `${base}/${t.replace(/^\/+/, '')}`;
}
