import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import { storefrontCountryRegionLanguageUrl, type CountryCode } from '@shared/config/env';

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function MenuSettingsScreen() {
  const navigation = useNavigation<NavProps>();
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const settingsWebUri = storefrontCountryRegionLanguageUrl(country as CountryCode);

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
            marginRight: 24,
            fontSize: 17,
            fontWeight: '700',
            color: '#000000',
          }}
        >
          Settings
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <WebViewScreen
          key={`menu-settings-prefs-${country}-${storefrontSurfaceGeneration}`}
          path={settingsWebUri}
          applyWebNavFromStore={false}
          hideStorefrontMobileHeader
          hideEmbeddedSiteAppBar
          applyTopSafeArea={false}
          syncAppCountryFromStorefrontLocale
        />
      </View>
    </SafeAreaView>
  );
}
