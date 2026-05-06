export type CountryCode = 'UAE' | 'OMN' | 'KSA';

export type EnvConfig = {
  apiBaseUrl: string;
  // Split apiHost / apiRoutePrefix make it possible to compose REST URLs that
  // OpenCart expresses as `?route=extension/opencart/<route>&<params>`. axios
  // baseURL semantics (path-replacement) are incompatible with that scheme so
  // search/session callers concatenate these two manually.
  apiHost: string;
  apiRoutePrefix: string;
  webBaseUrl: string;
  allowedDomains: string[];
  webLoginPath: string;
  webLogoutPath: string;
  // Public web pages reachable from the in-app Settings screen. Each path is
  // joined with `webBaseUrl` at call time so the user lands on the right
  // regional storefront. Update the paths to match the live URLs on
  // dressfair.com / dressfair.om / sa.dressfair.com.
  privacyPolicyPath: string;
  termsPath: string;
  helpSupportPath: string;
  accountDeletionPath: string;
  supportEmail: string;
  // Storefront product-detail prefix. The Next.js storefront resolves a
  // product page from its SKU using `<webBaseUrl><productPathPrefix>/<sku>`
  // (see `productHrefForSku`). The prefix begins with the regional locale
  // segment (`/ae`, `/om`, `/sa`) so cross-region deep-links cannot bleed.
  productPathPrefix: string;
};

const configs: Record<CountryCode, EnvConfig> = {
  UAE: {
    apiBaseUrl:
      'https://backend.dressfair.com/index.php?route=extension/opencart',
    apiHost: 'https://backend.dressfair.com',
    apiRoutePrefix: '/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.com',
    // Both apex (dressfair.com) and www must be in the allowlist because the
    // storefront server canonicalises between them via 301 redirects. Without
    // the apex the WebView would hand off the redirect to the OS browser.
    allowedDomains: [
      'dressfair.com',
      'www.dressfair.com',
      'backend.dressfair.com',
    ],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.com',
    productPathPrefix: '/ae/p',
  },
  OMN: {
    apiBaseUrl:
      'https://backend.dressfair.om/index.php?route=extension/opencart',
    apiHost: 'https://backend.dressfair.om',
    apiRoutePrefix: '/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.om',
    allowedDomains: [
      'dressfair.om',
      'www.dressfair.om',
      'backend.dressfair.om',
    ],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.om',
    // CONFIRM: Oman storefront locale prefix. `/om/p/<sku>` is the assumed
    // mirror of the UAE pattern. Update once verified on the live site.
    productPathPrefix: '/om/p',
  },
  KSA: {
    apiBaseUrl:
      'https://backendsa.dressfair.com/index.php?route=extension/opencart',
    apiHost: 'https://backendsa.dressfair.com',
    apiRoutePrefix: '/index.php?route=extension/opencart',
    webBaseUrl: 'https://sa.dressfair.com',
    allowedDomains: ['sa.dressfair.com', 'backendsa.dressfair.com'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.com',
    // CONFIRM: KSA storefront locale prefix. `/sa/p/<sku>` is the assumed
    // mirror of the UAE pattern. Update once verified on the live site.
    productPathPrefix: '/sa/p',
  },
};

export const getEnvConfig = (country: CountryCode): EnvConfig => configs[country];

// Build a relative storefront path for a product, given its SKU (the OpenCart
// `model` field on result items, or the `sku` field on suggestion items).
// The path is intentionally relative so callers can dispatch it through
// `requestWebNav` and the WebView will resolve it against `webBaseUrl`.
//
// Returns `null` when `sku` is empty so callers can fall back to a generic
// search results URL rather than navigate to a 404.
export const productHrefForSku = (
  sku: string,
  country: CountryCode,
): string | null => {
  const trimmed = sku.trim();
  if (trimmed.length === 0) return null;
  const { productPathPrefix } = getEnvConfig(country);
  return `${productPathPrefix}/${encodeURIComponent(trimmed)}`;
};
