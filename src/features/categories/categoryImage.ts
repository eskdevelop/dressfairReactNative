import type { CountryCode } from '@shared/config/env';
import { getEnvConfig } from '@shared/config/env';

const SUPPORTS = /\.(jpg|jpeg|png|webp)(\?|$)/i;

/** Flutter `SimpleMethode.isSupportedFormat`. */
export function isSupportedRemoteImage(uri: string): boolean {
  return SUPPORTS.test(uri.toLowerCase());
}

export function cdnAssetUrl(country: CountryCode, relativePath: string): string {
  const base = getEnvConfig(country).customerAvatarCdnBaseUrl.replace(/\/+$/, '');
  return `${base}/${relativePath.replace(/^\/+/, '')}`;
}
