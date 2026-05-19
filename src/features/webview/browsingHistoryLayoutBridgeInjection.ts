/**
 * Posts {@link BrowsingHistoryLayoutBridgeMessage} so native can show the
 * "Browsing history" section title only when the storefront page lists product hits.
 * Heuristic: PDP links (`/p/SKU`) and common empty-state phrases. Next.js DOM may
 * change — adjust here only.
 */
export const BROWSING_HISTORY_LAYOUT_BRIDGE_INJECTION = `
(function() {
  if (window.__dressfairBrowsingHistoryLayoutReporter) return true;
  window.__dressfairBrowsingHistoryLayoutReporter = true;

  function countProductLinks() {
    try {
      var n = 0;
      document.querySelectorAll('a[href*="/p/"]').forEach(function(a) {
        var h = (a.getAttribute('href') || '').split('#')[0];
        if (/\\/p\\/[^/?#]+/.test(h)) n += 1;
      });
      return n;
    } catch (e) {
      return 0;
    }
  }

  function looksEmptyCopy() {
    try {
      var t = ((document.body && document.body.innerText) || '').toLowerCase();
      if (t.indexOf('no browsing') >= 0) return true;
      if (t.indexOf('no history') >= 0) return true;
      if (t.indexOf('nothing here') >= 0) return true;
      if (t.indexOf("haven't viewed") >= 0) return true;
      if (t.indexOf('have not viewed') >= 0) return true;
      if (t.indexOf('start shopping') >= 0 && t.indexOf('browsing') >= 0) return true;
      return false;
    } catch (e2) {
      return false;
    }
  }

  function emit() {
    try {
      var n = countProductLinks();
      var empty = looksEmptyCopy();
      var hasItems = n >= 1 && !empty;
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'browsing_history_layout', has_items: hasItems }),
        );
    } catch (postErr) {}
  }

  emit();

  try {
    var obs = new MutationObserver(function() {
      emit();
    });
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
    setTimeout(function() {
      try {
        obs.disconnect();
      } catch (d) {}
    }, 10000);
  } catch (obsErr) {}

  try {
    var k = 0;
    var iv = setInterval(function() {
      emit();
      k += 1;
      if (k >= 45) clearInterval(iv);
    }, 200);
  } catch (tickErr) {}
})();
true;
`;
