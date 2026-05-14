/**
 * Hides the Dress Fair mobile site header (logo, in-page search, menu/profile/cart)
 * when the native shell already shows the category tab search bar.
 *
 * DOM anchor: `.mobile-header` (see `MOBILE_CATEGORY_MENU_CLICK_JS` in WebViewScreen).
 * If the storefront markup changes, adjust selectors only in this file.
 */
export const STOREFRONT_HIDE_MOBILE_HEADER_INJECTION = `
(function() {
  var STYLE_ID = 'dressfair-hide-plp-mobile-header';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.setAttribute('data-dressfair', 'hide-plp-header');
    s.textContent = '.mobile-header{display:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function hide() {
    ensureStyle();
    try {
      document.querySelectorAll('.mobile-header').forEach(function(el) {
        el.style.setProperty('display', 'none', 'important');
      });
    } catch (e) {}
  }

  hide();

  if (window.__dressfairPlHeaderWatcher) return true;
  window.__dressfairPlHeaderWatcher = true;

  try {
    var obs = new MutationObserver(function() {
      hide();
    });
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
    setTimeout(function() {
      try {
        obs.disconnect();
      } catch (d) {}
    }, 8000);
  } catch (obsErr) {}

  try {
    var n = 0;
    var iv = setInterval(function() {
      hide();
      n += 1;
      if (n >= 40) clearInterval(iv);
    }, 200);
  } catch (tickErr) {}
})();
true;
`;
