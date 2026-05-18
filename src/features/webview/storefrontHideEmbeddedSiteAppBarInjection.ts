/**
 * Menu Settings WebView: hide storefront chrome that duplicates the native shell:
 *   • Duplicate Settings toolbar (div.fixed full-bleed top bar with border-b-gray-200 and z-[99999])
 *   • Floating home FAB (fixed + bottom-* + right-* + rounded-full + SVG)
 *
 * Primary matching uses Tailwind class substrings from production DOM (Chrome inspector).
 * Keeps light heuristics as fallback if markup shifts slightly.
 */
export const STOREFRONT_HIDE_EMBEDDED_SITE_APP_BAR_INJECTION = `
(function() {
  var ATTR_BAR = 'data-dressfair-rn-hidden-site-appbar';
  var ATTR_FAB = 'data-dressfair-rn-hidden-site-fab';
  var STYLE_ID = 'dressfair-hide-embedded-settings-chrome-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    // Toolbar: JS tags matching divs (Tailwind z-[99999] is awkward in pure CSS attribute selectors).
    s.textContent =
      '[' +
      ATTR_BAR +
      '="1"],[' +
      ATTR_FAB +
      '="1"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  /** DressFair settings duplicate app bar (inspect: fixed full-width top white bar, z-[99999]). */
  function tagDressfairSettingsToolbar() {
    ensureStyle();
    try {
      document.querySelectorAll('div').forEach(function(el) {
        if (!el || el.getAttribute(ATTR_BAR)) return;
        var c = (el.className && el.className.toString()) || '';
        if (c.indexOf('fixed') === -1) return;
        if (c.indexOf('top-0') === -1 || c.indexOf('w-full') === -1) return;
        if (c.indexOf('bg-white') === -1) return;
        if (c.indexOf('left-0') === -1 || c.indexOf('right-0') === -1) return;
        if (c.indexOf('border-b-gray-200') === -1) return;
        if (c.indexOf('z-[99999]') === -1) return;
        var foundSettingsTitle = false;
        var ps = el.querySelectorAll('p');
        for (var i = 0; i < ps.length; i++) {
          if ((ps[i].textContent || '').trim() === 'Settings') {
            foundSettingsTitle = true;
            break;
          }
        }
        if (!foundSettingsTitle) return;
        el.setAttribute(ATTR_BAR, '1');
      });
    } catch (e) {}
  }

  function normSettingsTitle(el) {
    var raw = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    return raw.replace(/^[\u200e\u200f\s›><«»°]+/gi, '').replace(/[\s›><«»°]+$/gi, '').trim();
  }

  function hideDupSettingsBarsFallback() {
    try {
      var sel =
        'header, nav, [role="banner"], div[class*="sticky"], div[class*="fixed"][class*="top"], div[class*="border-b"]';
      document.querySelectorAll(sel).forEach(function(el) {
        if (!el || el.getAttribute(ATTR_BAR)) return;
        var r = el.getBoundingClientRect();
        if (r.top > 96 || r.height < 28 || r.height > 120) return;
        if (normSettingsTitle(el) !== 'Settings') return;
        el.setAttribute(ATTR_BAR, '1');
      });

      document.querySelectorAll('p').forEach(function(p) {
        if ((p.textContent || '').trim() !== 'Settings') return;
        var bar = p.closest('div[class*="fixed"][class*="top-0"]');
        if (!bar || bar.getAttribute(ATTR_BAR)) return;
        var cc = (bar.className && bar.className.toString()) || '';
        if (cc.indexOf('border-b-gray-200') === -1) return;
        bar.setAttribute(ATTR_BAR, '1');
      });
    } catch (e2) {}
  }

  /** Circular fixed home control (bottom-right): needs fixed + bottom + right + rounded-full + svg. */
  function tagDressfairHomeFab() {
    ensureStyle();
    try {
      document.querySelectorAll('a, button, div').forEach(function(el) {
        if (!el || el.getAttribute(ATTR_FAB) || el.getAttribute(ATTR_BAR)) return;
        var c = (el.className && el.className.toString()) || '';
        if (c.indexOf('fixed') === -1) return;
        if (c.indexOf('bottom') === -1 || c.indexOf('right') === -1) return;
        if (c.indexOf('rounded-full') === -1) return;
        if (!el.querySelector('svg')) return;
        var r = el.getBoundingClientRect();
        if (r.width < 36 || r.width > 96) return;
        if (Math.abs(r.width - r.height) > 24) return;
        var cx = (r.left + r.right) / 2;
        var cy = (r.top + r.bottom) / 2;
        if (cx < window.innerWidth * 0.5) return;
        if (cy < window.innerHeight * 0.38) return;

        var hint =
          ((el.getAttribute('aria-label') || '') +
            ' ' +
            (el.getAttribute('title') || '') +
            ' ' +
            c).toLowerCase();
        if (
          hint.indexOf('home') >= 0 ||
          hint.indexOf('house') >= 0 ||
          hint.indexOf('fab') >= 0 ||
          (hint.indexOf('rounded-full') >= 0 && hint.indexOf('bottom') >= 0)
        ) {
          el.setAttribute(ATTR_FAB, '1');
        }
      });

      try {
        var pts = [
          [window.innerWidth - 28, window.innerHeight - 120],
          [window.innerWidth - 44, window.innerHeight - 88],
        ];
        for (var p = 0; p < pts.length; p++) {
          var st = document.elementsFromPoint(pts[p][0], pts[p][1]);
          for (var j = 0; j < st.length; j++) {
            var hit = st[j];
            if (!hit || hit.nodeType !== 1) continue;
            var tgt = hit.closest('a') || hit.closest('button');
            if (!tgt || tgt.getAttribute(ATTR_FAB)) continue;
            var cc = (tgt.className && tgt.className.toString()) || '';
            if (cc.indexOf('fixed') === -1 || cc.indexOf('rounded-full') === -1) continue;
            if (!tgt.querySelector('svg')) continue;
            var rr = tgt.getBoundingClientRect();
            if (rr.width < 36 || rr.width > 96) continue;
            tgt.setAttribute(ATTR_FAB, '1');
            break;
          }
        }
      } catch (fabPtErr) {}
    } catch (fabErr) {}
  }

  function hideAll() {
    tagDressfairSettingsToolbar();
    hideDupSettingsBarsFallback();
    tagDressfairHomeFab();
  }

  hideAll();

  if (window.__dressfairEmbeddedSettingsChromeWatcher) return true;
  window.__dressfairEmbeddedSettingsChromeWatcher = true;

  try {
    var obs = new MutationObserver(function() {
      hideAll();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function() {
      try {
        obs.disconnect();
      } catch (d) {}
    }, 16000);
  } catch (obsErr) {}

  try {
    var n = 0;
    var iv = setInterval(function() {
      hideAll();
      n += 1;
      if (n >= 90) clearInterval(iv);
    }, 200);
  } catch (tickErr) {}
})();
true;
`;
