import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@app/theme/tokens';

export function CartPromoBanner(): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      style={{
        marginHorizontal: spacing.md,
        height: 30,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.35)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
        <Ionicons name="checkmark" size={18} color="#16A34A" />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 11,
            fontWeight: '500',
            color: '#16A34A',
          }}
        >
          Free shipping and free returns
        </Text>
      </View>
      <Text
        style={{
          paddingRight: 10,
          fontSize: 11,
          color: 'rgba(0,0,0,0.5)',
        }}
      >
        Limited time
      </Text>
    </Pressable>
  );
}
