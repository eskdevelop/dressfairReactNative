import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

export function CartEmptyState(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        minHeight: 72,
      }}
    >
      <Ionicons name="cart-outline" size={60} color="rgba(0,0,0,0.1)" />
      <View style={{ marginLeft: spacing.md }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.7)' }}>
          Your Shipping Cart is Empty
        </Text>
        <Text style={{ marginTop: 5, fontSize: 11, fontWeight: '500', color: 'rgba(0,0,0,0.5)' }}>
          Add your favourite items in it
        </Text>
      </View>
    </View>
  );
}
