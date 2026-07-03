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
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { openStorefrontLogin } from '@features/account/requireStorefrontLogin';
import { logoutEverywhere } from '@features/auth/authSync';
import { signOutGoogle } from '@features/auth/googleAuth';
import { applyCountryChange } from '@features/region/applyCountryChange';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import {
  COUNTRY_OPTIONS,
  type CountryCode,
} from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppLoadingOverlay } from '@shared/ui/AppLoadingOverlay';
import { FormSelectField } from '@shared/ui/FormSelectField';

type NavProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TEMU_GREEN = '#16A34A';
const BODY_GREY = '#6B6B6B';
const ROW_CHEVRON = '#9CA3AF';
const VALUE_GREY = '#888888';
const DIVIDER = '#F0F0F0';

const APP_SHARE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/dress-fair-shopping/id6764840409'
    : 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid';

function ThinDivider(): React.ReactElement {
  return <View style={{ height: 1, backgroundColor: DIVIDER }} />;
}

function SectionGap(): React.ReactElement {
  return <View style={{ height: 8, backgroundColor: '#F2F2F2' }} />;
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
        minHeight: 50,
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
      })}
    >
      <Text style={{ flex: 1, fontSize: 14, color: '#000000' }}>{title}</Text>
      {value ? (
        <Text style={{ fontSize: 13, color: VALUE_GREY, marginRight: 4 }}>{value}</Text>
      ) : null}
      <Ionicons name="chevron-forward" size={17} color={ROW_CHEVRON} />
    </Pressable>
  );
}

type PlainRowProps = {
  title: string;
  onPress: () => void;
};

function SettingsPlainRow({ title, onPress }: PlainRowProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
      })}
    >
      <Text style={{ fontSize: 14, color: '#000000' }}>{title}</Text>
    </Pressable>
  );
}

export function MenuSettingsScreen(): React.ReactElement {
  const navigation = useNavigation<NavProps>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);

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

  const currencyShort = storeCurrencyCode?.trim() || '—';

  const countryValueDisplay = useMemo(() => {
    const match = COUNTRY_OPTIONS.find(o => o.code === country);
    if (!match) return country;
    return `${match.code} ${match.flag}`;
  }, [country]);

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
      'Sign out',
      'This clears your session, cached profile and login data on this device. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  }, [performLogout]);

  const onSwitchAccounts = useCallback(() => {
    analytics.track('settings_switch_accounts_tap');
    if (!isAuthenticated) {
      openStorefrontLogin(country);
      return;
    }
    Alert.alert('Switch accounts', 'Sign out and sign in with another account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: () => {
          setLoggingOut(true);
          void (async () => {
            try {
              await signOutGoogle();
              await logoutEverywhere();
              openStorefrontLogin(country);
            } finally {
              setLoggingOut(false);
            }
          })();
        },
      },
    ]);
  }, [country, isAuthenticated]);

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
    navigation.navigate('NotificationsInbox');
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
          borderBottomColor: DIVIDER,
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: TEMU_GREEN }}>
            Your account is protected
          </Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: BODY_GREY, lineHeight: 18 }}>
            Dressfair protects your personal information and keeps it private, safe and secure.
          </Text>
        </View>

        <View style={{ height: spacing.md }} />
        <SectionGap />

        <SettingsChevronRow
          title="Privacy"
          onPress={() => {
            analytics.track('settings_privacy_tap');
            navigation.navigate('Privacy');
          }}
        />

        <SectionGap />

        <FormSelectField
          placeholder="Select country"
          selectedValue={country}
          options={countrySelectOptions}
          onValueChange={onCountryChange}
          disabled={switchingCountry}
          renderTrigger={({ open }) => (
            <SettingsChevronRow
              title="Country & region"
              value={switchingCountry ? 'Updating…' : countryValueDisplay}
              onPress={open}
            />
          )}
        />
        <ThinDivider />

        <SettingsChevronRow
          title="Currency"
          value={currencyShort}
          onPress={() => {
            Alert.alert(
              'Currency',
              `Prices are shown in ${currencyShort} for your selected region.`,
            );
          }}
        />

        <SectionGap />

        <SettingsChevronRow title="Notifications" onPress={openNotificationsTab} />

        <SectionGap />

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

        <SectionGap />

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

        <SectionGap />

        <SettingsChevronRow title="Switch accounts" onPress={onSwitchAccounts} />
        {isAuthenticated ? (
          <>
            <ThinDivider />
            <SettingsPlainRow title="Sign out" onPress={confirmLogout} />
          </>
        ) : null}
      </ScrollView>

      <AppLoadingOverlay
        visible={loggingOut || switchingCountry}
        message={loggingOut ? 'Signing out…' : 'Updating region…'}
      />
    </SafeAreaView>
  );
}
