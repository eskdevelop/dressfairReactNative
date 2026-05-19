/**
 * Hides the Dress Fair mobile storefront **footer** block (dark accordion:
 * "Top Categories", "Helpful links", "Get in touch", "Follow Us") when the page
 * is embedded in a native shell that already provides navigation — e.g. Search tab
 * browsing history WebView.
 *
 * Markup is Next.js + Tailwind and hydrates client-side; we use semantic
 * `footer`, `role="contentinfo"`, plus a text anchor on "Top Categories" with
 * upward walks. If production DOM shifts, tweak selectors only here.
 */
export const STOREFRONT_HIDE_MOBILE_FOOTER_INJECTION = `
(function() {
  var STYLE_ID = 'dressfair-hide-mobile-storefront-footer';
  var ATTR = 'data-dressfair-rn-hidden-footer';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.setAttribute('data-dressfair', 'hide-storefront-footer');
    s.textContent =
      'footer, [role="contentinfo"], [' +
      ATTR +
      '="1"]{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function tag(el) {
    if (!el || el.nodeType !== 1) return;
    try {
      el.setAttribute(ATTR, '1');
    } catch (e) {}
  }

  function hideBySemantics() {
    ensureStyle();
    try {
      document.querySelectorAll('footer, [role="contentinfo"]').forEach(tag);
    } catch (e) {}
  }

  /** Mobile mega-footer: first accordion title is usually "Top Categories". */
  function hideByTopCategoriesAnchor() {
    ensureStyle();
    try {
      var candidates = document.querySelectorAll(
        'button, a, [role="button"], h2, h3, p, span, div',
      );
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (!el || el.getAttribute(ATTR)) continue;
        var raw = (el.textContent || '').replace(/\\s+/g, ' ').trim();
        if (raw.indexOf('Top Categories') === -1) continue;
        if (raw.length > 64) continue;
        var node = el;
        for (var depth = 0; depth < 14 && node; depth++) {
          node = node.parentElement;
          if (!node || node === document.body) break;
          var r = node.getBoundingClientRect();
          if (r.width < window.innerWidth * 0.68) continue;
          var full = (node.textContent || '');
          if (
            full.indexOf('Helpful links') >= 0 ||
            full.indexOf('Get in touch') >= 0 ||
            full.indexOf('Follow Us') >= 0 ||
            full.indexOf('Follow us') >= 0
          ) {
            tag(node);
            break;
          }
          if (depth >= 3 && r.height > 96 && full.indexOf('Top Categories') >= 0) {
            var cls = (node.className && node.className.toString()) || '';
            if (cls.indexOf('bg-') >= 0 || depth >= 7) {
              tag(node);
              break;
            }
          }
        }
      }
    } catch (e2) {}
  }

  function hideAll() {
    hideBySemantics();
    hideByTopCategoriesAnchor();
  }

  hideAll();

  if (window.__dressfairMobileFooterHider) return true;
  window.__dressfairMobileFooterHider = true;

  try {
    var obs = new MutationObserver(function() {
      hideAll();
    });
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
    setTimeout(function() {
      try {
        obs.disconnect();
      } catch (d) {}
    }, 12000);
  } catch (obsErr) {}

  try {
    var n = 0;
    var iv = setInterval(function() {
      hideAll();
      n += 1;
      if (n >= 55) clearInterval(iv);
    }, 220);
  } catch (tickErr) {}
})();
true;
`;

/**
 * Same goal as {@link STOREFRONT_HIDE_MOBILE_FOOTER_INJECTION} but **only** real
 * `footer` / `role="contentinfo"` nodes. Skips the "Top Categories" upward walk,
 * which can accidentally hide a wrapper that still contains the main page (e.g.
 * browsing-history grid next to the mega-footer in one layout root).
 */
export const STOREFRONT_HIDE_MOBILE_FOOTER_SEMANTIC_ONLY_INJECTION = `
(function() {
  var STYLE_ID = 'dressfair-hide-mobile-storefront-footer-semantic';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.setAttribute('data-dressfair', 'hide-storefront-footer-semantic');
    s.textContent =
      'footer, [role="contentinfo"]{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function hide() {
    ensureStyle();
    try {
      document.querySelectorAll('footer, [role="contentinfo"]').forEach(function(el) {
        el.style.setProperty('display', 'none', 'important');
      });
    } catch (e) {}
  }

  hide();

  if (window.__dressfairMobileFooterHiderSemantic) return true;
  window.__dressfairMobileFooterHiderSemantic = true;

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
    }, 12000);
  } catch (obsErr) {}

  try {
    var n = 0;
    var iv = setInterval(function() {
      hide();
      n += 1;
      if (n >= 55) clearInterval(iv);
    }, 220);
  } catch (tickErr) {}
})();
true;
`;
