import React, { useMemo } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';
import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import type { CountryCode } from '@shared/config/env';

type Props = {
  profile: CustomerProfile | null;
  address: CustomerAddressRecord | null;
  isAuthenticated: boolean;
  country: CountryCode;
  onPress: () => void;
  onAddAddress: () => void;
};

const COUNTRY_LABEL: Record<CountryCode, string> = {
  UAE: 'United Arab Emirates',
  OMN: 'Oman',
  KSA: 'Saudi Arabia',
};

function CheckoutDottedLine(): React.ReactElement {
  const { width: ww } = useWindowDimensions();
  const innerWidth = ww - spacing.md * 2;
  const dashW = 4;
  const dashCount = Math.max(1, Math.floor(innerWidth / (dashW * 2)));

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: spacing.md,
        paddingVertical: 2,
      }}
    >
      {Array.from({ length: dashCount }).map((_, i) => (
        <View key={i} style={{ width: dashW, height: 1, backgroundColor: '#BDBDBD' }} />
      ))}
    </View>
  );
}

function AddressEmptyState({ onAddAddress }: { onAddAddress: () => void }): React.ReactElement {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="location-outline" size={22} color={colors.brand} />
      </View>
      <Text
        style={{
          marginTop: spacing.sm,
          fontSize: 13,
          fontWeight: '600',
          color: colors.textPrimaryDark,
          textAlign: 'center',
        }}
      >
        No delivery address yet
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontSize: 11,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 15,
        }}
      >
        Add an address to continue with checkout
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAddAddress}
        style={({ pressed }) => ({
          marginTop: spacing.sm,
          alignSelf: 'stretch',
          height: 36,
          borderRadius: radii.pill,
          backgroundColor: colors.brand,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Add default address</Text>
      </Pressable>
    </View>
  );
}

function AddressFilledState({
  profile,
  address,
  country,
  onPress,
}: {
  profile: CustomerProfile;
  address: CustomerAddressRecord;
  country: CountryCode;
  onPress: () => void;
}): React.ReactElement {
  const displayName = useMemo(() => {
    const n = `${profile.firstname} ${profile.lastname}`.trim();
    return n.length > 0 ? n : address.address.split('\n')[0] || 'Address';
  }, [address.address, profile.firstname, profile.lastname]);

  const cityLine = useMemo(() => {
    const parts = [address.cityName, address.areaName, COUNTRY_LABEL[country]].filter(Boolean);
    return parts.join(', ');
  }, [address.areaName, address.cityName, country]);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <CheckoutDottedLine />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingHorizontal: spacing.md,
          paddingVertical: 6,
        }}
      >
        <Ionicons name="location-sharp" size={18} color="#111" style={{ marginTop: 1 }} />
        <View style={{ flex: 1, marginLeft: 8, paddingRight: 4 }}>
          <Text style={{ fontSize: 12, color: '#111', lineHeight: 17 }}>
            <Text style={{ fontWeight: '700' }}>{displayName}</Text>
            {profile.mobile.trim().length > 0 ? (
              <Text style={{ fontWeight: '400' }}>{`  ${profile.mobile.trim()}`}</Text>
            ) : null}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: '#E56B2A',
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {address.address}
          </Text>
          {cityLine.length > 0 ? (
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                fontWeight: '700',
                color: '#111',
                lineHeight: 15,
              }}
              numberOfLines={2}
            >
              {cityLine.toUpperCase()}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={15} color="#9CA3AF" style={{ marginTop: 2 }} />
      </View>
      <CheckoutDottedLine />
    </Pressable>
  );
}

export function CheckoutAddressSection({
  profile,
  address,
  isAuthenticated,
  country,
  onPress,
  onAddAddress,
}: Props): React.ReactElement | null {
  if (!isAuthenticated) {
    return null;
  }

  if (!address || !profile) {
    return <AddressEmptyState onAddAddress={onAddAddress} />;
  }

  return (
    <AddressFilledState profile={profile} address={address} country={country} onPress={onPress} />
  );
}
