import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

import type { TrackTabId } from './orderStatusPartition';

function emptyCopy(tabId: TrackTabId, tabLabel: string): { title: string; message: string } {
  if (tabId === 'all') {
    return {
      title: 'No orders yet',
      message: "When you place an order, it will show up here so you can track delivery.",
    };
  }
  return {
    title: `No ${tabLabel.toLowerCase()} orders`,
    message: `You don't have any ${tabLabel.toLowerCase()} orders at the moment.`,
  };
}

type Props = {
  tabId: TrackTabId;
  tabLabel: string;
};

export function OrdersEmptyState({ tabId, tabLabel }: Props): React.ReactElement {
  const copy = emptyCopy(tabId, tabLabel);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
        minHeight: 360,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="bag-handle-outline" size={38} color={colors.brand} />
      </View>
      <Text
        style={{
          marginTop: spacing.lg,
          fontSize: 16,
          fontWeight: '600',
          color: colors.textPrimaryDark,
          textAlign: 'center',
        }}
      >
        {copy.title}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: '400',
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 19,
          maxWidth: 280,
        }}
      >
        {copy.message}
      </Text>
    </View>
  );
}
