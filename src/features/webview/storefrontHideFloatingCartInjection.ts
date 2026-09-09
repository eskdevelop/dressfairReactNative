/**
 * Hides the storefront's draggable mobile floating cart FAB
 * (`#theme9-floating-cart` — green cart circle + "Free shipping" pill).
 *
 * PDP-only (`hideStorefrontFloatingCart`). CSS is installed immediately so the
 * client-only widget is already `display:none` when `next/dynamic` mounts it.
 * JS fallbacks cover Next.js Link not forwarding `id`. Bump INJECTION_VERSION
 * when the matching logic changes so onLoadEnd re-installs over a stale guard.
 */
export const STOREFRONT_HIDE_FLOATING_CART_INJECTION = `
(function() {
  try {
    var INJECTION_VERSION = 'v2';
    var STYLE_ID = 'dressfair-hide-theme9-floating-cart';
    var ATTR = 'data-dressfair-rn-hidden-floating-cart';

    function ensureStyle() {
      var s = document.getElementById(STYLE_ID);
      if (!s) {
        s = document.createElement('style');
        s.id = STYLE_ID;
        s.setAttribute('data-dressfair', 'hide-floating-cart');
        (document.head || document.documentElement).appendChild(s);
      }
      s.textContent =
        '#theme9-floating-cart,' +
        'a[id="theme9-floating-cart"],' +
        'a[class*="00a63c"][class*="rounded-full"],' +
        'div[class*="fixed"][class*="inset-x-2"][class*="lg:hidden"][class*="pointer-events-none"],' +
        '[' + ATTR + '="1"]{' +
        'display:none!important;visibility:hidden!important;opacity:0!important;' +
        'pointer-events:none!important;height:0!important;width:0!important;' +
        'max-height:0!important;overflow:hidden!important;}';
    }

    function nuke(el) {
      if (!el || el.nodeType !== 1) return;
      if (el.getAttribute && el.getAttribute(ATTR) === '1') return;
      try { el.setAttribute(ATTR, '1'); } catch (e1) {}
      try {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      } catch (e2) {}
    }

    function hideById() {
      var el = document.getElementById('theme9-floating-cart');
      if (!el) {
        try { el = document.querySelector('a[id="theme9-floating-cart"]'); } catch (q) {}
      }
      if (!el) return false;
      nuke(el);
      var node = el.parentElement;
      for (var i = 0; i < 4 && node && node !== document.body; i++) {
        nuke(node);
        var c = (node.className && node.className.toString()) || '';
        if (c.indexOf('fixed') !== -1) break;
        node = node.parentElement;
      }
      return true;
    }

    function hideByClass() {
      try {
        var nodes = document.querySelectorAll('a, button, div');
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (!el || el.getAttribute(ATTR) === '1') continue;
          var c = (el.className && el.className.toString()) || '';
          if (c.indexOf('00a63c') === -1) continue;
          if (c.indexOf('rounded-full') === -1) continue;
          nuke(el);
          var node = el.parentElement;
          for (var d = 0; d < 4 && node && node !== document.body; d++) {
            nuke(node);
            var pc = (node.className && node.className.toString()) || '';
            if (pc.indexOf('fixed') !== -1) break;
            node = node.parentElement;
          }
        }
      } catch (e) {}
    }

    function hideByLabel() {
      try {
        var nodes = document.querySelectorAll('a, button, div');
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (!el || el.getAttribute(ATTR) === '1') continue;
          var raw = (el.textContent || '').replace(/\\s+/g, ' ').trim();
          if (raw.length === 0 || raw.length > 48) continue;
          var lower = raw.toLowerCase();
          if (lower.indexOf('cart') === -1) continue;
          if (lower.indexOf('free shipping') === -1 && lower.indexOf('free_shipping') === -1) continue;
          var r = el.getBoundingClientRect();
          if (r.width < 28 || r.width > 140) continue;
          nuke(el);
          var node = el.parentElement;
          for (var d = 0; d < 4 && node && node !== document.body; d++) {
            nuke(node);
            var pc = (node.className && node.className.toString()) || '';
            if (pc.indexOf('fixed') !== -1) break;
            node = node.parentElement;
          }
        }
      } catch (e2) {}
    }

    function hideAll() {
      ensureStyle();
      hideById();
      hideByClass();
      hideByLabel();
    }

    hideAll();

    if (window.__dressfairFloatingCartHider === INJECTION_VERSION) return true;
    window.__dressfairFloatingCartHider = INJECTION_VERSION;

    try {
      var obs = new MutationObserver(function() { hideAll(); });
      if (document.documentElement) {
        obs.observe(document.documentElement, { childList: true, subtree: true });
      }
      setTimeout(function() {
        try { obs.disconnect(); } catch (d) {}
      }, 45000);
    } catch (obsErr) {}

    try {
      var n = 0;
      var iv = setInterval(function() {
        hideAll();
        n += 1;
        if (n >= 120) clearInterval(iv);
      }, 250);
    } catch (tickErr) {}
  } catch (outerErr) {}
})();
true;
`;
