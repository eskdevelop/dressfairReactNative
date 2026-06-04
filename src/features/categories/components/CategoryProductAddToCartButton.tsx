import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICON_SIZE = 22;
const ICON_SIZE_LARGE = 24;

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
  /** Slightly larger icon on wider listing tiles. */
  size?: 'default' | 'large';
};

/**
 * Quick-add cart icon overlaid bottom-right on product image.
 * Parent must use `position: 'relative'` on the image wrapper.
 */
export function CategoryProductAddToCartButton({
  onPress,
  accessibilityLabel = 'Add to cart',
  size = 'default',
}: Props): React.ReactElement {
  const icon = size === 'large' ? ICON_SIZE_LARGE : ICON_SIZE;
  const inset = size === 'large' ? 8 : 6;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        bottom: inset,
        right: inset,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Ionicons name="cart-outline" size={icon} color="#FFFFFF" style={styles.iconShadow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
