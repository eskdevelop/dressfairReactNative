import React from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@app/theme/tokens';

type Props = {
  checked: boolean;
  onPress: () => void;
  size?: number;
};

/** Circular select control — radio look, checkbox behavior (multi-select cart). */
export function CartCheckbox({ checked, onPress, size = 20 }: Props): React.ReactElement {
  const inner = Math.max(8, Math.round(size * 0.45));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      hitSlop={8}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: checked ? colors.brand : '#D1D5DB',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF',
        }}
      >
        {checked ? (
          <View
            style={{
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: colors.brand,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
