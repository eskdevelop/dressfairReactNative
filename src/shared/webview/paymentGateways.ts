// Curated list of payment gateway host suffixes whose pages are allowed to
// render inside the in-app WebView. Anything not on this list (and not a
// storefront host from `EnvConfig.allowedDomains`) is handed to the OS browser
// so the WebView never silently renders an arbitrary HTTPS page that could
// impersonate the storefront.
//
// Suffix matching means `payments.tap.company` matches `tap.company` and any
// future regional subdomain. Add new gateways here when integrated; do not
// match by substring (e.g. `tap` would match `notatap.example.com`).
export const PAYMENT_GATEWAY_HOST_SUFFIXES: readonly string[] = [
  // Tap Payments
  'tap.company',
  'gosell.io',
  // HyperPay
  'hyperpay.com',
  'oppwa.com',
  // Tabby
  'tabby.ai',
  // Tamara
  'tamara.co',
  // Card scheme directory servers (3DS) — public, well-known endpoints.
  '3dsecure.io',
  // Common bank issuer ACS hosts that frequently terminate 3DS challenges.
  // Add specific issuers used by the storefront's acquirer when known.
];

const matchesSuffix = (host: string, suffix: string): boolean => {
  const lowered = host.toLowerCase();
  const target = suffix.toLowerCase();
  return lowered === target || lowered.endsWith(`.${target}`);
};

export const isPaymentGatewayHost = (host: string): boolean =>
  PAYMENT_GATEWAY_HOST_SUFFIXES.some(suffix => matchesSuffix(host, suffix));
