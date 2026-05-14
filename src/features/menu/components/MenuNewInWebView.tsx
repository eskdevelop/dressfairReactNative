import React, { useCallback, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import WebView from 'react-native-webview';

import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { safeOpenExternalUrl } from '@shared/webview/externalLinks';
import { isPaymentGatewayHost } from '@shared/webview/paymentGateways';
import { isAllowedUrl } from '@shared/webview/urlPolicy';

const NEW_IN_WEB_HEIGHT = 480;

/** Match main WebView policy so www↔apex redirects and Cloudflare flows stay in-WebView */
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

type Props = {
  uri: string;
};

export function MenuNewInWebView({ uri }: Props): React.ReactElement {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const resolveNavigation = useCallback((requestUrl: string): boolean => {
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
        analytics.track('menu_new_in_blocked_invalid_url');
        return false;
      }
      // Critical: compare against allowed storefront hosts, not only the
      // first-request host — redirects (www ⇄ apex, regional hosts) otherwise
      // open externally and leave a blank embedded view.
      if (isAllowedUrl(requestUrl)) {
        return true;
      }
      if (isPaymentGatewayHost(host)) {
        analytics.track('menu_embed_payment_gateway_allowed', { host });
        return true;
      }
      analytics.track('menu_new_in_external_handoff', { url: requestUrl });
      void safeOpenExternalUrl(requestUrl);
      return false;
    } catch (e) {
      crashReporter.capture(e, { source: 'MenuNewInWebView.resolveNavigation' });
      return true;
    }
  }, []);

  const retry = (): void => {
    setLoadError(null);
    setRetryNonce(n => n + 1);
    analytics.track('menu_new_in_retry_pressed');
  };

  return (
    <View
      style={{
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
      }}
      /** Android clip + nested WebView can prevent compositing — avoid overflow:hidden on ancestor of WebView */
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontWeight: '700', color: colors.textPrimary }}>New in</Text>
        <TouchableOpacity
          onPress={() => {
            analytics.track('menu_new_in_open_full');
            try {
              const u = new URL(uri);
              openWebPath(`${u.pathname}${u.search}`);
            } catch {
              openWebPath('/');
            }
          }}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={{ color: colors.brand, fontWeight: '600' }}>Open full page</Text>
        </TouchableOpacity>
      </View>

      <View collapsable={false} style={{ height: NEW_IN_WEB_HEIGHT, backgroundColor: '#FFFFFF' }}>
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
            key={`${uri}#${retryNonce}`}
            source={{ uri }}
            style={{ flex: 1, backgroundColor: '#FFFFFF', opacity: 0.99 }}
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
            onShouldStartLoadWithRequest={req => resolveNavigation(req.url)}
            onError={(event: WebViewErrorEvent): void => {
              const msg = event.nativeEvent.description ?? 'Unable to load New in.';
              setLoadError(msg);
              crashReporter.capture(new Error(msg), { source: 'MenuNewInWebView.onError' });
            }}
          />
        )}
      </View>
    </View>
  );
}
