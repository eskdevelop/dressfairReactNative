import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { logoutEverywhere } from '@features/auth/authSync';
import { signOutGoogle } from '@features/auth/googleAuth';
import { applyCountryChange } from '@features/region/applyCountryChange';
import { openWebPath } from '@navigation/navigationRef';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import {
  COUNTRY_OPTIONS,
  getEnvConfig,
  type CountryCode,
} from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppLoadingOverlay } from '@shared/ui/AppLoadingOverlay';
import { FormSelectField } from '@shared/ui/FormSelectField';

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SETTINGS_GREEN = colors.success;
const BODY_GREY = '#616161';

const APP_SHARE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/dress-fair-shopping/id6764840409'
    : 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid';

function ThinDivider(): React.ReactElement {
  return <View style={{ height: 1, backgroundColor: colors.dividerLight }} />;
}

type GridTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function SettingsGridTile({ icon, label, onPress }: GridTileProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        margin: 4,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        alignItems: 'center',
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
      })}
    >
      <Ionicons name={icon} size={24} color={SETTINGS_GREEN} />
      <Text
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: '500',
          color: colors.textPrimary,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ChevronRowProps = {
  title: string;
  value?: string;
  onPress: () => void;
};

function SettingsChevronRow({ title, value, onPress }: ChevronRowProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
      })}
    >
      <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}>{title}</Text>
      {value ? (
        <Text style={{ fontSize: 14, color: colors.textMuted, marginRight: 6 }}>{value}</Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function MenuSettingsScreen(): React.ReactElement {
  const navigation = useNavigation<NavProps>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const storeCurrencyTitle = useAppSelector(s => s.app.storeCurrencyTitle);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const cfg = getEnvConfig(country);

  const [loggingOut, setLoggingOut] = useState(false);
  const [switchingCountry, setSwitchingCountry] = useState(false);

  const countrySelectOptions = useMemo(
    () =>
      COUNTRY_OPTIONS.map(o => ({
        value: o.code,
        label: `${o.flag}  ${o.label}`,
      })),
    [],
  );

  const currencyDisplay = useMemo(() => {
    if (storeCurrencyCode && storeCurrencyTitle) {
      return `${storeCurrencyCode} (${storeCurrencyTitle})`;
    }
    if (storeCurrencyCode) return storeCurrencyCode;
    return '—';
  }, [storeCurrencyCode, storeCurrencyTitle]);

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

  const onCountryChange = useCallback(
    (value: string) => {
      const next = value as CountryCode;
      if (next === country) return;

      Alert.alert(
        'Switch country & region',
        'Switching region will sign you out and refresh the storefront for the selected country.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setSwitchingCountry(true);
              void applyCountryChange({
                dispatch,
                nextCountry: next,
                reason: 'native_picker',
              }).finally(() => setSwitchingCountry(false));
            },
          },
        ],
      );
    },
    [country, dispatch],
  );

  const onPaymentMethods = useCallback(() => {
    analytics.track('settings_payment_methods_tap');
    Alert.alert(
      'Payment methods',
      'Manage saved payment methods on the DressFair website.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open website',
          onPress: () => {
            const locale = cfg.webCategoriesPath.replace(/\/$/, '');
            openWebPath(`${locale}/account`);
          },
        },
      ],
    );
  }, [cfg.webCategoriesPath]);

  const onLegalTerms = useCallback(() => {
    Alert.alert('Legal terms & policies', 'Choose a document to view.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Terms of Use',
        onPress: () => navigation.navigate('Terms'),
      },
      {
        text: 'Privacy Policy',
        onPress: () => navigation.navigate('Privacy'),
      },
      {
        text: 'Return Policy',
        onPress: () => navigation.navigate('ReturnPolicy'),
      },
    ]);
  }, [navigation]);

  const onShareApp = useCallback(async () => {
    analytics.track('settings_share_app_tap');
    try {
      await Share.share({
        message: `Shop fashion on DressFair — ${APP_SHARE_URL}`,
        url: APP_SHARE_URL,
        title: 'Dress Fair Shopping',
      });
    } catch {
      Alert.alert('Share', 'Could not open the share sheet.');
    }
  }, []);

  const openNotificationsTab = useCallback(() => {
    analytics.track('settings_notifications_tap');
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Notifications' },
      }),
    );
  }, [navigation]);

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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: SETTINGS_GREEN }}>
            Your account is protected
          </Text>
          <Text style={{ marginTop: 6, fontSize: 12, color: BODY_GREY, lineHeight: 17 }}>
            Dressfair protects your personal information and keeps it private, safe and secure.
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
          <View style={{ flexDirection: 'row' }}>
            <SettingsGridTile
              icon="shield-checkmark-outline"
              label="Account security"
              onPress={() => {
                analytics.track('settings_grid_account_security');
                navigation.navigate('AccountSetting');
              }}
            />
            <SettingsGridTile
              icon="lock-closed-outline"
              label="Privacy"
              onPress={() => {
                analytics.track('settings_grid_privacy');
                navigation.navigate('Privacy');
              }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <SettingsGridTile
              icon="key-outline"
              label="Permissions"
              onPress={() => {
                analytics.track('settings_grid_permissions');
                navigation.navigate('AppPermissions');
              }}
            />
            <SettingsGridTile
              icon="shield-outline"
              label="Safety center"
              onPress={() => {
                analytics.track('settings_grid_safety_center');
                navigation.navigate('SafetyCenter');
              }}
            />
          </View>
        </View>

        <View style={{ height: spacing.lg }} />
        <ThinDivider />

        <SettingsChevronRow title="Your payment methods" onPress={onPaymentMethods} />
        <ThinDivider />

        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
          <Text style={{ fontSize: 14, color: colors.textPrimary, marginBottom: 8 }}>
            Country & region
          </Text>
          <FormSelectField
            placeholder="Select country"
            selectedValue={country}
            options={countrySelectOptions}
            onValueChange={onCountryChange}
            disabled={switchingCountry}
          />
          {switchingCountry ? (
            <Text style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
              Updating region…
            </Text>
          ) : null}
        </View>
        <ThinDivider />

        <SettingsChevronRow
          title="Currency"
          value={currencyDisplay}
          onPress={() => {
            Alert.alert(
              'Currency',
              `Prices are shown in ${currencyDisplay} for your selected region.`,
            );
          }}
        />
        <ThinDivider />

        <SettingsChevronRow title="Notifications" onPress={openNotificationsTab} />
        <ThinDivider />

        <SettingsChevronRow
          title="About this app"
          onPress={() => {
            analytics.track('settings_about_tap');
            navigation.navigate('About');
          }}
        />
        <ThinDivider />

        <SettingsChevronRow title="Legal terms & policies" onPress={onLegalTerms} />
        <ThinDivider />

        <SettingsChevronRow title="Share this app" onPress={() => void onShareApp()} />
        <ThinDivider />

        <SettingsChevronRow
          title="Contact & support"
          onPress={() => {
            analytics.track('settings_contact_tap');
            navigation.navigate('Contact');
          }}
        />
        <ThinDivider />

        <SettingsChevronRow
          title="FAQ"
          onPress={() => {
            analytics.track('settings_faq_tap');
            navigation.navigate('Faq');
          }}
        />
      </ScrollView>

      <AppLoadingOverlay
        visible={loggingOut || switchingCountry}
        message={loggingOut ? 'Logging out…' : 'Updating region…'}
      />
    </SafeAreaView>
  );
}
