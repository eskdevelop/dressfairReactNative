import React, { useCallback, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { logoutEverywhere } from '@features/auth/authSync';
import { signOutGoogle } from '@features/auth/googleAuth';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import { storefrontCountryRegionLanguageUrl, type CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppLoadingOverlay } from '@shared/ui/AppLoadingOverlay';

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function MenuSettingsScreen() {
  const navigation = useNavigation<NavProps>();
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const settingsWebUri = storefrontCountryRegionLanguageUrl(country as CountryCode);
  const [loggingOut, setLoggingOut] = useState(false);

  const performLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      analytics.track('settings_logout_tap');
      await signOutGoogle();
      await logoutEverywhere();
      navigation.goBack();
    } finally {
      setLoggingOut(false);
    }
  }, [navigation]);

  const confirmLogout = useCallback(() => {
    Alert.alert(
      'Log out',
      'This clears your session, cached profile and login data on this device. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  }, [performLogout]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '700',
            color: '#000000',
          }}
        >
          Settings
        </Text>
        {isAuthenticated ? (
          <TouchableOpacity
            onPress={confirmLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            hitSlop={12}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 14,
                fontWeight: '600',
                color: '#DC2626',
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <WebViewScreen
          key={`menu-settings-prefs-${country}-${storefrontSurfaceGeneration}`}
          path={settingsWebUri}
          applyWebNavFromStore={false}
          hideStorefrontMobileHeader
          hideEmbeddedSiteAppBar
          disableStorefrontAuthBridge
          applyTopSafeArea={false}
          syncAppCountryFromStorefrontLocale
        />
      </View>

      <AppLoadingOverlay visible={loggingOut} message="Logging out…" />
    </SafeAreaView>
  );
}
