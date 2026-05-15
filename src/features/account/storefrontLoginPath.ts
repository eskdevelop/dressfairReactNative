import type { CountryCode } from '@shared/config/env';
import { getEnvConfig } from '@shared/config/env';

/**
 * Regional storefront root embedded for sign-in ({@link EnvConfig.webCategoriesPath}), e.g. `/ae`.
 * Dedicated `/login` URLs resolve to a Next.js 404 shell in RN WebViews; the real login UI is opened
 * via injected JS on that home URL (see WebViewScreen prop `openStorefrontLoginModal`).
 */
export function storefrontSignInEmbedPath(country: CountryCode): string {
  const cfg = getEnvConfig(country);
  const p = cfg.webCategoriesPath.trim().replace(/\/+$/, '');
  return p.startsWith('/') ? `/${p.replace(/^\/+/, '')}` : `/${p}`;
}
