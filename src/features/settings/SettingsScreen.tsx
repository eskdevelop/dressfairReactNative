import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { logoutEverywhere } from '@features/auth/authSync';
import { getEnvConfig } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { HealthDebugPanel } from './HealthDebugPanel';

type RowProps = {
  label: string;
  hint?: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

function SettingsRow({ label, hint, onPress, destructive, testID }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={{
        borderRadius: radii.md,
        borderColor: colors.border,
        borderWidth: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }}
    >
      <Text
        style={{
          color: destructive ? colors.danger : colors.textPrimary,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>{hint}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const country = useAppSelector(state => state.app.country);
  const cfg = getEnvConfig(country);

  const openWeb = (path: string, event: string) => {
    const url = `${cfg.webBaseUrl}${path}`;
    analytics.track(event, { url });
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Unable to open link',
        'Please check your internet connection and try again.',
      );
    });
  };

  const openMail = () => {
    const url = `mailto:${cfg.supportEmail}?subject=DressFair%20app%20support`;
    analytics.track('settings_open_mail', { email: cfg.supportEmail });
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'No mail app available',
        `Please email us at ${cfg.supportEmail}.`,
      );
    });
  };

  const openNotificationSettings = () => {
    analytics.track('settings_open_notification_preferences');
    Linking.openSettings().catch(() => {
      Alert.alert(
        'Unable to open settings',
        Platform.OS === 'android'
          ? 'Open the system Settings app and find DressFair under Apps to manage notifications.'
          : 'Open the system Settings app and find DressFair to manage notifications.',
      );
    });
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This opens the DressFair account deletion page in your browser. Once submitted, your account and order history will be permanently removed (subject to legal retention requirements).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => openWeb(cfg.accountDeletionPath, 'settings_open_account_delete'),
        },
      ],
    );
  };

  const onLogout = () => {
    Alert.alert('Logout', 'Sign out from app and web session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logoutEverywhere();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          marginBottom: spacing.md,
          color: colors.textPrimary,
        }}
      >
        Settings
      </Text>

      <View style={{ gap: spacing.sm }}>
        <SettingsRow
          label="Notification preferences"
          hint="Manage push notifications in system settings"
          onPress={openNotificationSettings}
          testID="settings-notifications"
        />
        <SettingsRow
          label="Help and support"
          hint={cfg.supportEmail}
          onPress={openMail}
          testID="settings-help"
        />
        <SettingsRow
          label="Privacy policy"
          onPress={() => openWeb(cfg.privacyPolicyPath, 'settings_open_privacy')}
          testID="settings-privacy"
        />
        <SettingsRow
          label="Terms and conditions"
          onPress={() => openWeb(cfg.termsPath, 'settings_open_terms')}
          testID="settings-terms"
        />
        <SettingsRow
          label="Delete account"
          onPress={onDeleteAccount}
          destructive
          testID="settings-delete-account"
        />
        <SettingsRow
          label="Logout"
          onPress={onLogout}
          destructive
          testID="settings-logout"
        />
        <HealthDebugPanel />
      </View>
    </ScrollView>
  );
}
