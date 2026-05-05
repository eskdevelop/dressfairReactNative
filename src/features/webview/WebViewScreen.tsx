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

// Hide the native splash exactly once across the app's lifetime; remounts of
// WebViewScreen (e.g. tab switches) must not retrigger preventAutoHide.
let nativeSplashHidden = false;
const hideNativeSplashOnce = () => {
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
        hideNativeSplashOnce();
        setError(prev => prev ?? 'Page load is taking too long. Tap Retry.');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [initialLoadDone]);

  const handleWebMessage = async (event: WebViewMessageEvent) => {
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
        setSupportMultipleWindows={false}
        originWhitelist={['https://*', 'about:blank', 'data:*', 'blob:*']}
        onLoadStart={() => {
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
          setLoading(false);
          if (!initialLoadDone) {
            setInitialLoadDone(true);
            hideNativeSplashOnce();
          }
          analytics.track('webview_load_end', { path });
        }}
        onNavigationStateChange={onNavChange}
        onMessage={handleWebMessage}
        onError={() => {
          // If the very first load fails, the native splash must still be
          // dropped so the user can see the error UI and retry.
          hideNativeSplashOnce();
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
