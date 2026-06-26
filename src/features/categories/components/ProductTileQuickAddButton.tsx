import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BTN_HEIGHT = 24;
const ICON_SIZE = 12;

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Pill-shaped quick-add cart control for PLP / new-arrival product tiles. */
export function ProductTileQuickAddButton({
  onPress,
  accessibilityLabel = 'Add to cart',
}: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      android_ripple={{ color: 'rgba(17, 17, 17, 0.08)', borderless: false, radius: BTN_HEIGHT / 2 }}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name="cart-plus" size={ICON_SIZE} color="#1A1A1A" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: BTN_HEIGHT,
    minWidth: 34,
    paddingHorizontal: 9,
    borderRadius: BTN_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: '#1F1F1F',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.07,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  pressed: {
    backgroundColor: '#F5F5F5',
    borderColor: '#111111',
    transform: [{ scale: 0.97 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.03,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
});
