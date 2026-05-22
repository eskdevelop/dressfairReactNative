import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@app/theme/tokens';

type Props = {
  checked: boolean;
  onPress: () => void;
  size?: number;
};

export function CartCheckbox({ checked, onPress, size = 22 }: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      hitSlop={6}
      style={styles.hit}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={size}
        color={checked ? colors.brand : '#9CA3AF'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
