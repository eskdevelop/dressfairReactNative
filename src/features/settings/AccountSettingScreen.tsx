import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { fetchCustomerProfile } from '@features/account/customerApi';
import {
  loadCachedProfile,
  saveCachedProfile,
} from '@features/account/customerProfileCache';
import type { CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import type { CountryCode } from '@shared/config/env';
import { getEnvConfig, privacyPolicyUrl } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

const SETTINGS_GREEN = colors.success;
const STATUS_GREEN_BG = '#E8F5E9';
const BODY_GREY = '#616161';

function storefrontJoinedPath(locale: string, segment: string): string {
  const base = locale.replace(/\/$/, '');
  const seg = segment.startsWith('/') ? segment : `/${segment}`;
  return `${base}${seg}`;
}

function ThinDivider(): React.ReactElement {
  return <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />;
}

function ThickDivider(): React.ReactElement {
  return <View style={{ height: 4, backgroundColor: '#EEEEEE', width: '100%' }} />;
}

type OrangePillProps = {
  label: string;
  onPress: () => void;
};

function OrangePill({ label, onPress }: OrangePillProps): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.85}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: colors.brand,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>{label}</Text>
    </TouchableOpacity>
  );
}

type SettingRowProps = {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction: () => void;
};

function SettingRow({ title, subtitle, actionLabel, onAction }: SettingRowProps): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#000000' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ marginTop: 4, fontSize: 11, color: BODY_GREY, lineHeight: 15 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <OrangePill label={actionLabel} onPress={onAction} />
      </View>
    </View>
  );
}

type ThirdPartyRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
};

function ThirdPartyRow({ icon, title, status }: ThirdPartyRowProps): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={22} color="#111827" />
        <Text style={{ marginLeft: 12, flex: 1, fontSize: 12, fontWeight: '400', color: '#000000' }}>
          {title}
        </Text>
        <OrangePill
          label={status}
          onPress={() =>
            Alert.alert(
              title,
              'Social account linking is managed on dressfair.com. Sign in on the website to link or unlink.',
            )
          }
        />
      </View>
    </View>
  );
}

type ChevronRowProps = {
  title: string;
  danger?: boolean;
  onPress: () => void;
};

function ChevronRow({ title, danger, onPress }: ChevronRowProps): React.ReactElement {
  const accent = danger ? '#E53935' : '#000000';
  const chevron = danger ? '#E53935' : '#9CA3AF';
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
        <Text style={{ flex: 1, fontSize: 12, fontWeight: '400', color: accent }}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color={chevron} />
      </View>
    </TouchableOpacity>
  );
}

export function AccountSettingScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const cfg = getEnvConfig(country);
  const locale = cfg.webCategoriesPath.replace(/\/$/, '');

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const cached = await loadCachedProfile(country);
    if (cached) {
      setProfile(cached);
    }
    const showBlockingSpinner = !cached;
    if (showBlockingSpinner) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    try {
      const result = await fetchCustomerProfile();
      if (result.ok) {
        setProfile(result.profile);
        await saveCachedProfile(country, result.profile);
      }
    } catch (e) {
      crashReporter.capture(e, { source: 'AccountSettingScreen.load' });
    } finally {
      if (showBlockingSpinner) {
        setLoading(false);
      }
    }
  }, [country]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const accountPath = storefrontJoinedPath(locale, '/account');

  const goProfileEdit = (): void => {
    if (!profile) {
      Alert.alert('Profile', 'Unable to load your profile. Please try again.');
      return;
    }
    analytics.track('account_setting_profile_edit');
    navigation.navigate('ProfileEdit', { profile });
  };

  const openAccountWeb = (): void => {
    const url = `${cfg.webBaseUrl}${accountPath}`;
    analytics.track('account_setting_open_account_web', { url });
    Linking.openURL(url).catch(() =>
      Alert.alert('Unable to open link', 'Please check your connection and try again.'),
    );
  };

  const onPassword = (): void => {
    analytics.track('account_setting_password');
    Alert.alert(
      'Password',
      'Manage your password on dressfair.com from your account security settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open website', onPress: () => openAccountWeb() },
      ],
    );
  };

  const onPrivacyPolicy = (): void => {
    const url = privacyPolicyUrl(country);
    analytics.track('account_setting_privacy_policy', { url });
    Linking.openURL(url).catch(() =>
      Alert.alert('Unable to open link', 'Please check your connection and try again.'),
    );
  };

  const onDeleteAccount = (): void => {
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
            analytics.track('account_setting_open_account_delete', { url });
            Linking.openURL(url).catch(() =>
              Alert.alert(
                'Unable to open link',
                'Please check your internet connection and try again.',
              ),
            );
          },
        },
      ],
    );
  };

  const mobileHasValue = Boolean(profile?.mobile?.trim());

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
          <Ionicons name="chevron-back" size={22} color="#000000" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            marginRight: 22,
            fontSize: 15,
            fontWeight: '600',
            color: '#000000',
          }}
        >
          Account Setting
        </Text>
      </View>

      {loading && !profile ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
        >
          <View style={{ height: 8 }} />

          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: STATUS_GREEN_BG,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="shield-checkmark" size={20} color={SETTINGS_GREEN} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: SETTINGS_GREEN }}>
                  Your account is protected
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: BODY_GREY, lineHeight: 17 }}>
                  Your Dress Fair account is protected by advanced security. Keeping this information
                  up-to-date safeguards your account even more.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 8 }} />
          <ThinDivider />

          <SettingRow
            title="Mobile phone number"
            actionLabel={mobileHasValue ? 'Edit' : 'Add'}
            onAction={() => {
              analytics.track('account_setting_mobile');
              goProfileEdit();
            }}
          />
          <ThinDivider />

          <SettingRow
            title="Email"
            subtitle={profile?.email?.trim() ? profile.email.trim() : undefined}
            actionLabel="Edit"
            onAction={() => {
              analytics.track('account_setting_email');
              goProfileEdit();
            }}
          />
          <ThinDivider />

          <SettingRow title="Password" actionLabel="Add" onAction={onPassword} />
          <ThinDivider />

          <SettingRow
            title="Two-factor authentication: Off"
            subtitle="Protect your account by adding an extra layer of security."
            actionLabel="Turn on"
            onAction={() => {
              analytics.track('account_setting_2fa');
              Alert.alert(
                'Two-factor authentication',
                'Manage two-factor authentication on dressfair.com from your account security settings.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open website', onPress: () => openAccountWeb() },
                ],
              );
            }}
          />

          <ThickDivider />
          <View style={{ height: 10 }} />

          <Text style={{ paddingHorizontal: 16, fontSize: 13, fontWeight: '600', color: '#000000' }}>
            Third-party accounts
          </Text>
          <View style={{ height: 8 }} />

          <ThirdPartyRow icon="logo-google" title="Google" status="Linked" />
          <ThinDivider />
          <ThirdPartyRow icon="logo-facebook" title="Facebook" status="Link" />

          <View style={{ height: 4 }} />
          <ThickDivider />

          <ChevronRow
            title="Sign in activity"
            onPress={() => {
              analytics.track('account_setting_sign_in_activity');
              navigation.navigate('OrderHistory', undefined);
            }}
          />
          <ThinDivider />

          <ChevronRow title="Delete your Dress Fair account" danger onPress={onDeleteAccount} />
          <ThinDivider />

          <ChevronRow
            title="Privacy Policy"
            onPress={() => {
              analytics.track('account_setting_nav_privacy_policy');
              onPrivacyPolicy();
            }}
          />
          <ThinDivider />

          <ChevronRow
            title="Safety Center"
            onPress={() => {
              analytics.track('account_setting_nav_safety_center');
              navigation.navigate('SafetyCenter');
            }}
          />
          <ThinDivider />

          <ChevronRow
            title="Permission"
            onPress={() => {
              analytics.track('account_setting_nav_permissions');
              navigation.navigate('AppPermissions');
            }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
