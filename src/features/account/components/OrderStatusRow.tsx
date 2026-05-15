import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import type { OrderHistoryShortcut } from '@features/orders/orderShortcutFilter';

type Cell = {
  shortcut: OrderHistoryShortcut;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const ICON_TINT = colors.orderRowIconMuted;

const CELLS: Cell[] = [
  { shortcut: 'pending_payment', label: 'Pending payment', icon: 'card-outline' },
  { shortcut: 'processing', label: 'Processing', icon: 'sync-outline' },
  { shortcut: 'shipped', label: 'Shipped', icon: 'cube-outline' },
  { shortcut: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
  { shortcut: 'returns', label: 'Returns', icon: 'return-down-back-outline' },
];

type Props = {
  counts: Record<OrderHistoryShortcut, number>;
  onPressShortcut: (s: OrderHistoryShortcut) => void;
};

export function OrderStatusRow({ counts, onPressShortcut }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.xs,
        justifyContent: 'space-between',
      }}
    >
      {CELLS.map(cell => (
        <TouchableOpacity
          key={cell.shortcut}
          accessibilityRole="button"
          accessibilityLabel={cell.label}
          onPress={() => onPressShortcut(cell.shortcut)}
          style={{ flex: 1, alignItems: 'center', paddingHorizontal: 1 }}
        >
          <View style={{ position: 'relative', marginBottom: 6 }}>
            <Ionicons name={cell.icon} size={24} color={ICON_TINT} />
            {counts[cell.shortcut] > 0 ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -8,
                  minWidth: 15,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: '#FFF',
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: '700', color: '#FFF', lineHeight: 10 }}>
                  {counts[cell.shortcut] > 99 ? '99+' : counts[cell.shortcut]}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={{
              fontSize: 10,
              color: colors.textSecondary,
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: 13,
            }}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {cell.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
