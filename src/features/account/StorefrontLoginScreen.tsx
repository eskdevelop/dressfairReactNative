import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { store } from '@app/store';
import { colors } from '@app/theme/tokens';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

import { storefrontSignInEmbedPath } from './storefrontLoginPath';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StorefrontLoginWeb'>;

/**
 * Full storefront sign-in/register (WhatsApp OTP, Email, Google, etc.) in-app.
 * Keeps cookies on the marketing domain and forwards JWT to native via existing WebView auth bridge.
 */
export function StorefrontLoginScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);

  const openedAsGuestRef = useRef<boolean | null>(null);
  if (openedAsGuestRef.current === null) {
    openedAsGuestRef.current = !store.getState().app.isAuthenticated;
  }

  const path = storefrontSignInEmbedPath(country);

  useEffect(() => {
    analytics.track('account_storefront_login_open', { path });
  }, [path]);

  useEffect(() => {
    if (openedAsGuestRef.current !== true) return;
    if (!isAuthenticated) return;
    analytics.track('account_storefront_login_auth_sync');
    navigation.goBack();
  }, [isAuthenticated, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => {
            analytics.track('account_storefront_login_close');
            navigation.goBack();
          }}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel="Close sign in"
        >
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.toolbarTitle}>Sign In / Register</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ flex: 1 }}>
        <WebViewScreen
          key={`storefront-login-${country}-${storefrontSurfaceGeneration}`}
          path={path}
          openStorefrontLoginModal
          hideStorefrontMobileHeader={false}
          reportCartCountToNative
          applyTopSafeArea={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  toolbarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: 8,
  },
});
