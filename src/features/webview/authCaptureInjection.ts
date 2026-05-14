/**
 * Injected before any page script runs so `fetch` / `XMLHttpRequest` used by
 * the storefront are wrapped before the first network call. When a POST to a
 * URL whose path includes `/customer/login` returns JSON `{ success, token }`,
 * we forward the token to React Native via the existing `auth` bridge (see
 * `bridgeMessage.ts`).
 *
 * This complements an explicit `postMessage` from the web app if one exists.
 */
export const AUTH_CAPTURE_INJECTION_BEFORE_CONTENT = `
(function() {
  if (window.__dressfairAuthCaptureInstalled) return true;
  window.__dressfairAuthCaptureInstalled = true;

  function tryParseAndBridge(body) {
    if (!body || typeof body !== 'string') return;
    var token = null;
    try {
      var data = JSON.parse(body);
      if (!data || typeof data !== 'object') return;
      var ok = data.success === true || data.success === 1 || data.success === '1' || data.success === 'true';
      if (!ok) return;
      if (typeof data.token === 'string' && data.token.length >= 20) {
        token = data.token;
      }
    } catch (e) {
      return;
    }
    if (!token) return;
    if (window.__dressfairLastBridgedToken === token) return;
    window.__dressfairLastBridgedToken = token;
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'auth', token: token }));
      }
    } catch (postErr) {}
  }

  function isLoginPostUrl(url) {
    return typeof url === 'string' && url.indexOf('/customer/login') !== -1;
  }

  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function(input, init) {
      var method = (init && init.method) || (input && input.method) || 'GET';
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      return origFetch.apply(this, arguments).then(function(response) {
        if (String(method).toUpperCase() === 'POST' && isLoginPostUrl(url) && response.ok) {
          response.clone().text().then(function(text) {
            tryParseAndBridge(text);
          }).catch(function() {});
        }
        return response;
      });
    };
  }

  var XOpen = XMLHttpRequest.prototype.open;
  var XSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.__dfMethod = method;
    this.__dfUrl = url;
    return XOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    var method = xhr.__dfMethod;
    var url = xhr.__dfUrl || '';
    xhr.addEventListener('load', function() {
      if (String(method).toUpperCase() !== 'POST' || !isLoginPostUrl(url)) return;
      if (xhr.status < 200 || xhr.status >= 300) return;
      tryParseAndBridge(xhr.responseText);
    });
    return XSend.apply(this, arguments);
  };
})();
true;
`;
