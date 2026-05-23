import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

type Props = {
  currency: string;
  total: number;
  strikeTotal?: number | null;
  itemCount?: number;
  isSheetOpen?: boolean;
  submitting?: boolean;
  onTogglePriceSheet: () => void;
  onSubmit: () => void;
};

export function CheckoutSubmitBar({
  currency,
  total,
  strikeTotal,
  itemCount,
  isSheetOpen = false,
  submitting = false,
  onTogglePriceSheet,
  onSubmit,
}: Props): React.ReactElement {
  const showStrike =
    strikeTotal != null &&
    strikeTotal > 0 &&
    Math.abs(strikeTotal - total) > 0.009;

  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        backgroundColor: '#FFF',
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
              {currency} {strikeTotal!.toFixed(2)}
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
          disabled={submitting}
          onPress={onSubmit}
          style={{
            width: '40%',
            marginRight: spacing.sm,
            height: 40,
            borderRadius: 40,
            backgroundColor: submitting ? '#FDBA74' : colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
              {itemCount != null && itemCount > 0
                ? `Submit order (${itemCount})`
                : 'Submit order'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
