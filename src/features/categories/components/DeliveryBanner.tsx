import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { categoryTheme } from '../categoryTheme';

type Props = {
  onPressDetails: () => void;
};

/** Flutter [`StaticTextContainer`](reuseable_static_text.dart) parity. */
export function DeliveryBanner({ onPressDetails }: Props) {
  return (
    <Pressable onPress={onPressDetails}>
      <View
        style={{
          width: '100%',
          paddingVertical: 10,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: categoryTheme.primary,
          gap: 6,
        }}
      >
        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
        <Text style={{ color: '#FFF', fontWeight: '500', fontSize: 10 }}>✓ Free shipping</Text>
        <View style={{ height: 16, width: 1, backgroundColor: '#FFF' }} />
        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
        <Text style={{ color: '#FFF', fontWeight: '500', fontSize: 10 }}>✓ Pay when you receive your order</Text>
        <Ionicons name="chevron-forward" size={13} color="#FFF" />
      </View>
    </Pressable>
  );
}
