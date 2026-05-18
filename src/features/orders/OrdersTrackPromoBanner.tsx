import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';

type Props = {
  onPress?: () => void;
};

export function OrdersTrackPromoBanner({ onPress }: Props): React.ReactElement {
  const handlePress = () => {
    analytics.track('orders_track_promo_banner_pressed');
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Free shipping and pay when you receive offers"
      onPress={handlePress}
    >
      <View style={{ backgroundColor: colors.brand, paddingVertical: 8, paddingHorizontal: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 10,
              color: '#FFFFFF',
              fontWeight: '500',
            }}
          >
            Free shipping
          </Text>
          <View
            style={{
              marginHorizontal: 10,
              width: StyleSheet.hairlineWidth * 2,
              minWidth: 1,
              height: 16,
              backgroundColor: '#FFFFFF',
            }}
          />
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 10,
              color: '#FFFFFF',
              fontWeight: '500',
            }}
          >
            Pay when you receive your order
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
