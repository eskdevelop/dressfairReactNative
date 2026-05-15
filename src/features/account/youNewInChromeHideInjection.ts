/**
 * Injected into the embedded You-tab New-In WebView to strip storefront chrome
 * (site header/nav only) plus surgical JS for the PLP title + filter row.
 *
 * **Do not** use broad `[class*="listing"]` / `[class*="plp"]` CSS — those often
 * match the same wrappers as the product grid on Next/Tailwind storefronts.
 *
 * Re-verify via WebView remote inspector on `/ae/new-in` if chrome reappears.
 */

export const YOU_NEW_IN_CHROME_HIDE_INJECTION = `
(function() {
  try {
    var STYLE_ID = 'dressfair-you-new-in-chrome-hide';

    function shouldChromeHide() {
      var p = window.location.pathname || '';
      return p.indexOf('new-in') !== -1;
    }

    /** PDP links — if present, never hide this subtree (grid lives here). */
    function countPdpLinks(el) {
      if (!el || !el.querySelectorAll) return 0;
      return el.querySelectorAll(
        'a[href*="/p/"], a[href*="/ae/p/"], a[href*="/om/p/"], a[href*="/sa/p/"]'
      ).length;
    }

    /** Site chrome only — must not match PLP grid containers. */
    var SELECTORS_TO_HIDE = [
      '.mobile-header',
      '[class*="mobile-header"]',
      '[class*="MobileHeader"]',
      '[class*="desktop-header"]',
      '[class*="DesktopHeader"]',
      '[class*="top-bar"]',
      '[class*="TopBar"]',
      '[class*="announcement-bar"]',
      '[class*="AnnouncementBar"]',
      '[class*="promotion-bar"]',
      '[class*="mega-menu"]',
      '[class*="MegaMenu"]',
      '[class*="main-navigation"]',
      '[class*="MainNavigation"]',
      '[class*="store-header"]',
      '[class*="StoreHeader"]',
      '[class*="site-header"]',
      '[class*="SiteHeader"]',
      '[class*="search-bar-desktop"]',
      '[class*="SearchBarDesktop"]'
    ];

    function looksLikeProductNoise(t) {
      return /sold|Đ|Ð|ð|đ|\\u0110|\\u0111|\\d+[.,]\\d{2}|aed|\\$|€|£|k\\s*\\+\\s*sold|★|\\b(zipper|piece)\\b/i.test(
        t || ''
      );
    }

    function hideSpacerSibling(el) {
      var nx = el.nextElementSibling;
      if (!nx) return;
      if (nx.tagName === 'HR') {
        nx.style.setProperty('display', 'none', 'important');
        return;
      }
      if (nx.tagName === 'DIV' && nx.offsetHeight > 0 && nx.offsetHeight < 22) {
        var nt = ((nx.textContent || '') + '').trim();
        if (nt.length < 3) nx.style.setProperty('display', 'none', 'important');
      }
    }

    function hidePlpChromeBlock(el) {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('height', '0', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('margin', '0', 'important');
      el.style.setProperty('padding', '0', 'important');
    }

    /**
     * Desktop / xl: best-seller-filters wraps a hidden xl:block column with
     * title row + filter grid (no PDPs) + spacer, then the product grid. Match
     * by class tokens + countPdpLinks — never hide a grid dense with PDPs/images.
     */
    function findBestSellerDesktopChromeColumn(root) {
      var hits = root.querySelectorAll('div.hidden[class*="xl:block"]');
      for (var hi = 0; hi < hits.length; hi++) {
        var w = hits[hi];
        for (var j = 0; j < w.children.length; j++) {
          var ch = w.children[j];
          var c = ((ch.className || '') + '');
          if (
            c.indexOf('justify-between') !== -1 &&
            c.indexOf('pb-4') !== -1 &&
            c.indexOf('px-3') !== -1 &&
            countPdpLinks(ch) === 0
          ) {
            return w;
          }
        }
      }
      return null;
    }

    function hideBestSellerFiltersDesktopRow() {
      var root = document.querySelector('div[class*="best-seller-filters"]');
      if (!root) return;
      var wrap = findBestSellerDesktopChromeColumn(root);
      if (!wrap) return;

      var kids = Array.from(wrap.children);
      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        var cls = ((el.className || '') + '');
        var pdp = countPdpLinks(el);
        var imgs = el.querySelectorAll('img').length;

        if (pdp >= 2) break;

        var gridCols = el.children ? el.children.length : 0;
        var gridTxt = ((el.textContent || '') + '').substring(0, 220);

        var isTitleRow =
          cls.indexOf('flex') !== -1 &&
          cls.indexOf('justify-between') !== -1 &&
          cls.indexOf('pb-4') !== -1 &&
          cls.indexOf('px-3') !== -1 &&
          pdp === 0;

        var btnsGrid = el.querySelectorAll('button, [role="combobox"]').length;
        var isFilterGrid =
          cls.indexOf('grid') !== -1 &&
          pdp === 0 &&
          imgs < 4 &&
          gridCols > 0 &&
          gridCols <= 14 &&
          (btnsGrid >= 2 ||
            /within\\s+last|filter\\s+by|recommended|\\bsort\\b/i.test(gridTxt));

        var isSpacer =
          pdp === 0 &&
          cls.indexOf('flex') !== -1 &&
          cls.indexOf('justify-center') !== -1 &&
          cls.indexOf('my-6') !== -1 &&
          el.offsetHeight > 0 &&
          el.offsetHeight < 96;

        if (isTitleRow || isFilterGrid || isSpacer) {
          hidePlpChromeBlock(el);
          continue;
        }

        break;
      }
    }

    /**
     * Next.js bundles the /ae/new-in mobile PLP under a div whose class contains
     * best-selller-mobile (sic — from Flight payload). Leading siblings inside
     * the inner layout are typically title row + filters; the grid is the first
     * block dense with PDP links / product images.
     */
    function hideLeadingSectionsInsideListingMobile() {
      var root =
        document.querySelector('div[class*="best-selller-mobile"]') ||
        document.querySelector('div[class*="best-seller-mobile"]') ||
        document.querySelector('div[class*="best-selller"]');
      if (!root) return;

      var cur = root;
      while (cur && cur.children.length === 1 && countPdpLinks(cur) < 2) {
        cur = cur.children[0];
      }

      var list = Array.from(cur.children);
      if (!list.length) return;

      var chromeStreak = 0;
      for (var i = 0; i < list.length; i++) {
        var sec = list[i];
        var pdp = countPdpLinks(sec);
        var imgs = sec.querySelectorAll('img').length;
        if (pdp > 0 || imgs >= 6) break;

        var head = ((sec.textContent || '') + '').trim().substring(0, 100).toLowerCase();
        var looksChrome = head.indexOf('new') !== -1 && head.indexOf('arrival') !== -1;
        /** Avoid lone "recommended" / "sort" — they appear in PDP copy and nuked whole grids. */
        var looksFilter = /within\\s+last|filter\\s+by/i.test(head);
        var looksThin = imgs < 3 && sec.querySelectorAll('button, [role="combobox"]').length > 0;
        var looksSpacer =
          chromeStreak > 0 &&
          chromeStreak < 5 &&
          imgs < 2 &&
          pdp === 0 &&
          sec.offsetHeight < 90 &&
          sec.querySelectorAll('button').length === 0 &&
          head.length < 24;

        if (looksChrome || looksFilter || looksThin) {
          sec.style.setProperty('display', 'none', 'important');
          sec.style.setProperty('height', '0', 'important');
          sec.style.setProperty('overflow', 'hidden', 'important');
          sec.style.setProperty('margin', '0', 'important');
          sec.style.setProperty('padding', '0', 'important');
          chromeStreak += 1;
          continue;
        }

        if (looksSpacer) {
          sec.style.setProperty('display', 'none', 'important');
          sec.style.setProperty('height', '0', 'important');
          sec.style.setProperty('overflow', 'hidden', 'important');
          chromeStreak += 1;
          continue;
        }

        break;
      }
    }

    /** Title + filter row only — never touch ancestors that contain PDP links. */
    function hideInlinePlpUi() {
      if (!shouldChromeHide()) return;

      try {
        hideBestSellerFiltersDesktopRow();
      } catch (eDesktop) {}

      try {
        hideLeadingSectionsInsideListingMobile();
      } catch (eListing) {}

      try {
        var heads = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
        for (var hi = 0; hi < heads.length; hi++) {
          var he = heads[hi];
          if (countPdpLinks(he) > 0) continue;
          var hun = ((he.textContent || '') + '').trim().replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ');
          if (hun.length < 6 || hun.length > 140) continue;
          if (
            /^\\s*new[\\s\\-]*arrivals?(\\s+items?)?\\b/i.test(hun) &&
            !looksLikeProductNoise(hun)
          ) {
            he.style.setProperty('display', 'none', 'important');
            hideSpacerSibling(he);
          }
        }
      } catch (eh) {}

      try {
        var twt = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var tn;
        while ((tn = twt.nextNode())) {
          var tv = ((tn.nodeValue || '') + '').trim().replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ');
          if (tv.length < 6 || tv.length > 56) continue;
          if (!/^new[\\s\\-]*arrivals?(\\s+items?)?\\s*$/i.test(tv)) continue;
          var pe = tn.parentElement;
          if (!pe || countPdpLinks(pe) > 0) continue;
          var ptxt = ((pe.textContent || '') + '').trim();
          var pOne = ptxt.replace(/\\s+/g, ' ');
          if (/^new[\\s\\-]*arrivals?(\\s+items?)?\\s*$/i.test(pOne) && !looksLikeProductNoise(ptxt)) {
            pe.style.setProperty('display', 'none', 'important');
            hideSpacerSibling(pe);
            break;
          }
        }
      } catch (etext) {}

      try {
        var twf = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var fn;
        while ((fn = twf.nextNode())) {
          var fv = ((fn.nodeValue || '') + '').trim().replace(/\\u00a0/g, ' ');
          if (!fv || fv.length > 72) continue;
          if (
            !/within\\s+last\\s+\\d+\\s+days/i.test(fv) &&
            !(/recommended/i.test(fv) && fv.trim().length < 45) &&
            !/filter\\s+by\\s+category/i.test(fv)
          ) {
            continue;
          }
          var fel = fn.parentElement;
          for (var fd = 0; fd < 14 && fel; fd++) {
            if (fel.tagName === 'BODY' || fel.tagName === 'HTML') break;
            if (countPdpLinks(fel) >= 1) break;
            var btnLike = fel.querySelectorAll('button, [role="button"], [role="combobox"], div[role="button"]').length;
            var snippet = ((fel.textContent || '') + '').length;
            if (
              (btnLike >= 2 && snippet < 1800) ||
              (btnLike >= 1 && snippet < 520 && (/within\\s+last/i.test(fv) || /^recommended/i.test(fv)))
            ) {
              fel.style.setProperty('display', 'none', 'important');
              fel.style.setProperty('height', '0', 'important');
              fel.style.setProperty('overflow', 'hidden', 'important');
              fel.style.setProperty('margin', '0', 'important');
              fel.style.setProperty('padding', '0', 'important');
              break;
            }
            fel = fel.parentElement;
          }
        }
      } catch (ew) {}

      try {
        var btns = document.querySelectorAll(
          'button, [role="combobox"], a[role="button"], div[role="button"], span[role="button"], [aria-haspopup="listbox"]'
        );
        for (var b = 0; b < btns.length; b++) {
          var el = btns[b];
          var txt = ((el.textContent || '') + '').trim().replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ');
          if (!txt || txt.length > 120) continue;
          if (
            !/within\\s+last\\s+\\d+\\s+days/i.test(txt) &&
            !(/recommended/i.test(txt) && txt.length < 55) &&
            !/filter\\s+by\\s+category/i.test(txt)
          ) {
            continue;
          }
          var row = el.parentElement;
          for (var depth = 0; depth < 14 && row; depth++) {
            if (row.tagName === 'BODY' || row.tagName === 'HTML') break;
            if (countPdpLinks(row) >= 1) break;
            var btnLike2 = row.querySelectorAll(
              'button, [role="combobox"], div[role="button"], span[role="button"]'
            ).length;
            var snippet2 = ((row.textContent || '') + '').length;
            if (
              (btnLike2 >= 2 && snippet2 < 1800) ||
              (btnLike2 >= 1 && snippet2 < 520 && (/within\\s+last/i.test(txt) || /^recommended/i.test(txt)))
            ) {
              row.style.setProperty('display', 'none', 'important');
              row.style.setProperty('height', '0', 'important');
              row.style.setProperty('overflow', 'hidden', 'important');
              row.style.setProperty('margin', '0', 'important');
              row.style.setProperty('padding', '0', 'important');
              break;
            }
            row = row.parentElement;
          }
        }
      } catch (eBtns) {}
    }

    function ensureStyleInjectedCss() {
      if (document.getElementById(STYLE_ID)) return;
      var s = document.createElement('style');
      s.id = STYLE_ID;
      s.setAttribute('data-dressfair', 'hide-you-new-in-chrome');
      var rules = SELECTORS_TO_HIDE.map(function(sel) {
        try {
          return (
            sel +
            '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}'
          );
        } catch (err) {
          return '';
        }
      }).join('\\n');
      s.textContent = rules;
      (document.head || document.documentElement).appendChild(s);
    }

    function hideSelectors() {
      if (!shouldChromeHide()) {
        try {
          var stale = document.getElementById(STYLE_ID);
          if (stale) stale.remove();
        } catch (rm) {}
        return;
      }
      ensureStyleInjectedCss();
      hideInlinePlpUi();
      try {
        document.documentElement.style.setProperty('padding-top', '0', 'important');
        document.body.style.setProperty('padding-top', '0', 'important');
      } catch (e2) {}
    }

    hideSelectors();

    if (window.__dressfairYouNewInChromeWatcher) return true;
    window.__dressfairYouNewInChromeWatcher = true;

    try {
      var obs = new MutationObserver(function() {
        hideSelectors();
      });
      if (document.documentElement) {
        obs.observe(document.documentElement, { childList: true, subtree: true });
      }
      setTimeout(function() {
        try {
          obs.disconnect();
        } catch (d) {}
      }, 26000);
    } catch (obsErr) {}

    try {
      var n = 0;
      var iv = setInterval(function() {
        hideSelectors();
        n += 1;
        if (n >= 80) clearInterval(iv);
      }, 220);
    } catch (tickErr) {}
  } catch (topErr) {}
  return true;
})();
true;
`;
