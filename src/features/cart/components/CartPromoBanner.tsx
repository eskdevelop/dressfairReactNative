import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { radii, spacing } from '@app/theme/tokens';

const GREEN = '#15803D';
const GREEN_SOFT = '#F0FDF4';

export function CartPromoBanner(): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      style={{
        marginHorizontal: spacing.md,
        marginTop: 0,
        backgroundColor: GREEN_SOFT,
        borderRadius: radii.sm,
        paddingVertical: 9,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <Ionicons name="checkmark" size={16} color={GREEN} />
        <Text
          numberOfLines={1}
          style={{
            marginLeft: 7,
            fontSize: 12,
            fontWeight: '600',
            color: GREEN,
            flexShrink: 1,
          }}
        >
          Free shipping and free returns
        </Text>
      </View>
      <View
        style={{
          marginLeft: spacing.sm,
          backgroundColor: 'rgba(21, 128, 61, 0.12)',
          borderRadius: radii.pill,
          paddingHorizontal: 8,
          paddingVertical: 3,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '600', color: GREEN }}>Limited time</Text>
      </View>
    </Pressable>
  );
}
