import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

type Props = {
  currency: string;
  total: number;
  strikeTotal?: number | null;
  selectedCount: number;
  isSheetOpen?: boolean;
  onTogglePriceSheet: () => void;
  onCheckout: () => void;
};

export function CartCheckoutBar({
  currency,
  total,
  strikeTotal,
  selectedCount,
  isSheetOpen = false,
  onTogglePriceSheet,
  onCheckout,
}: Props): React.ReactElement {
  const showStrike =
    strikeTotal != null &&
    strikeTotal > 0 &&
    Math.abs(strikeTotal - total) > 0.009;

  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        paddingTop: 4,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 55,
          backgroundColor: '#FFF',
          borderRadius: 50,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onTogglePriceSheet}
          style={{ flex: 1, paddingLeft: spacing.lg, justifyContent: 'center' }}
        >
          {showStrike ? (
            <Text
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                textDecorationLine: 'line-through',
              }}
            >
              {currency} {strikeTotal.toFixed(2)}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.brand }}>
              {currency} {total.toFixed(2)}
            </Text>
            <Ionicons
              name={isSheetOpen ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#6B7280"
              style={{ marginLeft: 4 }}
            />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onCheckout}
          style={{
            width: '40%',
            marginRight: spacing.sm,
            height: 40,
            borderRadius: 40,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
            Checkout{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
