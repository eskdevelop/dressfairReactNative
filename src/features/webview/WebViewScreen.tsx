import React, { useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';

import { useAppDispatch } from '@app/hooks';
import { store } from '@app/store';
import { setAuthenticated } from '@app/storeSlices/appSlice';
import { sessionStore } from '@features/auth/sessionStore';
import { getEnvConfig } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppAsyncState } from '@shared/ui/AppAsyncState';
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

export function WebViewScreen({ path }: Props) {
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const isWebUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
  const isInternalWebViewUrl = (url: string) =>
    url.startsWith('about:blank') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('javascript:');

  React.useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (!initialLoadDone) {
        setLoading(false);
        setError(prev => prev ?? 'Page load is taking too long. Tap Retry.');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading, initialLoadDone]);

  const handleWebMessage = async (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        token?: string;
        url?: string;
      };
      if (payload.type === 'auth' && payload.token) {
        await sessionStore.saveToken(payload.token);
        dispatch(setAuthenticated(true));
      } else if (payload.type === 'logout') {
        await sessionStore.clear();
        dispatch(setAuthenticated(false));
      } else if (payload.type === 'open_external' && payload.url) {
        if (isWebUrl(payload.url)) {
          webViewRef.current?.injectJavaScript(
            `window.location.href = ${JSON.stringify(payload.url)}; true;`,
          );
          analytics.track('webview_forced_in_app_navigation', { target: payload.url });
        } else {
          await Linking.openURL(payload.url);
        }
      }
    } catch {
      // Ignore malformed bridge payloads to keep WebView stable.
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
        originWhitelist={['*']}
        onLoadStart={() => {
          if (!initialLoadDone) {
            setLoading(true);
          }
          setError(null);
          analytics.track('webview_load_start', { path });
        }}
        onLoadProgress={event => {
          if (!initialLoadDone && loading && event.nativeEvent.progress > 0.25) {
            setLoading(false);
          }
        }}
        onLoadEnd={() => {
          setLoading(false);
          setInitialLoadDone(true);
          analytics.track('webview_load_end', { path });
        }}
        onNavigationStateChange={onNavChange}
        onMessage={handleWebMessage}
        onError={() => setError('Unable to load page. Please retry.')}
        onShouldStartLoadWithRequest={request => {
          try {
            if (isInternalWebViewUrl(request.url)) {
              return true;
            }
            if (!isWebUrl(request.url)) {
              Linking.openURL(request.url);
              return false;
            }
            const host = new URL(request.url).host;
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
            analytics.track('webview_cross_domain_in_app', { target: request.url });
            return true;
          } catch {
            analytics.track('webview_blocked_invalid_url');
            return false;
          }
        }}
      />
    </SafeAreaView>
  );
}
