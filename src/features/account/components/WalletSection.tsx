import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

type Slot = 'coupons' | 'credits' | 'gifts';

type Props = {
  couponsDisplay: string;
  creditsDisplay: string;
  giftsDisplay: string;
  subtitleCoupons?: string;
  subtitleCredits?: string;
  subtitleGifts?: string;
  onPressSlot: (slot: Slot) => void;
};

export function WalletSection({
  couponsDisplay,
  creditsDisplay,
  giftsDisplay,
  subtitleCoupons = 'Coupons',
  subtitleCredits = 'Credits',
  subtitleGifts = 'Gift cards',
  onPressSlot,
}: Props) {
  const cell = (
    slot: Slot,
    icon: React.ComponentProps<typeof Ionicons>['name'],
    value: string,
    sub: string,
    showDivider: boolean,
  ) => (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => onPressSlot(slot)}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRightWidth: showDivider ? StyleSheet.hairlineWidth : 0,
        borderRightColor: colors.dividerLight,
      }}
    >
      <Ionicons name={icon} size={21} color={colors.orderRowIconMuted} />
      <Text style={{ marginTop: 6, fontSize: 14, fontWeight: '700', color: colors.textPrimaryDark }}>
        {value}
      </Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: colors.textSecondary, textAlign: 'center' }}>
        {sub}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flexDirection: 'row' }}>
      {cell('coupons', 'pricetag-outline', couponsDisplay, subtitleCoupons, true)}
      {cell('credits', 'wallet-outline', creditsDisplay, subtitleCredits, true)}
      {cell('gifts', 'gift-outline', giftsDisplay, subtitleGifts, false)}
    </View>
  );
}
