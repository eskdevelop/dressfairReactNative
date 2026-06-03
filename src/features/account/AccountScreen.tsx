import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { fetchCustomerProfile } from '@features/account/customerApi';
import {
  loadCachedProfile,
  saveCachedProfile,
} from '@features/account/customerProfileCache';
import { fetchOrderHistory } from '@features/orders/ordersApi';
import { customerAvatarUri } from '@features/account/parseCustomerProfile';
import type { CustomerProfile } from '@features/account/types';
import type { MainTabParamList, RootStackParamList } from '@navigation/types';
import { getEnvConfig } from '@shared/config/env';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { OffersModal } from '@features/categories/components/OffersModal';

import { openStorefrontLogin } from './requireStorefrontLogin';
import { YouCreditCouponsStripe } from './components/YouCreditCouponsStripe';
import { YouFlutterListTiles } from './components/YouFlutterListTiles';
import { YouGuestAuthBlock } from './components/YouGuestAuthBlock';
import { YouLoggedProfileRow } from './components/YouLoggedProfileRow';
import {
  YouNewArrivalsSection,
  type YouNewArrivalsSectionHandle,
} from './components/YouNewArrivalsSection';
import { YouOffersPromoBar } from './components/YouOffersPromoBar';

type AccountNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Menu'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const LOGIN_FOR_FEATURES = 'Please Login For Full Features Access';

function YouSectionDivider(): React.ReactElement {
  return <View style={{ height: 10, backgroundColor: colors.pageMuted }} />;
}

export function AccountScreen() {
  const navigation = useNavigation<AccountNavigation>();
  const country = useAppSelector(s => s.app.country);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const cfg = getEnvConfig(country);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const youNewArrivalsRef = useRef<YouNewArrivalsSectionHandle | null>(null);

  const avatarUri = useMemo(
    () => (profile ? customerAvatarUri(profile, cfg.customerAvatarCdnBaseUrl) : undefined),
    [cfg.customerAvatarCdnBaseUrl, profile],
  );

  const loadProfileOnly = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    const cached = await loadCachedProfile(country as CountryCode);
    if (cached) {
      setProfile(cached);
    }
    const showBlockingSpinner = !cached;
    if (showBlockingSpinner) {
      setProfileLoading(true);
    }
    try {
      const pRes = await fetchCustomerProfile();
      if (pRes.ok) {
        setProfile(pRes.profile);
        await saveCachedProfile(country as CountryCode, pRes.profile);
      } else if (!cached) {
        setProfile(null);
      }
      void fetchOrderHistory().catch(err => crashReporter.capture(err, { source: 'AccountScreen.ordersBg' }));
    } catch (e) {
      crashReporter.capture(e, { source: 'AccountScreen.profile' });
      if (!cached) {
        setProfile(null);
      }
    } finally {
      if (showBlockingSpinner) {
        setProfileLoading(false);
      }
    }
  }, [country, isAuthenticated]);

  /** Profile/orders: refresh when region or auth changes — not on every You refocus (back from PDP). */
  useEffect(() => {
    void loadProfileOnly();
  }, [loadProfileOnly]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      void loadProfileOnly();
    }, [isAuthenticated, loadProfileOnly]),
  );

  const couponsDisplay = profile?.couponsOffersLabel?.trim()?.length ? profile.couponsOffersLabel : '0';

  const creditStripeLine = useMemo(() => {
    const raw = profile?.creditBalanceLabel?.trim();
    if (raw?.length && storeCurrencyCode) return `${storeCurrencyCode} ${raw}`;
    if (raw?.length) return raw;
    if (storeCurrencyCode) return `${storeCurrencyCode} 0`;
    return '0';
  }, [profile?.creditBalanceLabel, storeCurrencyCode]);

  const onGuestRestrictedRow = useCallback(() => {
    Alert.alert('', LOGIN_FOR_FEATURES);
  }, []);

  const onFlutterYourOrders = useCallback(() => {
    analytics.track('account_you_orders');
    navigation.navigate('OrderHistory', undefined);
  }, [navigation]);

  const onFlutterAddresses = useCallback(() => {
    analytics.track('account_you_addresses');
    navigation.navigate('Addresses');
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <OffersModal visible={offersOpen} onClose={() => setOffersOpen(false)} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => youNewArrivalsRef.current?.onParentScroll(e.nativeEvent)}
      >
        {isAuthenticated ? (
          <YouLoggedProfileRow
            profile={profile}
            profileLoading={profileLoading && isAuthenticated}
            avatarUri={avatarUri}
            onPressAvatar={() => {
              analytics.track('account_you_avatar_profile');
              navigation.navigate('Profile');
            }}
            onPressSettings={() => navigation.navigate('MenuSettings')}
          />
        ) : (
          <YouGuestAuthBlock onPressSignIn={() => openStorefrontLogin(country)} />
        )}

        <YouCreditCouponsStripe
          isAuthenticated={isAuthenticated}
          storeCurrencyCode={storeCurrencyCode}
          creditLine={creditStripeLine}
          couponsLine={couponsDisplay}
        />

        <YouFlutterListTiles
          isGuest={!isAuthenticated}
          onSettings={() => navigation.navigate('MenuSettings')}
          onYourOrders={onFlutterYourOrders}
          onAddresses={onFlutterAddresses}
          onGuestRestriction={onGuestRestrictedRow}
        />

        <YouSectionDivider />

        <YouOffersPromoBar onPress={() => setOffersOpen(true)} />

        <YouSectionDivider />

        <YouNewArrivalsSection
          ref={youNewArrivalsRef}
          navigation={navigation}
          country={country as CountryCode}
          storeCurrencyCode={storeCurrencyCode ?? ''}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
