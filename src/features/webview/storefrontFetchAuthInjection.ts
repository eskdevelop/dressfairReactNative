/**
 * Patches `window.fetch` and `XMLHttpRequest` so credentialed storefront calls
 * from Next.js (checkout, customer info, etc.) receive the same headers as
 * native `buildStorefrontAuthHeaders` — even when the WebView cookie jar does
 * not match the browser after login.
 *
 * Native sets `window.__dressfairBridgeHeaders` before document scripts run and
 * updates it asynchronously once JWT / OC session are read from SecureStore / Redux.
 */
export function buildStorefrontFetchAuthInjection(
  initialHeadersJson: string,
  allowedHostsJson: string,
): string {
  return `
(function() {
  try {
    window.__dressfairBridgeHeaders = ${initialHeadersJson};
  } catch (e) {
    window.__dressfairBridgeHeaders = {};
  }
  var ALLOWED_HOSTS = ${allowedHostsJson};
  /** Always overwritten from native when present — wins over stale guest headers from the page. */
  var FORCE_HEADER_KEYS = { authorization: 1, 'x-customer-token': 1, 'x-customer-session': 1, 'x-oc-session': 1 };

  function hostMatches(u) {
    try {
      var h = u.hostname.replace(/^www\\./i, '').toLowerCase();
      for (var i = 0; i < ALLOWED_HOSTS.length; i++) {
        var ah = String(ALLOWED_HOSTS[i])
          .toLowerCase()
          .replace(/^www\\./i, '');
        if (h === ah || h.endsWith('.' + ah)) return true;
      }
    } catch (e2) {}
    return false;
  }

  function shouldPatchUrl(url) {
    if (typeof url !== 'string') return false;
    var low = url.toLowerCase();
    if (low.indexOf('/api/rest/') !== -1) return true;
    if (low.indexOf('ecomplug') !== -1) return true;
    if (low.indexOf('checkout') !== -1 || low.indexOf('customer') !== -1) return true;
    try {
      var base = typeof location !== 'undefined' && location.href ? location.href : 'https://dressfair.com/';
      var u = new URL(url, base);
      if (hostMatches(u)) {
        var p = (u.pathname || '').toLowerCase();
        if (p.indexOf('/api') !== -1 || p.indexOf('checkout') !== -1 || p.indexOf('customer') !== -1)
          return true;
      }
      if (
        low.indexOf('dressfair') !== -1 &&
        (low.indexOf('/api') !== -1 || low.indexOf('checkout') !== -1 || low.indexOf('customer') !== -1)
      )
        return true;
    } catch (e3) {}
    return false;
  }

  function getExtras() {
    return window.__dressfairBridgeHeaders && typeof window.__dressfairBridgeHeaders === 'object'
      ? window.__dressfairBridgeHeaders
      : {};
  }

  function mergeFetchInit(input, init) {
    init = init ? Object.assign({}, init) : {};
    var extras = getExtras();
    var keys = Object.keys(extras);
    if (keys.length === 0) return [input, init];

    var h = new Headers();
    try {
      if (init.headers) {
        new Headers(init.headers).forEach(function(v, k) {
          h.set(k, v);
        });
      } else if (typeof Request !== 'undefined' && input instanceof Request) {
        input.headers.forEach(function(v, k) {
          h.set(k, v);
        });
      }
    } catch (eh) {}

    keys.forEach(function(k) {
      try {
        var lk = String(k).toLowerCase();
        if (FORCE_HEADER_KEYS[lk] || !h.has(k)) {
          h.set(k, extras[k]);
        }
      } catch (ignore) {}
    });
    init.headers = h;

    if (typeof Request !== 'undefined' && input instanceof Request) {
      try {
        return [new Request(input, init), undefined];
      } catch (reqErr) {
        return [input, init];
      }
    }
    return [input, init];
  }

  function tryPatchAxios() {
    var ax = window.axios;
    if (!ax || !ax.interceptors || !ax.interceptors.request) return false;
    if (window.__dressfairAxiosAuthPatched) return true;
    window.__dressfairAxiosAuthPatched = true;
    ax.interceptors.request.use(function(config) {
      config.headers = config.headers || {};
      var ex = getExtras();
      var keys = Object.keys(ex);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        try {
          var lk = String(k).toLowerCase();
          var norm = config.headers.common || config.headers;
          var found = false;
          if (typeof norm === 'object' && norm !== null) {
            for (var ck in norm) {
              if (String(ck).toLowerCase() === lk) {
                found = true;
                break;
              }
            }
          }
          if (FORCE_HEADER_KEYS[lk] || !found) {
            if (typeof config.headers.set === 'function') {
              config.headers.set(k, ex[k]);
            } else {
              config.headers[k] = ex[k];
            }
          }
        } catch (e5) {}
      }
      return config;
    });
    return true;
  }

  if (!window.__dressfairFetchAuthInstalled) {
    window.__dressfairFetchAuthInstalled = true;

    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function(input, init) {
        var url = '';
        if (typeof input === 'string') url = input;
        else if (input && typeof input === 'object' && typeof input.url === 'string') url = input.url;
        if (!shouldPatchUrl(String(url))) return origFetch.apply(this, arguments);
        var pair = mergeFetchInit(input, init);
        return origFetch.call(this, pair[0], pair[1]);
      };
    }

    var XOpen = XMLHttpRequest.prototype.open;
    var XSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__dfUrl = url;
      return XOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function() {
      var self = this;
      var url = String(self.__dfUrl || '');
      if (shouldPatchUrl(url)) {
        var extras = getExtras();
        var keys = Object.keys(extras);
        var normal = [];
        var forced = [];
        for (var ki = 0; ki < keys.length; ki++) {
          var kk = keys[ki];
          if (FORCE_HEADER_KEYS[String(kk).toLowerCase()]) forced.push(kk);
          else normal.push(kk);
        }
        for (var ni = 0; ni < normal.length; ni++) {
          try {
            self.setRequestHeader(normal[ni], extras[normal[ni]]);
          } catch (xn) {}
        }
        for (var fi = 0; fi < forced.length; fi++) {
          try {
            self.setRequestHeader(forced[fi], extras[forced[fi]]);
          } catch (xf) {}
        }
      }
      return XSend.apply(this, arguments);
    };

    var axTry = 0;
    var axIv = setInterval(function() {
      if (tryPatchAxios() || axTry >= 40) clearInterval(axIv);
      axTry += 1;
    }, 400);
  }

  window.__dressfairRefreshNetworkAuth = function() {
    tryPatchAxios();
  };
})();
true;
`;
}
