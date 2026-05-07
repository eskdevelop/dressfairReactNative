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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { logoutEverywhere } from '@features/auth/authSync';
import { registerForPushNotifications } from '@features/notifications/pushRegistration';
import { HealthDebugPanel } from '@features/settings/HealthDebugPanel';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { getEnvConfig } from '@shared/config/env';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type RowProps = {
  icon: IoniconsName;
  label: string;
  hint?: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

function Row({ icon, label, hint, onPress, destructive, testID }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.pill,
          backgroundColor: destructive ? '#FEE2E2' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? colors.danger : colors.textPrimary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: destructive ? colors.danger : colors.textPrimary,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
      }}
    >
      {title}
    </Text>
  );
}

// iOS link points to the storefront until the app is approved and we have a
// real Apple App ID; swap to https://apps.apple.com/app/id<NUMERIC_ID> after
// the first approval. Shipping the placeholder `id0000000000` would land the
// reviewer on a dead App Store page when they exercise Menu -> Share.
const APP_STORE_LINKS = {
  ios: 'https://www.dressfair.com',
  android: 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid',
};

export function MenuScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      // Cancelled / failure — Share.share rejects when the user dismisses
      // the sheet on some platforms. Nothing to do.
    }
  }, []);

  const openMail = useCallback(() => {
    const url = `mailto:${cfg.supportEmail}?subject=DressFair%20app%20support`;
    analytics.track('menu_open_mail', { email: cfg.supportEmail });
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'No mail app available',
        `Please email us at ${cfg.supportEmail}.`,
      );
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
      crashReporter.capture(error, { source: 'MenuScreen.enablePush' });
    });
  }, []);

  const onDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account',
      'This opens the DressFair account deletion page in your browser. Once submitted, your account and order history will be permanently removed (subject to legal retention requirements).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            const url = `${cfg.webBaseUrl}${cfg.accountDeletionPath}`;
            analytics.track('menu_open_account_delete', { url });
            Linking.openURL(url).catch(() => {
              Alert.alert(
                'Unable to open link',
                'Please check your internet connection and try again.',
              );
            });
          },
        },
      ],
    );
  }, [cfg.accountDeletionPath, cfg.webBaseUrl]);

  const onLogout = useCallback(() => {
    Alert.alert('Logout', 'Sign out from app and web session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          analytics.track('menu_logout_pressed');
          logoutEverywhere();
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.textPrimary,
            }}
          >
            Menu
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
            Manage your DressFair experience
          </Text>
        </View>

        <SectionHeader title="App" />
        <Row
          icon="notifications-circle-outline"
          label="Enable order updates"
          hint="Get notified about your orders, delivery, and offers"
          onPress={onEnablePush}
          testID="menu-enable-push"
        />
        <Row
          icon="share-social-outline"
          label="Share app"
          hint="Tell a friend about DressFair"
          onPress={onShareApp}
          testID="menu-share"
        />
        <Row
          icon="notifications-outline"
          label="Notification preferences"
          hint="Open system settings"
          onPress={openNotificationSettings}
          testID="menu-notifications"
        />

        <SectionHeader title="Support" />
        <Row
          icon="call-outline"
          label="Contact us"
          hint="Call, email, or WhatsApp DressFair"
          onPress={() => {
            analytics.track('menu_open_contact');
            navigation.navigate('Contact');
          }}
          testID="menu-contact"
        />
        <Row
          icon="help-circle-outline"
          label="FAQ"
          hint="Frequently asked questions"
          onPress={() => {
            analytics.track('menu_open_faq');
            navigation.navigate('Faq');
          }}
          testID="menu-faq"
        />
        <Row
          icon="mail-outline"
          label="Help and support"
          hint={cfg.supportEmail}
          onPress={openMail}
          testID="menu-help"
        />

        <SectionHeader title="Legal" />
        <Row
          icon="document-text-outline"
          label="Terms and conditions"
          onPress={() => {
            analytics.track('menu_open_terms');
            navigation.navigate('Terms');
          }}
          testID="menu-terms"
        />
        <Row
          icon="shield-checkmark-outline"
          label="Privacy policy"
          onPress={() => {
            analytics.track('menu_open_privacy');
            navigation.navigate('Privacy');
          }}
          testID="menu-privacy"
        />
        <Row
          icon="refresh-outline"
          label="Return & refund policy"
          onPress={() => {
            analytics.track('menu_open_return_policy');
            navigation.navigate('ReturnPolicy');
          }}
          testID="menu-return-policy"
        />
        <Row
          icon="information-circle-outline"
          label="About DressFair"
          onPress={() => {
            analytics.track('menu_open_about');
            navigation.navigate('About');
          }}
          testID="menu-about"
        />

        <SectionHeader title="Account" />
        <Row
          icon="bag-handle-outline"
          label="My orders"
          hint="View your order history"
          onPress={() => {
            analytics.track('menu_open_orders');
            navigation.navigate('OrderHistory');
          }}
          testID="menu-my-orders"
        />
        <Row
          icon="log-out-outline"
          label="Logout"
          onPress={onLogout}
          destructive
          testID="menu-logout"
        />
        <Row
          icon="trash-outline"
          label="Delete account"
          onPress={onDeleteAccount}
          destructive
          testID="menu-delete-account"
        />

        <SectionHeader title="About" />
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
          <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>
            {versionLabel}
          </Text>
        </View>

        {__DEV__ ? (
          <View style={{ padding: spacing.lg }}>
            <HealthDebugPanel />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
