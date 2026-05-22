/**
 * Reads dressfair.com `localStorage` key `cart` and posts snapshots to native.
 * Hooks `localStorage.setItem` so same-tab add-to-cart updates propagate.
 */
export const CART_STORAGE_BRIDGE_INJECTION = `
(function() {
  if (window.__dressfairCartStorageBridgeInstalled) return true;
  window.__dressfairCartStorageBridgeInstalled = true;

  var CART_KEY = 'cart';
  var lastSig = '';

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

  /** Native-initiated write — updates web storage without echoing back to native. */
  window.__dressfairWriteWebCart = function(json) {
    try {
      localStorage.setItem(CART_KEY, json);
      lastSig = json;
    } catch (e) {}
  };

  try {
    var orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(key, value) {
      orig(key, value);
      if (key === CART_KEY) postSnapshot();
    };
  } catch (hookErr) {}

  postSnapshot();

  var polls = 0;
  var iv = setInterval(function() {
    postSnapshot();
    polls += 1;
    if (polls >= 24) clearInterval(iv);
  }, 500);
})();
true;
`;

/** Minimal injection for write-only hidden WebView — no read/poll loop. */
export const CART_WRITE_ONLY_INJECTION = `
(function() {
  if (window.__dressfairWriteWebCart) return true;
  window.__dressfairWriteWebCart = function(json) {
    try {
      localStorage.setItem('cart', json);
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
