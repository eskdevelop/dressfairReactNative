/**
 * Next.js client navigations (Home tab product taps) often keep `source.uri` at
 * `/ae` while `window.location` and the DOM update. Posts path + PDP surface
 * hints so native chrome can show the back arrow only on product detail.
 */
export const STOREFRONT_SPA_PATH_BRIDGE_INJECTION = `
(function() {
  if (window.__dressfairSpaPathBridgeInstalled) return true;
  window.__dressfairSpaPathBridgeInstalled = true;

  var PATH_TYPE = 'storefront_spa_path';
  var SURFACE_TYPE = 'storefront_pdp_surface';
  var lastPath = '';
  var lastPdp = null;

  function post(obj) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    } catch (e) {}
  }

  function pathLooksPdp(path) {
    return /^\\/(ae|om|sa)\\/p\\/[^/]+/i.test(path) || /^\\/p\\/[^/]+/i.test(path);
  }

  function domLooksPdp() {
    try {
      var body = document.body;
      if (!body) return false;
      var text = (body.innerText || '').trim();
      if (text.length < 40 || !body.querySelector('img')) return false;
      if (!/add to cart|buy it now|best offer|lightning deal/i.test(text)) return false;
      if (/size:|color:|almost sold out|\\d[\\d,.]*\\s*(AED|SAR|OMR|USD|₫)/i.test(text)) return true;
      return /sold|rating|★/i.test(text) && /add to cart/i.test(text);
    } catch (e) {
      return false;
    }
  }

  function emitPath() {
    var path = window.location.pathname + window.location.search;
    if (path === lastPath) return;
    lastPath = path;
    post({ type: PATH_TYPE, path: path });
  }

  function emitSurface() {
    var path = (window.location.pathname || '').split('?')[0];
    var isPdp = pathLooksPdp(path) || domLooksPdp();
    if (isPdp === lastPdp) return;
    lastPdp = isPdp;
    post({ type: SURFACE_TYPE, is_pdp: isPdp });
  }

  function tick() {
    emitPath();
    emitSurface();
  }

  function hookHistory() {
    var push = history.pushState;
    var replace = history.replaceState;
    history.pushState = function() {
      var r = push.apply(this, arguments);
      tick();
      return r;
    };
    history.replaceState = function() {
      var r = replace.apply(this, arguments);
      tick();
      return r;
    };
    window.addEventListener('popstate', tick, true);
  }

  hookHistory();
  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick, { once: true });
  }
  window.addEventListener('load', tick, { once: true });
  try {
    var obs = new MutationObserver(function() { emitSurface(); });
    var arm = function() {
      if (!document.body) return;
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      emitSurface();
    };
    if (document.body) arm();
    else document.addEventListener('DOMContentLoaded', arm, { once: true });
  } catch (e2) {}
  setInterval(tick, 600);
})();
true;
`;
