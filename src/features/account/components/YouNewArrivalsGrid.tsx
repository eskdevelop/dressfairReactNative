import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import WebView from 'react-native-webview';

import { colors, spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { safeOpenExternalUrl } from '@shared/webview/externalLinks';
import { isPaymentGatewayHost } from '@shared/webview/paymentGateways';
import { isAllowedUrl } from '@shared/webview/urlPolicy';

import { YOU_NEW_IN_CHROME_HIDE_INJECTION } from '../youNewInChromeHideInjection';

/** Match embedded Menu New-In WebView policy (www⇄apex, allowed hosts). */
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

function resolveEmbeddedStorefrontNavigation(requestUrl: string): boolean {
  try {
    if (isInternalWebViewUrl(requestUrl)) {
      return true;
    }
    if (!isHttpsUrl(requestUrl)) {
      void safeOpenExternalUrl(requestUrl);
      return false;
    }
    const host = safeHost(requestUrl);
    if (!host) {
      analytics.track('account_you_new_in_blocked_invalid_url');
      return false;
    }
    if (isAllowedUrl(requestUrl)) {
      return true;
    }
    if (isPaymentGatewayHost(host)) {
      analytics.track('account_you_embed_payment_gateway_allowed', { host });
      return true;
    }
    analytics.track('account_you_new_in_external_handoff', { url: requestUrl });
    void safeOpenExternalUrl(requestUrl);
    return false;
  } catch (e) {
    crashReporter.capture(e, { source: 'YouNewArrivalsGrid.resolveNavigation' });
    return true;
  }
}

type Props = {
  /** Absolute storefront URL, typically `webBaseUrl` + `webNewInPath`. */
  newInAbsoluteUri: string;
};

/** Regional New-In PLP embedded for the You tab — WebView shows grid only (injected chrome hide). */
export function YouNewArrivalsGrid({ newInAbsoluteUri }: Props): React.ReactElement {
  const webRef = useRef<WebView>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const { height: winH } = useWindowDimensions();

  const slabHeight = useMemo(() => {
    const h = Math.round(winH * 0.56);
    return Math.min(Math.max(h, 480), 720);
  }, [winH]);

  const retry = (): void => {
    setLoadError(null);
    setRetryNonce(n => n + 1);
    analytics.track('account_you_new_in_retry_pressed');
  };

  /** Re-run hide after Next.js hydrates (observer in injection only runs on first load). */
  useEffect(() => {
    if (loadError) return;
    let n = 0;
    const iv = setInterval(() => {
      webRef.current?.injectJavaScript(YOU_NEW_IN_CHROME_HIDE_INJECTION);
      n += 1;
      if (n >= 16) clearInterval(iv);
    }, 1800);
    return () => clearInterval(iv);
  }, [loadError, retryNonce, newInAbsoluteUri]);

  return (
    <View style={{ paddingTop: 8, paddingHorizontal: spacing.sm }}>
      <View collapsable={false} style={{ height: slabHeight, backgroundColor: '#FFFFFF' }}>
        {loadError ? (
          <View
            style={{
              flex: 1,
              padding: spacing.md,
              justifyContent: 'center',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{loadError}</Text>
            <TouchableOpacity onPress={retry} accessibilityRole="button">
              <Text style={{ color: colors.brand, fontWeight: '600' }}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webRef}
            key={`${newInAbsoluteUri}#${String(retryNonce)}`}
            source={{ uri: newInAbsoluteUri }}
            style={{
              width: '100%',
              height: slabHeight,
              backgroundColor: '#FFFFFF',
              opacity: 0.99,
            }}
            injectedJavaScript={YOU_NEW_IN_CHROME_HIDE_INJECTION}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            sharedCookiesEnabled={Platform.OS === 'ios'}
            thirdPartyCookiesEnabled
            nestedScrollEnabled={Platform.OS === 'android'}
            setSupportMultipleWindows={false}
            originWhitelist={['https://*', 'about:*', 'data:*', 'blob:*']}
            androidLayerType="hardware"
            mixedContentMode="compatibility"
            mediaPlaybackRequiresUserAction={Platform.OS !== 'android'}
            onShouldStartLoadWithRequest={req => resolveEmbeddedStorefrontNavigation(req.url)}
            onLoadEnd={() => {
              webRef.current?.injectJavaScript(YOU_NEW_IN_CHROME_HIDE_INJECTION);
            }}
            onError={(event: WebViewErrorEvent): void => {
              const msg = event.nativeEvent.description ?? 'Unable to load New in.';
              setLoadError(msg);
              crashReporter.capture(new Error(msg), { source: 'YouNewArrivalsGrid.onError' });
            }}
          />
        )}
      </View>
    </View>
  );
}
