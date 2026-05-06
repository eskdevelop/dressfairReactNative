import React, { useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import * as SplashScreenModule from 'expo-splash-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';

import { useAppDispatch } from '@app/hooks';
import { store } from '@app/store';
import { setAuthenticated } from '@app/storeSlices/appSlice';
import { sessionStore } from '@features/auth/sessionStore';
import { openSettings } from '@navigation/navigationRef';
import { getEnvConfig } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { AppAsyncState } from '@shared/ui/AppAsyncState';
import { safeOpenExternalUrl } from '@shared/webview/externalLinks';
import { isPaymentGatewayHost } from '@shared/webview/paymentGateways';
import { isAllowedUrl } from '@shared/webview/urlPolicy';
import { parseBridgeMessage } from './bridgeMessage';
import { detectPaymentRedirect } from './paymentRedirectPolicy';
// #region agent log
import { debugStartupLog } from '@shared/observability/__debugStartupLog';
// #endregion

type Props = {
  path: string;
};

const CHECKOUT_PATH_HINT =
  /checkout|payment|cart|order|confirm|success|failure|callback|3ds|return|pay/i;

const looksCheckoutRelated = (url: string): boolean => {
  try {
    const u = new URL(url);
    return CHECKOUT_PATH_HINT.test(u.pathname + u.search);
  } catch {
    return false;
  }
};

const isHttpsUrl = (url: string): boolean => url.startsWith('https://');

const isInternalWebViewUrl = (url: string): boolean =>
  url.startsWith('about:blank') ||
  url.startsWith('data:') ||
  url.startsWith('blob:') ||
  url.startsWith('javascript:');

const safeHost = (url: string): string | null => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

// Bridge sentinel posted by the injected JS once the storefront has actually
// painted its first frame. We hide the native splash on this signal — not on
// `onLoadEnd`, which fires when the network load finishes but BEFORE the
// WebView has flushed its first paint. Hiding on `onLoadEnd` exposes the
// white SafeAreaView for the duration of (paint - load), which the user
// perceives as a "white screen flash" between the logo and the storefront.
const FIRST_PAINT_SENTINEL = '__dressfair_first_paint__';
const FIRST_PAINT_INJECTION = `
(function() {
  if (window.__dressfairPaintNotified) return true;
  function notify() {
    if (window.__dressfairPaintNotified) return;
    window.__dressfairPaintNotified = true;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${FIRST_PAINT_SENTINEL}' }));
    }
  }
  function whenLoaded() {
    // Two RAFs: first one resolves layout, second resolves paint.
    requestAnimationFrame(function() { requestAnimationFrame(notify); });
  }
  if (document.readyState === 'complete') {
    whenLoaded();
  } else {
    window.addEventListener('load', whenLoaded, { once: true });
  }
})();
true;
`;

// Hide the native splash exactly once across the app's lifetime; remounts of
// WebViewScreen (e.g. tab switches) must not retrigger preventAutoHide.
let nativeSplashHidden = false;
const hideNativeSplashOnce = (reason: string) => {
  // #region agent log
  debugStartupLog(
    'WebViewScreen.tsx:hideNativeSplashOnce',
    'HIDE_NATIVE_SPLASH',
    { reason, alreadyHidden: nativeSplashHidden },
    'H1,H2,H4',
  );
  // #endregion
  if (nativeSplashHidden) return;
  nativeSplashHidden = true;
  SplashScreenModule.hideAsync().catch(() => {
    // Swallow: splash can already be hidden if the user backgrounded the app.
  });
};

export function WebViewScreen({ path }: Props) {
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  // Initial load is masked by the native splash; subsequent loads keep the
  // previously-painted page visible until the next one finishes (browser-like
  // behaviour), so the AppLoader overlay is never used during normal
  // navigation. It is only re-introduced when the user manually retries
  // after an error (`reload()` flips `loading` true via that code path).
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = getEnvConfig(store.getState().app.country);
  const uri = useMemo(() => `${cfg.webBaseUrl}${path}`, [cfg.webBaseUrl, path]);
  const allowedHostSet = useMemo(() => new Set(cfg.allowedDomains), [cfg.allowedDomains]);

  // #region agent log
  React.useEffect(() => {
    debugStartupLog(
      'WebViewScreen.tsx:mount',
      'WEBVIEW_MOUNT',
      { uri, path },
      'H3,H4,H5',
    );
  }, [uri, path]);
  // #endregion

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavChange = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    if (!looksCheckoutRelated(nav.url)) return;
    const payment = detectPaymentRedirect(nav.url);
    if (payment.isPaymentCallback) {
      analytics.track('payment_callback_detected', {
        status: payment.status,
      });
    }
  };

  // Safety net: if the WebView never fires onLoadEnd within 15s on a fresh
  // launch (slow network, dead host, etc.), drop the native splash and
  // surface a retry path so the user is not stuck staring at the logo.
  React.useEffect(() => {
    if (initialLoadDone) return;
    const timer = setTimeout(() => {
      if (!initialLoadDone) {
        hideNativeSplashOnce('safety_timeout_15s');
        setError(prev => prev ?? 'Page load is taking too long. Tap Retry.');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [initialLoadDone]);

  const handleWebMessage = async (event: WebViewMessageEvent) => {
    // Handle the first-paint sentinel BEFORE the host filter so a redirect
    // to a payment-gateway page can't accidentally suppress it (and because
    // the message carries no privileged data — it is a one-bit "I painted"
    // signal). This is what dismisses the native splash, replacing the
    // older `onLoadEnd` trigger which fired before first paint and left a
    // white flash for (paint - load) ms.
    try {
      const raw = event.nativeEvent.data;
      if (typeof raw === 'string' && raw.indexOf(FIRST_PAINT_SENTINEL) !== -1) {
        const parsed = JSON.parse(raw) as { type?: unknown };
        if (parsed && parsed.type === FIRST_PAINT_SENTINEL) {
          // #region agent log
          debugStartupLog(
            'WebViewScreen.tsx:firstPaintMessage',
            'FIRST_PAINT_MESSAGE',
            { initialLoadDone, alreadyHidden: nativeSplashHidden },
            'H2,H5',
            'post-fix',
          );
          // #endregion
          if (!initialLoadDone) {
            setInitialLoadDone(true);
            hideNativeSplashOnce('webview_first_paint');
          }
          return;
        }
      }
    } catch {
      // Fall through to the normal bridge-message path on parse errors.
    }

    // Drop bridge messages that did not originate from a first-party page so
    // a third-party gateway page rendered mid-checkout cannot exfiltrate auth
    // state or coerce in-app navigation.
    const messageOriginHost = safeHost(event.nativeEvent.url);
    if (!messageOriginHost || !allowedHostSet.has(messageOriginHost)) {
      analytics.track('webview_message_dropped_untrusted_origin', {
        host: messageOriginHost ?? 'unknown',
      });
      return;
    }

    const payload = parseBridgeMessage(event.nativeEvent.data);
    if (!payload) {
      analytics.track('webview_message_invalid_payload');
      return;
    }

    try {
      if (payload.type === 'auth') {
        await sessionStore.saveToken(payload.token);
        dispatch(setAuthenticated(true));
      } else if (payload.type === 'logout') {
        await sessionStore.clear();
        dispatch(setAuthenticated(false));
      } else if (payload.type === 'open_external') {
        if (isHttpsUrl(payload.url) && isAllowedUrl(payload.url)) {
          webViewRef.current?.injectJavaScript(
            `window.location.href = ${JSON.stringify(payload.url)}; true;`,
          );
          analytics.track('webview_forced_in_app_navigation', { target: payload.url });
        } else {
          const handed = await safeOpenExternalUrl(payload.url);
          analytics.track(
            handed
              ? 'webview_open_external_handoff'
              : 'webview_open_external_blocked_scheme',
            { target: payload.url },
          );
        }
      } else if (payload.type === 'open_settings') {
        analytics.track('webview_open_settings_requested');
        openSettings();
      }
    } catch (error) {
      crashReporter.capture(error, { source: 'WebViewScreen.handleWebMessage' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AppAsyncState
        isLoading={loading}
        errorMessage={error}
        overlay
        onRetry={() => {
          setError(null);
          setLoading(true);
          webViewRef.current?.reload();
        }}
      >
        <View />
      </AppAsyncState>
      <WebView
        style={{ flex: 1 }}
        ref={webViewRef}
        source={{ uri }}
        cacheEnabled
        domStorageEnabled
        javaScriptEnabled
        injectedJavaScript={FIRST_PAINT_INJECTION}
        setSupportMultipleWindows={false}
        originWhitelist={['https://*', 'about:blank', 'data:*', 'blob:*']}
        onLoadStart={() => {
          // #region agent log
          debugStartupLog(
            'WebViewScreen.tsx:onLoadStart',
            'WEBVIEW_LOAD_START',
            { initialLoadDone, uri },
            'H5',
          );
          // #endregion
          // Intentionally NO setLoading(true) here:
          //  • First load: native splash is still covering the screen.
          //  • Subsequent loads: keep the current page visible during the
          //    transition so we never flash an AppLoader over a working UI
          //    (a slow redirect would otherwise leave the spinner stuck).
          setError(null);
          analytics.track('webview_load_start', { path });
        }}
        onLoadProgress={event => {
          if (loading && event.nativeEvent.progress > 0.25) {
            setLoading(false);
          }
        }}
        onLoadEnd={() => {
          // #region agent log
          debugStartupLog(
            'WebViewScreen.tsx:onLoadEnd',
            'WEBVIEW_LOAD_END',
            { initialLoadDone, uri },
            'H2,H5',
          );
          // #endregion
          setLoading(false);
          // NOTE: Do NOT hide the native splash here. `onLoadEnd` fires when
          // the network load finishes but BEFORE the WebView has flushed its
          // first paint, which causes a white-flash between logo and content.
          // The splash is now hidden by the FIRST_PAINT_SENTINEL message
          // posted from `injectedJavaScript`. The `safety_timeout_15s`
          // useEffect above remains as a last-resort fallback for pages
          // where the injected JS cannot run (e.g. immediate native error).
          analytics.track('webview_load_end', { path });
        }}
        onNavigationStateChange={onNavChange}
        onMessage={handleWebMessage}
        onError={() => {
          // If the very first load fails, the native splash must still be
          // dropped so the user can see the error UI and retry.
          hideNativeSplashOnce('webview_onError');
          setError('Unable to load page. Please retry.');
        }}
        onShouldStartLoadWithRequest={request => {
          try {
            if (isInternalWebViewUrl(request.url)) {
              return true;
            }
            // Only HTTPS is allowed inside the WebView. Plain HTTP and any
            // exotic scheme (mailto:, tel:, intent:, market:, geo:, etc.) is
            // handed to the OS via a scheme allowlist so the WebView never
            // renders insecure content nor opens untrusted schemes.
            if (!isHttpsUrl(request.url)) {
              void safeOpenExternalUrl(request.url);
              return false;
            }
            const host = safeHost(request.url);
            if (!host) {
              analytics.track('webview_blocked_invalid_url');
              return false;
            }
            if (allowedHostSet.has(host)) {
              if (looksCheckoutRelated(request.url)) {
                const payment = detectPaymentRedirect(request.url);
                if (payment.isPaymentCallback) {
                  analytics.track('payment_redirect_started', {
                    status: payment.status,
                  });
                }
              }
              return true;
            }
            // Cross-domain HTTPS: only render in-WebView when it matches a
            // curated payment-gateway suffix (Tap, HyperPay, Tabby, Tamara,
            // 3DS directory servers). Anything else is handed to the OS
            // browser to close phishing / open-redirect surface area.
            if (isPaymentGatewayHost(host)) {
              analytics.track('webview_payment_gateway_in_app', { host });
              return true;
            }
            analytics.track('webview_external_handoff', { target: request.url });
            void safeOpenExternalUrl(request.url);
            return false;
          } catch {
            analytics.track('webview_blocked_invalid_url');
            return false;
          }
        }}
      />
    </SafeAreaView>
  );
}
