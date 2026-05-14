/**
 * Shared rules for detecting a successful storefront login response that
 * carries a JWT for native REST calls. Kept in TypeScript so we can unit-test
 * the same shape the WebView injection looks for.
 */
export const extractCustomerTokenFromLoginResponse = (raw: string): string | null => {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== 'object') return null;
    const ok =
      data.success === true ||
      data.success === 1 ||
      data.success === '1' ||
      data.success === 'true';
    if (!ok) return null;
    const token = data.token;
    if (typeof token !== 'string' || token.length < 20) return null;
    return token;
  } catch {
    return null;
  }
};

export const looksLikeCustomerLoginRequestUrl = (url: string): boolean => {
  if (typeof url !== 'string' || url.length === 0) return false;
  // Matches .../checkout/customer/login and similar paths; requires "customer/login"
  // and avoids accidental matches on marketing pages named "login".
  return url.includes('/customer/login');
};
