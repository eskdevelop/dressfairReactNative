import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Application from 'expo-application';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { setCountry, setStoreCurrencySettings } from '@app/storeSlices/appSlice';
import { requestWebNav } from '@app/storeSlices/webNavSlice';
import { colors, spacing } from '@app/theme/tokens';
import { openStorefrontLogin } from '@features/account/requireStorefrontLogin';
import { HealthDebugPanel } from '@features/settings/HealthDebugPanel';
import { MenuRow, MenuSectionHeader } from '@features/menu/components/MenuRows';
import { logoutEverywhere } from '@features/auth/authSync';
import { registerForPushNotifications } from '@features/notifications/pushRegistration';
import { fetchStoreSettingsFromNetwork } from '@features/store/storeSettingsApi';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import { openWebPath } from '@navigation/navigationRef';
import { getEnvConfig, privacyPolicyUrl, type CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

const APP_STORE_LINKS = {
  ios: 'https://www.dressfair.com',
  android: 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid',
};

/** Flutter `settings_main_screen` green accent (Material green ~600). */
const SETTINGS_GREEN = colors.success;

const COUNTRY_UI: Record<CountryCode, { label: string; flag: string }> = {
  UAE: { label: 'United Arab Emirates', flag: '🇦🇪' },
  OMN: { label: 'Oman', flag: '🇴🇲' },
  KSA: { label: 'Saudi Arabia', flag: '🇸🇦' },
};

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function storefrontJoinedPath(locale: string, segment: string): string {
  const base = locale.replace(/\/$/, '');
  const seg = segment.startsWith('/') ? segment : `/${segment}`;
  return `${base}${seg}`;
}

/** Icons mirror Flutter/Temu-style tiles: shield+account, lock, shield+key, shield+check. */
type SettingsGridIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type GreenGridItemProps = {
  label: string;
  icon: SettingsGridIconName;
  onPress: () => void;
};

function GreenGridItem({ label, icon, onPress }: GreenGridItemProps): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.7}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingLeft: 6,
        paddingRight: 4,
        borderWidth: 0.5,
        borderColor: '#9CA3AF',
        borderRadius: 2,
        minHeight: 40,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 4 }}>
        <MaterialCommunityIcons name={icon} size={18} color={SETTINGS_GREEN} />
        <Text
          numberOfLines={1}
          style={{
            marginLeft: 6,
            fontSize: 12,
            fontWeight: '600',
            color: SETTINGS_GREEN,
            flexShrink: 1,
          }}
        >
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

type ListRowProps = {
  title: string;
  trailing?: string;
  onPress: () => void;
};

function FlutterSettingsListRow({ title, trailing, onPress }: ListRowProps): React.ReactElement {
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#000000',
            flex: 1,
            paddingRight: 8,
          }}
        >
          {title}
        </Text>
        {trailing ? (
          <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', fontWeight: '400' }}>{trailing}</Text>
        ) : (
          <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
        )}
      </TouchableOpacity>
      <View style={{ height: 1, backgroundColor: '#E5E7EB', marginLeft: 14 }} />
    </View>
  );
}

export function MenuSettingsScreen() {
  const navigation = useNavigation<NavProps>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const cfg = getEnvConfig(country);
  const locale = cfg.webCategoriesPath.replace(/\/$/, '');
  const [countryModal, setCountryModal] = useState(false);
  const [countryBusy, setCountryBusy] = useState(false);

  const countryLine = COUNTRY_UI[country];

  const versionLabel = useMemo(() => {
    const version =
      Application.nativeApplicationVersion ?? Application.applicationName ?? '';
    const build = Application.nativeBuildVersion ?? '';
    if (version && build) return `Version ${version} (${build})`;
    if (version) return `Version ${version}`;
    return 'Version unavailable';
  }, []);

  const applyCountry = useCallback(
    async (next: CountryCode) => {
      if (next === country) {
        setCountryModal(false);
        return;
      }
      setCountryBusy(true);
      analytics.track('menu_settings_country_change', { from: country, to: next });
      try {
        dispatch(setCountry(next));
        const res = await fetchStoreSettingsFromNetwork(next);
        if (res.ok && res.settings) {
          dispatch(setStoreCurrencySettings(res.settings));
        }
      } catch (e) {
        crashReporter.capture(e, { source: 'MenuSettingsScreen.applyCountry' });
        dispatch(setCountry(country));
        Alert.alert('Could not update region', 'Please try again.');
      } finally {
        setCountryBusy(false);
        setCountryModal(false);
      }
    },
    [country, dispatch],
  );

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

  const guardOrContinue = (): boolean => {
    if (isAuthenticated) return true;
    openStorefrontLogin(country as CountryCode);
    return false;
  };

  const onLogout = useCallback(() => {
    Alert.alert('Sign out', 'Sign out from app and web session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          analytics.track('menu_logout_pressed');
          void logoutEverywhere();
        },
      },
    ]);
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

  const onEnablePush = useCallback(() => {
    analytics.track('menu_enable_push_pressed');
    void registerForPushNotifications().catch(error => {
      crashReporter.capture(error, { source: 'MenuSettingsScreen.enablePush' });
    });
  }, []);

  const unreadCount = useAppSelector(state =>
    state.notifications.items.reduce((acc, item) => (item.read ? acc : acc + 1), 0),
  );
  const inboxHint =
    unreadCount > 0
      ? `${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`
      : 'Order updates and messages';

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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={{ paddingHorizontal: 14, paddingTop: spacing.sm }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: SETTINGS_GREEN }}>
            Your account is protected
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: '#6B7280', lineHeight: 17 }}>
            Dress Fair protects your personal information and keeps it private, safe and secure.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <GreenGridItem
              label="Account Security"
              icon="shield-account-outline"
              onPress={() => {
                analytics.track('menu_settings_account_security');
                if (!guardOrContinue()) return;
                navigation.navigate('AccountSetting');
              }}
            />
            <GreenGridItem
              label="Privacy"
              icon="lock-outline"
              onPress={() => {
                const url = privacyPolicyUrl(country as CountryCode);
                analytics.track('menu_settings_privacy', { url, via: 'linking' });
                // Avoid loading policy inside the Home WebView (was switching tabs + showing policy there).
                dispatch(requestWebNav(locale));
                Linking.openURL(url).catch(() => {
                  Alert.alert(
                    'Unable to open link',
                    'Please check your internet connection and try again.',
                  );
                });
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <GreenGridItem
              label="Permission"
              icon="shield-key-outline"
              onPress={() => {
                analytics.track('menu_settings_permission');
                navigation.navigate('AppPermissions');
              }}
            />
            <GreenGridItem
              label="Safety Center"
              icon="shield-check-outline"
              onPress={() => {
                analytics.track('menu_settings_safety_center');
                navigation.navigate('SafetyCenter');
              }}
            />
          </View>
        </View>

        <View
          style={{
            height: 2,
            marginTop: spacing.md,
            backgroundColor: 'rgba(0,0,0,0.08)',
            width: '100%',
          }}
        />

        <TouchableOpacity
          onPress={() => setCountryModal(true)}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 17 }}>{countryLine.flag}</Text>
            <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '500', color: '#000000' }}>
              {countryLine.label}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#6B7280" />
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginLeft: 14 }} />

        <FlutterSettingsListRow
          title="Your payment methods"
          onPress={() => {
            analytics.track('menu_settings_payment_methods');
            if (!guardOrContinue()) return;
            openWebPath(storefrontJoinedPath(locale, '/account'));
          }}
        />
        <FlutterSettingsListRow
          title="Language"
          trailing="English"
          onPress={() => {
            analytics.track('menu_settings_language');
            Alert.alert('Language', 'Additional languages will be available in a future update.');
          }}
        />
        <FlutterSettingsListRow
          title="Currency"
          trailing={storeCurrencyCode.trim().length > 0 ? storeCurrencyCode : '—'}
          onPress={() => {
            analytics.track('menu_settings_currency');
          }}
        />
        <FlutterSettingsListRow
          title="About this app"
          onPress={() => {
            analytics.track('menu_open_about');
            navigation.navigate('About');
          }}
        />
        <FlutterSettingsListRow
          title="Legal terms & policies"
          onPress={() => {
            analytics.track('menu_open_terms');
            navigation.navigate('Terms');
          }}
        />
        <FlutterSettingsListRow
          title="Share this app"
          onPress={() => void onShareApp()}
        />
        <FlutterSettingsListRow
          title="Delete Account"
          onPress={onDeleteAccount}
        />
        <FlutterSettingsListRow
          title="Sign out"
          onPress={isAuthenticated ? onLogout : () => openStorefrontLogin(country)}
        />

        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>App version</Text>
          <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>{versionLabel}</Text>
        </View>

        <MenuSectionHeader title="More" />
        <MenuRow
          icon="heart-outline"
          label="Wishlist"
          hint="Saved items"
          onPress={() => navigation.navigate('Wishlist')}
          testID="menu-wishlist"
        />
        <MenuRow
          icon="bag-handle-outline"
          label="Order history"
          hint="See all orders"
          onPress={() => {
            if (!guardOrContinue()) return;
            navigation.navigate('OrderHistory', undefined);
          }}
          testID="menu-orders-history"
        />
        <MenuRow
          icon="notifications-outline"
          label="Inbox"
          hint={isAuthenticated ? inboxHint : 'Sign in required'}
          onPress={() => {
            if (!guardOrContinue()) return;
            navigation.navigate('Notifications');
          }}
          testID="menu-inbox"
        />
        <MenuRow
          icon="notifications-circle-outline"
          label="Enable order updates"
          hint="Get notified about your orders"
          onPress={onEnablePush}
        />
        <MenuRow
          icon="help-circle-outline"
          label="FAQ"
          onPress={() => navigation.navigate('Faq')}
        />
        <MenuRow
          icon="mail-outline"
          label="Contact us"
          hint={cfg.supportEmail}
          onPress={() =>
            Linking.openURL(`mailto:${cfg.supportEmail}?subject=DressFair%20app%20support`).catch(
              () => Alert.alert('No mail app', cfg.supportEmail),
            )
          }
        />

        {__DEV__ ? (
          <>
            <MenuSectionHeader title="Developer" />
            <View style={{ paddingHorizontal: spacing.md }}>
              <HealthDebugPanel />
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal transparent visible={countryModal} animationType="fade" onRequestClose={() => setCountryModal(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 }}
          onPress={() => !countryBusy && setCountryModal(false)}
        >
          <Pressable
            style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}
            onPress={e => e.stopPropagation()}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 }}>
              Country / Region
            </Text>
            {countryBusy ? (
              <ActivityIndicator style={{ padding: 24 }} />
            ) : (
              (['UAE', 'OMN', 'KSA'] as CountryCode[]).map(code => (
                <TouchableOpacity
                  key={code}
                  onPress={() => void applyCountry(code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{COUNTRY_UI[code].flag}</Text>
                  <Text style={{ marginLeft: 10, fontSize: 15, flex: 1 }}>{COUNTRY_UI[code].label}</Text>
                  {country === code ? (
                    <Ionicons name="checkmark-circle" size={22} color={SETTINGS_GREEN} />
                  ) : null}
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              disabled={countryBusy}
              onPress={() => setCountryModal(false)}
              style={{ alignItems: 'center', paddingTop: 16 }}
            >
              <Text style={{ fontSize: 16, color: colors.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
