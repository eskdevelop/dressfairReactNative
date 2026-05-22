/**
 * Hydrates Next.js storefront client auth from native JWT — web checkout often
 * reads localStorage / cookies set only by the in-browser login flow, not Bearer
 * headers on fetch. Runs before page scripts and whenever native updates headers.
 */
export function buildStorefrontWebSessionHydration(
  customerInfoUrlJson: string,
): string {
  return `
(function() {
  if (window.__dressfairWebSessionHydrationInstalled) {
    if (typeof window.__dressfairHydrateWebSession === 'function') {
      window.__dressfairHydrateWebSession();
    }
    return true;
  }
  window.__dressfairWebSessionHydrationInstalled = true;

  var CUSTOMER_INFO_URL = ${customerInfoUrlJson};
  var STORAGE_KEYS = [
    'token',
    'access_token',
    'accessToken',
    'authToken',
    'customer_token',
    'customerToken',
    'user_token',
    'userToken',
    'jwt',
    'session_token',
    'sessionToken',
    'auth_token',
    'bearer_token',
  ];

  function readBearer() {
    var h = window.__dressfairBridgeHeaders;
    if (!h || typeof h !== 'object') return null;
    var raw = h.Authorization || h.authorization || h['x-customer-token'] || h['X-Customer-Token'];
    if (typeof raw !== 'string' || raw.length < 20) return null;
    if (raw.indexOf('Bearer ') === 0) return raw.slice(7);
    return raw;
  }

  function writeToken(token) {
    if (!token || token.length < 20) return false;
    var wrote = false;
    STORAGE_KEYS.forEach(function(key) {
      try {
        localStorage.setItem(key, token);
        sessionStorage.setItem(key, token);
        wrote = true;
      } catch (e) {}
    });
    try {
      localStorage.setItem('auth', JSON.stringify({ token: token, isAuthenticated: true, loggedIn: true }));
      localStorage.setItem('user', JSON.stringify({ token: token, isAuthenticated: true }));
      sessionStorage.setItem('auth', JSON.stringify({ token: token, isAuthenticated: true, loggedIn: true }));
    } catch (e2) {}
    try {
      var zustandPayload = JSON.stringify({
        state: { token: token, isAuthenticated: true, customerToken: token },
        version: 0,
      });
      ['persist:auth', 'auth-storage', 'dressfair-auth', 'customer-auth'].forEach(function(k) {
        try {
          localStorage.setItem(k, zustandPayload);
        } catch (e3) {}
      });
    } catch (e4) {}
    try {
      var cookieVal = encodeURIComponent(token);
      document.cookie = 'token=' + cookieVal + '; path=/; SameSite=Lax';
      document.cookie = 'customer_token=' + cookieVal + '; path=/; SameSite=Lax';
      document.cookie = 'access_token=' + cookieVal + '; path=/; SameSite=Lax';
    } catch (e5) {}
    return wrote;
  }

  function prefetchCustomer(token) {
    if (!CUSTOMER_INFO_URL || !token) return;
    var h = window.__dressfairBridgeHeaders || {};
    var headers = {};
    Object.keys(h).forEach(function(k) {
      headers[k] = h[k];
    });
    if (!headers.Authorization && !headers.authorization) {
      headers.Authorization = 'Bearer ' + token;
    }
    fetch(CUSTOMER_INFO_URL, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    })
      .then(function(r) {
        return r.json();
      })
      .then(function(body) {
        if (!body) return;
        var ok =
          body.success === true ||
          body.success === 1 ||
          body.success === '1' ||
          body.success === 'true';
        if (!ok) return;
        var customer = body.data && typeof body.data === 'object' ? body.data : body;
        try {
          localStorage.setItem('customer', JSON.stringify(customer));
          localStorage.setItem('customerInfo', JSON.stringify(customer));
          localStorage.setItem('userProfile', JSON.stringify(customer));
          sessionStorage.setItem('customer', JSON.stringify(customer));
        } catch (e) {}
        try {
          window.dispatchEvent(
            new CustomEvent('dressfair:native-customer', { detail: customer }),
          );
        } catch (e2) {}
      })
      .catch(function() {});
  }

  window.__dressfairHydrateWebSession = function() {
    var token = readBearer();
    if (!writeToken(token)) return;
    prefetchCustomer(token);
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dressfair:native-auth', { detail: { token: token } }));
    } catch (e) {}
  };

  window.__dressfairHydrateWebSession();
})();
true;
`;
}
