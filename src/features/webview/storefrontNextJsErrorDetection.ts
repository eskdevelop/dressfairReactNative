export const NEXTJS_ERROR_SENTINEL = '__dressfair_nextjs_error__';

const NEXTJS_ERROR_MARKER = 'Application error: a client-side exception';

/** Detects the Next.js production error page and notifies native for Retry UI. */
export const STOREFRONT_NEXTJS_ERROR_DETECTION = `
(function() {
  if (window.__dressfairNextJsErrorWatchInstalled) return true;
  window.__dressfairNextJsErrorWatchInstalled = true;
  var MARKER = ${JSON.stringify(NEXTJS_ERROR_MARKER)};
  function check() {
    try {
      var text = document.body && document.body.innerText ? document.body.innerText : '';
      if (text.indexOf(MARKER) === -1) return;
      if (window.__dressfairNextJsErrorNotified) return;
      window.__dressfairNextJsErrorNotified = true;
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${JSON.stringify(NEXTJS_ERROR_SENTINEL)} }));
      }
    } catch (e) {}
  }
  function scheduleCheck() {
    setTimeout(check, 0);
    setTimeout(check, 800);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleCheck();
  } else {
    window.addEventListener('load', scheduleCheck, { once: true });
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
