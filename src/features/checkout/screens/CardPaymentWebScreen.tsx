import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors } from '@app/theme/tokens';
import { removeSelectedCartLinesAfterOrder } from '@features/cart/cartActions';
import { selectCartItems } from '@features/cart/cartSlice';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { safeOpenExternalUrl } from '@shared/webview/externalLinks';
import type { RootStackParamList } from '@navigation/types';

import { classifyStripeReturn, isStripeHost } from '../stripeReturnPolicy';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CardPaymentWeb'>;
type Rt = RouteProp<RootStackParamList, 'CardPaymentWeb'>;

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

export function CardPaymentWebScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const { checkoutUrl, orderId } = useRoute<Rt>().params;
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const items = useAppSelector(selectCartItems);
  const [loading, setLoading] = useState(true);
  // Guards the one-shot transition so duplicate nav events don't double-fire.
  const resolvedRef = useRef(false);

  const onSuccess = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    analytics.track('checkout_card_payment_success', { order_id: orderId });
    void removeSelectedCartLinesAfterOrder(dispatch, country, items);
    navigation.replace('OrderSuccess', { orderId });
  }, [country, dispatch, items, navigation, orderId]);

  const onCancel = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    analytics.track('checkout_card_payment_cancel', { order_id: orderId });
    navigation.goBack();
  }, [navigation, orderId]);

  // Classify top-level navigations: stay on Stripe, or hand back to native on
  // the configured success_url / cancel_url redirect.
  const handleNavigation = useCallback(
    (url: string) => {
      // TODO(card-discovery): TEMPORARY Phase 0/2 probe — capture the exact
      // Stripe success_url / cancel_url so detection can be hardened. Remove
      // once verified on-device.
      // eslint-disable-next-line no-console
      console.log('[card-discovery] stripe nav url=%s kind=%s', url, classifyStripeReturn(url));
      const kind = classifyStripeReturn(url);
      if (kind === 'success') onSuccess();
      else if (kind === 'cancel') onCancel();
    },
    [onCancel, onSuccess],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}
      >
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#111' }}>
          Secure payment
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: checkoutUrl }}
          originWhitelist={['https://*']}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(nav: WebViewNavigation) => handleNavigation(nav.url)}
          onShouldStartLoadWithRequest={request => {
            const host = hostOf(request.url);
            // TODO(card-discovery): TEMPORARY probe — capture the exact
            // success_url / cancel_url Stripe redirects to. Remove once the
            // success path is verified on-device with a real card.
            // eslint-disable-next-line no-console
            console.log(
              '[card-discovery] req url=%s kind=%s',
              request.url,
              classifyStripeReturn(request.url),
            );
            // Keep Stripe (and its asset/3DS subdomains) in-app.
            if (host && isStripeHost(host)) return true;
            // The success/cancel redirect goes to a non-Stripe host: intercept,
            // route natively, and don't actually load the storefront page here.
            const kind = classifyStripeReturn(request.url);
            if (kind === 'success') {
              onSuccess();
              return false;
            }
            if (kind === 'cancel') {
              onCancel();
              return false;
            }
            // Unknown cross-origin (e.g. bank 3DS we don't recognise): keep it
            // in-app over HTTPS, otherwise hand to the OS.
            if (request.url.startsWith('https://')) return true;
            void safeOpenExternalUrl(request.url);
            return false;
          }}
        />
        {loading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}
          >
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
