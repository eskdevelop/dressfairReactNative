import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Network from 'expo-network';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { sessionStore } from '@features/auth/sessionStore';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';

/** Temporary WebView smoke URL — remove or relocate once layout is validated. */
const WEBVIEW_TEST_COUNTRY_REGION_LANGUAGE_URL =
  'https://dressfair.com/ae/user/country-region-language';

export function HealthDebugPanel() {
  const app = useAppSelector(state => state.app);
  const [networkType, setNetworkType] = React.useState<string>('unknown');
  const [hasCustomerJwt, setHasCustomerJwt] = React.useState<boolean>(false);
  const [hasPushToken, setHasPushToken] = React.useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      const load = async () => {
        const [network, customerJwt, pushToken] = await Promise.all([
          Network.getNetworkStateAsync(),
          sessionStore.getToken(),
          sessionStore.getPushToken(),
        ]);
        if (!mounted) return;
        setNetworkType(network.type ?? 'unknown');
        setHasCustomerJwt(Boolean(customerJwt));
        setHasPushToken(Boolean(pushToken));
      };
      void load();
      return () => {
        mounted = false;
      };
    }, []),
  );

  const item = (label: string, value: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{value}</Text>
    </View>
  );

  return (
    <View
      style={{
        marginTop: spacing.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        gap: spacing.sm,
      }}
    >
      <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Health Debug</Text>
      {item('Country', app.country)}
      {item('Offline mode', app.isOffline ? 'Yes' : 'No')}
      {item('Bootstrapped', app.isBootstrapped ? 'Yes' : 'No')}
      {item('Authenticated', app.isAuthenticated ? 'Yes' : 'No')}
      {item('Network type', networkType)}
      {item(
        'Customer JWT (Bearer)',
        hasCustomerJwt ? 'Present — native APIs use Authorization: Bearer …' : 'Missing',
      )}
      {item('Push token', hasPushToken ? 'Present' : 'Missing')}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open country region language page in Home WebView"
        onPress={() => openWebPath(WEBVIEW_TEST_COUNTRY_REGION_LANGUAGE_URL)}
        style={{
          marginTop: spacing.md,
          paddingVertical: 12,
          paddingHorizontal: spacing.sm,
          borderRadius: radii.md,
          backgroundColor: colors.brand,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>
          WebView test: country / region / language
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.92)',
            textAlign: 'center',
            fontSize: 10,
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {WEBVIEW_TEST_COUNTRY_REGION_LANGUAGE_URL}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
