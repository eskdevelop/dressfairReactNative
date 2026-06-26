/** Same sentinel WebViewScreen listens for — reused so PDP can defer until buy UI is visible. */
const FIRST_PAINT_SENTINEL = '__dressfair_first_paint__';

/** Hide the native PDP loader once the product shell is visible (image + title/price), not full hydration. */
export const STOREFRONT_PDP_READY_DETECTION = `
(function() {
  if (window.__dressfairPdpReadyWatchInstalled) return true;
  window.__dressfairPdpReadyWatchInstalled = true;
  var SENTINEL = ${JSON.stringify(FIRST_PAINT_SENTINEL)};
  function notify() {
    if (window.__dressfairPaintNotified) return;
    window.__dressfairPaintNotified = true;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: SENTINEL }));
    }
  }
  function isReady() {
    try {
      var body = document.body;
      if (!body) return false;
      var text = (body.innerText || '').trim();
      if (text.indexOf('Application error') !== -1) return false;
      if (text.length < 40) return false;
      if (!body.querySelector('img')) return false;
      if (/add to cart|buy it now|best offer|lightning deal|size:|color:/i.test(text)) return true;
      if (/\\d[\\d,.]*\\s*(AED|SAR|OMR|USD|₫)/i.test(text)) return true;
      if (/sold|rating|★/i.test(text)) return true;
      return text.length > 90;
    } catch (e) {
      return false;
    }
  }
  function check() {
    if (!isReady()) return;
    requestAnimationFrame(function() { requestAnimationFrame(notify); });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    check();
  } else {
    document.addEventListener('DOMContentLoaded', check, { once: true });
    window.addEventListener('load', check, { once: true });
  }
  try {
    var obs = new MutationObserver(function() { check(); });
    var start = function() {
      if (!document.body) return;
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      check();
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  } catch (e2) {}
})();
true;
`;
