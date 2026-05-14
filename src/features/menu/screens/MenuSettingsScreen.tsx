import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import { registerForPushNotifications } from '@features/notifications/pushRegistration';
import { MenuRow, MenuSectionHeader } from '@features/menu/components/MenuRows';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { getEnvConfig } from '@shared/config/env';
import { useAppSelector } from '@app/hooks';

const APP_STORE_LINKS = {
  ios: 'https://www.dressfair.com',
  android: 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid',
};

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function MenuSettingsScreen() {
  const navigation = useNavigation<NavProps>();
  const country = useAppSelector(state => state.app.country);
  const cfg = getEnvConfig(country);

  const versionLabel = useMemo(() => {
    const version =
      Application.nativeApplicationVersion ?? Application.applicationName ?? '';
    const build = Application.nativeBuildVersion ?? '';
    if (version && build) return `Version ${version} (${build})`;
    if (version) return `Version ${version}`;
    return 'Version unavailable';
  }, []);

  const onShareApp = useCallback(async () => {
    analytics.track('menu_share_app_pressed');
    const url = Platform.OS === 'ios' ? APP_STORE_LINKS.ios : APP_STORE_LINKS.android;
    try {
      await Share.share({
        message: `Shop the latest looks on DressFair: ${url}`,
        url,
        title: 'DressFair',
      });
    } catch {
      // user cancelled
    }
  }, []);

  const openMail = useCallback(() => {
    const url = `mailto:${cfg.supportEmail}?subject=DressFair%20app%20support`;
    analytics.track('menu_open_mail', { email: cfg.supportEmail });
    Linking.openURL(url).catch(() => {
      Alert.alert('No mail app available', `Please email us at ${cfg.supportEmail}.`);
    });
  }, [cfg.supportEmail]);

  const openNotificationSettings = useCallback(() => {
    analytics.track('menu_open_notification_preferences');
    Linking.openSettings().catch(() => {
      Alert.alert(
        'Unable to open settings',
        Platform.OS === 'android'
          ? 'Open the system Settings app and find DressFair under Apps to manage notifications.'
          : 'Open the system Settings app and find DressFair to manage notifications.',
      );
    });
  }, []);

  const onEnablePush = useCallback(() => {
    analytics.track('menu_enable_push_pressed');
    void registerForPushNotifications().catch(error => {
      crashReporter.capture(error, { source: 'MenuSettingsScreen.enablePush' });
    });
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
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
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            marginRight: 24,
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <MenuSectionHeader title="App" />
        <MenuRow
          icon="notifications-circle-outline"
          label="Enable order updates"
          hint="Get notified about your orders, delivery, and offers"
          onPress={onEnablePush}
          testID="menu-enable-push"
        />
        <MenuRow
          icon="share-social-outline"
          label="Share app"
          hint="Tell a friend about DressFair"
          onPress={() => void onShareApp()}
          testID="menu-share"
        />
        <MenuRow
          icon="notifications-outline"
          label="Notification preferences"
          hint="Open system settings"
          onPress={openNotificationSettings}
          testID="menu-notifications"
        />

        <MenuSectionHeader title="Support" />
        <MenuRow
          icon="call-outline"
          label="Contact us"
          hint="Call, email, or WhatsApp DressFair"
          onPress={() => {
            analytics.track('menu_open_contact');
            navigation.navigate('Contact');
          }}
          testID="menu-contact"
        />
        <MenuRow
          icon="help-circle-outline"
          label="FAQ"
          hint="Frequently asked questions"
          onPress={() => {
            analytics.track('menu_open_faq');
            navigation.navigate('Faq');
          }}
          testID="menu-faq"
        />
        <MenuRow
          icon="mail-outline"
          label="Help and support"
          hint={cfg.supportEmail}
          onPress={openMail}
          testID="menu-help"
        />

        <MenuSectionHeader title="Legal" />
        <MenuRow
          icon="document-text-outline"
          label="Terms and conditions"
          onPress={() => {
            analytics.track('menu_open_terms');
            navigation.navigate('Terms');
          }}
          testID="menu-terms"
        />
        <MenuRow
          icon="shield-checkmark-outline"
          label="Privacy policy"
          onPress={() => {
            analytics.track('menu_open_privacy');
            navigation.navigate('Privacy');
          }}
          testID="menu-privacy"
        />
        <MenuRow
          icon="refresh-outline"
          label="Return & refund policy"
          onPress={() => {
            analytics.track('menu_open_return_policy');
            navigation.navigate('ReturnPolicy');
          }}
          testID="menu-return-policy"
        />
        <MenuRow
          icon="information-circle-outline"
          label="About DressFair"
          onPress={() => {
            analytics.track('menu_open_about');
            navigation.navigate('About');
          }}
          testID="menu-about"
        />

        <MenuSectionHeader title="About this app" />
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
            App version
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>{versionLabel}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
