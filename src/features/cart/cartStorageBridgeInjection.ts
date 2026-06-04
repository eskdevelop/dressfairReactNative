/**
 * Reads dressfair.com `localStorage` key `cart` and posts snapshots to native.
 * Hooks `Storage.prototype.setItem` before page scripts so same-tab add-to-cart
 * updates propagate (iOS WKWebView loads storefront bundles early).
 */
export const CART_STORAGE_BRIDGE_INJECTION = `
(function() {
  if (window.__dressfairCartStorageBridgeInstalled) return true;
  window.__dressfairCartStorageBridgeInstalled = true;

  var CART_KEY = 'cart';
  var lastSig = '';
  var origSetItem = Storage.prototype.setItem;

  function readCartArray() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function postSnapshot() {
    try {
      var items = readCartArray();
      var sig = JSON.stringify(items);
      if (sig === lastSig) return;
      lastSig = sig;
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'cart_snapshot',
          items: items,
          source: 'web_localStorage'
        }));
      }
    } catch (err) {}
  }

  window.__dressfairPostWebCartSnapshot = postSnapshot;

  /** Native-initiated write — bypass hook so we do not echo back to native. */
  window.__dressfairWriteWebCart = function(json) {
    try {
      origSetItem.call(localStorage, CART_KEY, json);
      lastSig = json;
    } catch (e) {}
  };

  try {
    Storage.prototype.setItem = function(key, value) {
      origSetItem.call(this, key, value);
      if (this === localStorage && key === CART_KEY) postSnapshot();
    };
  } catch (hookErr) {}

  postSnapshot();

  var fastPolls = 0;
  var fastIv = setInterval(function() {
    postSnapshot();
    fastPolls += 1;
    if (fastPolls >= 24) clearInterval(fastIv);
  }, 500);

  setInterval(function() {
    postSnapshot();
  }, 2000);
})();
true;
`;

/** Minimal injection for write-only hidden WebView — no read/poll loop. */
export const CART_WRITE_ONLY_INJECTION = `
(function() {
  if (window.__dressfairWriteWebCart) return true;
  var origSetItem = Storage.prototype.setItem;
  window.__dressfairWriteWebCart = function(json) {
    try {
      origSetItem.call(localStorage, 'cart', json);
    } catch (e) {}
  };
})();
true;
`;

/** Inject native cart JSON into web localStorage before checkout. */
export function buildWriteWebCartInjection(cartJsonEscaped: string): string {
  return `
(function() {
  try {
    var json = ${cartJsonEscaped};
    if (window.__dressfairWriteWebCart) {
      window.__dressfairWriteWebCart(json);
    } else {
      localStorage.setItem('cart', json);
    }
  } catch (e) {}
})();
true;
`;
}
