/**
 * The marketing site does not serve a usable `/login` HTML route in embedded WebViews
 * (Next.js notFound shell). Login is the same SPA modal triggered from the mobile header chip.
 *
 * Loads regional home (`/ae`, `/om`, `/sa`), keep `.mobile-header` visible, run this injection
 * so the storefront opens "Sign In / Register" without site-side changes.
 */
export const STOREFRONT_OPEN_LOGIN_MODAL_INJECTION = `
(function() {
  var KEY = '__dressfairOpenLogin_iv';
  if (window[KEY] != null) {
    clearInterval(window[KEY]);
    window[KEY] = null;
  }

  function textMatch(s) {
    var x = ((s || '') + '').trim().replace(/\\s+/g, ' ');
    if (/^sign\\s*in\\s*\\/\\s*register$/i.test(x)) return true;
    if (/^sign\\s*in$/i.test(x) && x.length < 22) return true;
    return /^register$/i.test(x) && x.length < 22;
  }

  function headerRoots() {
    var roots = [];
    var mh = document.querySelectorAll('[class*="mobile-header"], header [class*="header"], header');
    for (var i = 0; i < mh.length; i++) roots.push(mh[i]);
    if (roots.length === 0 && document.body) roots.push(document.body);
    return roots;
  }

  function clickFromTextNode(root) {
    try {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var tn;
      while ((tn = walker.nextNode())) {
        if (!tn.nodeValue || tn.nodeValue.length > 140) continue;
        var normalized = tn.nodeValue.replace(/\\s+/g, ' ').trim();
        if (!textMatch(normalized)) continue;

        var el = tn.parentElement;
        var depth = 0;
        while (el && depth < 14) {
          if (el.tagName === 'BUTTON' ||
              el.tagName === 'A' ||
              el.getAttribute('role') === 'button' ||
              (el.tagName === 'LI' && el.classList && el.classList.contains('cursor-pointer')) ||
              (el.onclick != null || el.tabIndex >= 0)) {
            try {
              el.click();
              return true;
            } catch (xe) {}
          }
          el = el.parentElement;
          depth++;
        }
        if (tn.parentElement) {
          try {
            tn.parentElement.click();
            return true;
          } catch (_) {}
        }
      }
    } catch (eWalk) {}
    return false;
  }

  function clickProfileTriggers() {
    var sels = [
      '.mobile-header a[href*="login"]',
      '.mobile-header button[aria-label*="account"]',
      '.mobile-header button[aria-label*="Account"]',
      '.mobile-header [aria-label*="sign in"]',
      '.mobile-header [aria-label*="Sign in"]',
      '[class*="mobile-header"] button[aria-label*="account"]',
      '[class*="mobile-header"] button[aria-label*="Account"]',
      '[class*="mobile-header"] [aria-label*="profile"]',
      '[class*="mobile-header"] [aria-label*="Profile"]'
    ];
    for (var s = 0; s < sels.length; s++) {
      try {
        var el = document.querySelector(sels[s]);
        if (el && typeof el.click === 'function') {
          el.click();
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  var tries = 0;
  var max = 54;
  var iv = setInterval(function() {
    tries++;
    if (tries > max) {
      clearInterval(iv);
      window[KEY] = null;
      return;
    }
    var hr = headerRoots();
    var idx;
    for (idx = 0; idx < hr.length; idx++) {
      if (clickFromTextNode(hr[idx])) {
        clearInterval(iv);
        window[KEY] = null;
        return;
      }
    }
    if (tries === 9 || tries === 18 || tries === 28) clickProfileTriggers();

    var btns = document.querySelectorAll('button, [role="button"], a');
    var tNorm;
    for (idx = 0; idx < btns.length; idx++) {
      tNorm = ((btns[idx].textContent || '') + '').replace(/\\s+/g, ' ').trim().toLowerCase();
      if (tNorm === 'sign in / register' || (tNorm.indexOf('sign in') === 0 && tNorm.indexOf('register') !== -1)) {
        try {
          btns[idx].click();
          clearInterval(iv);
          window[KEY] = null;
          return;
        } catch (_) {}
      }
    }
  }, 198);
  window[KEY] = iv;
})();
true;
`;
