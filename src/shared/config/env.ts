export type CountryCode = 'UAE' | 'OMN' | 'KSA';

/**
 * First path segment on the marketing storefront (`/ae`, `/om`, `/sa`) maps to app region.
 * Users can switch locale inside the embedded WebView; native Redux must follow the URL.
 */
const STOREFRONT_LOCALE_SEGMENT_TO_COUNTRY = {
  ae: 'UAE',
  om: 'OMN',
  sa: 'KSA',
} as const satisfies Record<string, CountryCode>;

/** Hostnames that serve locale-prefixed storefront paths used for native ↔ web sync. */
const STOREFRONT_LOCALE_SYNC_HOSTS = [
  'dressfair.com',
  'dressfair.om',
  'sa.dressfair.com',
] as const;

function hostnameMatchesLocaleSyncList(hostname: string): boolean {
  const h = hostname.replace(/^www\./i, '').toLowerCase();
  return STOREFRONT_LOCALE_SYNC_HOSTS.some(
    suffix => h === suffix || h.endsWith(`.${suffix}`),
  );
}

/**
 * Derive `CountryCode` from a loaded storefront URL (path prefix), or null if unknown / off-storefront.
 */
export function countryFromStorefrontBrowsingUrl(url: string): CountryCode | null {
  try {
    const u = new URL(url);
    if (!hostnameMatchesLocaleSyncList(u.hostname)) return null;
    const seg = u.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]?.toLowerCase();
    if (!seg) return null;
    const mapped = STOREFRONT_LOCALE_SEGMENT_TO_COUNTRY[seg as keyof typeof STOREFRONT_LOCALE_SEGMENT_TO_COUNTRY];
    return mapped ?? null;
  } catch {
    return null;
  }
}

/** Matches store-setting payload `iso_code_2` for each country code. */
export function countryIsoCode2(country: CountryCode): 'AE' | 'OM' | 'SA' {
  switch (country) {
    case 'UAE':
      return 'AE';
    case 'OMN':
      return 'OM';
    case 'KSA':
      return 'SA';
  }
}

/** Native region picker labels (Settings, onboarding, etc.). */
export const COUNTRY_OPTIONS: { code: CountryCode; label: string; flag: string }[] = [
  { code: 'UAE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'OMN', label: 'Oman', flag: '🇴🇲' },
  { code: 'KSA', label: 'Saudi Arabia', flag: '🇸🇦' },
];

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
  // Storefront JSON REST used by the Flutter app (`/api/rest/store/checkout/...`).
  // Must match the host that accepts the same JWT as WebView login.
  storefrontCheckoutApiBaseUrl: string;
  /**
   * Origin for `GET /api/rest/mobile-categories` **only** when it differs from `storefrontCheckoutApiBaseUrl`.
   * `backend.dressfair.*` often serves Next.js HTML for `/api/rest/*` (SPA), not OpenCart JSON — the Flutter
   * app still calls the ecomplug OC origin from `SessionController.baseUrl*`. Once infra proxies OC JSON on
   * the dressfair backend, remove this override.
   */
  mobileCategoriesApiBaseUrl?: string;
  // Regional "New in" collection path on the marketing site (Menu WebView).
  webNewInPath: string;
  // Regional storefront home path where the Category tab WebView lands. `/ae`
  // does not expose `/ae/categories` (404); the categories UI is a SPA overlay on
  // the locale root toggled via the `.menu-icons-mobile` header button — see
  // WebViewScreen `openMobileCategoryMenuOnLoad`.
  webCategoriesPath: string;
  // Storefront cart URL for the hidden cart-write WebView. Must share the same
  // origin as `webBaseUrl` so `localStorage.cart` is one bucket (www vs apex).
  webCartUrl: string;
  // Path param for `GET /api/rest/store/cities/{id}` (OpenCart **country** id for province/zone list).
  // Should match Flutter `sessionController.countryConfig.countryId` from store config for this region.
  storefrontCitiesCountryId: string;
  // Customer profile `image` field is relative to this CDN (Flutter `SimpleMethode.imageUrl`).
  customerAvatarCdnBaseUrl: string;
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
    // Same OC JSON origin as Flutter `SessionController` / JWT (`mobileCategoriesApiBaseUrl`).
    // `backend.dressfair.com` often does not serve `/api/rest/store/checkout/*` JSON for this JWT.
    storefrontCheckoutApiBaseUrl: 'https://9711694.ecomplug.com',
    mobileCategoriesApiBaseUrl: 'https://9711694.ecomplug.com',
    webNewInPath: '/ae/new-in',
    webCategoriesPath: '/ae',
    webCartUrl: 'https://www.dressfair.com/ae/cart',
    storefrontCitiesCountryId: '223',
    customerAvatarCdnBaseUrl:
      'https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com',
  },
  OMN: {
    apiBaseUrl:
      'https://backend.dressfair.om/index.php?route=extension/opencart',
    apiHost: 'https://backend.dressfair.om',
    apiRoutePrefix: '/index.php?route=extension/opencart',
    // Oman is served by the same Next.js/React storefront as UAE/KSA via the
    // path-locale `/om` (mirrors KSA's `/sa`). The standalone `dressfair.om`
    // host is a separate Angular SPA where none of the app's React-targeted
    // WebView injections (.mobile-header hide, footer/social hiders, PDP-ready
    // detection, cart bridge) match, so the storefront header overlaps the PDP.
    webBaseUrl: 'https://www.dressfair.com',
    allowedDomains: [
      'dressfair.com',
      'www.dressfair.com',
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
    productPathPrefix: '/om/p',
    storefrontCheckoutApiBaseUrl: 'https://9681695.ecomplug.com',
    mobileCategoriesApiBaseUrl: 'https://9681695.ecomplug.com',
    webNewInPath: '/om/new-in',
    webCategoriesPath: '/om',
    webCartUrl: 'https://www.dressfair.com/om/cart',
    storefrontCitiesCountryId: '162',
    customerAvatarCdnBaseUrl:
      'https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com',
  },
  KSA: {
    apiBaseUrl:
      'https://backendsa.dressfair.com/index.php?route=extension/opencart',
    apiHost: 'https://backendsa.dressfair.com',
    apiRoutePrefix: '/index.php?route=extension/opencart',
    // Saudi storefront is served at dressfair.com/sa (path locale); sa.dressfair.com
    // does not resolve in many environments (WebView ERR_NAME_NOT_RESOLVED).
    webBaseUrl: 'https://www.dressfair.com',
    allowedDomains: ['dressfair.com', 'www.dressfair.com', 'backendsa.dressfair.com'],
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
    storefrontCheckoutApiBaseUrl: 'https://9661696.ecomplug.com',
    mobileCategoriesApiBaseUrl: 'https://9661696.ecomplug.com',
    webNewInPath: '/sa/new-in',
    webCategoriesPath: '/sa',
    webCartUrl: 'https://www.dressfair.com/sa/cart',
    storefrontCitiesCountryId: '184',
    customerAvatarCdnBaseUrl:
      'https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com',
  },
};

export const getEnvConfig = (country: CountryCode): EnvConfig => configs[country];

/**
 * Locale-pinned storefront home path (`/ae`, `/om`, `/sa`). Loading the bare
 * root `/` lets the storefront's own geo/locale detection pick a store, which
 * can land on the wrong locale (wrong currency, `undefined` product names).
 * Always open the region root so product data renders for the active country.
 */
export const storefrontHomePath = (country: CountryCode): string => {
  const locale = getEnvConfig(country).webCategoriesPath.replace(/\/+$/, '');
  return locale.length > 0 ? locale : '/';
};

/** Canonical marketing-site privacy policy URL per region (e.g. UAE → …/ae/privacy-policy). */
export const privacyPolicyUrl = (country: CountryCode): string => {
  const { webBaseUrl, webCategoriesPath } = getEnvConfig(country);
  const base = webBaseUrl.replace(/\/+$/, '');
  const locale = webCategoriesPath.replace(/\/+$/, '');
  return `${base}${locale}/privacy-policy`;
};

/** Storefront account security page — delete account link lives at the bottom. */
export const accountSecurityUrl = (country: CountryCode): string => {
  const { webBaseUrl, webCategoriesPath } = getEnvConfig(country);
  const base = webBaseUrl.replace(/\/+$/, '');
  const locale = webCategoriesPath.replace(/\/+$/, '');
  return `${base}${locale}/user/account-security`;
};

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

/** Storefront PDP URL: `/{ae|om|sa}/p/{sku}` (absolute or relative path). */
export function isStorefrontProductDetailUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const pathOnly = (trimmed.startsWith('/') ? trimmed : (() => {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return '';
    }
  })()).split('?')[0]?.split('#')[0] ?? '';
  if (/^\/(ae|om|sa)\/p\/[^/]+/i.test(pathOnly)) return true;
  if (/^\/p\/[^/]+/i.test(pathOnly)) return true;
  return false;
}

/** Next.js category PLP path: `{webCategoriesPath}/c/{slug}` (e.g. `/ae/c/m-tops-blouses`). */
export const categoryCollectionPath=(
  slug: string,
  country: CountryCode,
): string | null => {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, '');
  if (trimmed.length === 0) return null;
  const { webCategoriesPath } = getEnvConfig(country);
  const base = webCategoriesPath.replace(/\/+$/, '') || '';
  const segments = trimmed.split('/').filter(Boolean);
  const encoded = segments.map(s => encodeURIComponent(s)).join('/');
  return `${base}/c/${encoded}`;
};
