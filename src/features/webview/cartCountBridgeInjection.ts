/**
 * Best-effort cart quantity for the native tab bar: scans `/cart` links for a
 * small numeric badge in subtree text. Storefront markup changes may require
 * selector tweaks here only.
 */
export const CART_COUNT_BRIDGE_INJECTION = `
(function() {
  if (window.__dressfairCartCountBridgeInstalled) return true;
  window.__dressfairCartCountBridgeInstalled = true;

  var lastPosted = -1;
  var debounceTimer = null;

  function post(qty) {
    var n = typeof qty === 'number' && qty >= 0 ? Math.floor(qty) : 0;
    if (n === lastPosted) return;
    lastPosted = n;
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'cart_count',
          quantity: n
        }));
      }
    } catch (e) {}
  }

  /** Prefer standalone small integers (badge-sized), else largest plausible cart total under 9999. */
  function qtyFromTextBlob(blob) {
    if (!blob) return 0;
    var s = String(blob).replace(/\\s+/g, ' ').trim();
    var nums = [];
    var re = /\\b(\\d{1,4})\\b/g;
    var m;
    while ((m = re.exec(s)) !== null) {
      nums.push(parseInt(m[1], 10));
    }
    if (nums.length === 0) return 0;
    var small = nums.filter(function(x) {
      return x >= 1 && x <= 99;
    });
    if (small.length > 0) return Math.min.apply(null, small);
    return Math.min(Math.max.apply(null, nums), 9999);
  }

  function scanOnce() {
    try {
      var links = document.querySelectorAll(
        'a[href*="/cart"], a[href*="checkout/cart"], a[href*="shopping_cart"], a[href*="route=checkout/cart"]'
      );
      if (!links.length) {
        return;
      }
      var best = 0;
      for (var i = 0; i < links.length; i++) {
        var q = qtyFromTextBlob(links[i].textContent || '');
        if (q > best) best = q;
      }
      post(best);
    } catch (err) {
      return;
    }
  }

  function schedule() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      debounceTimer = null;
      scanOnce();
    }, 140);
  }

  scanOnce();

  try {
    var obs = new MutationObserver(schedule);
    if (document.documentElement) {
      obs.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    setTimeout(function() {
      try {
        obs.disconnect();
      } catch (d) {}
    }, 15000);
  } catch (obsErr) {}

  var polls = 0;
  var iv = setInterval(function() {
    scanOnce();
    polls++;
    if (polls >= 30) clearInterval(iv);
  }, 450);
})();
true;
`;
