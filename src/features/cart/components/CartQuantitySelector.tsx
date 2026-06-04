import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutRectangle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@app/theme/tokens';
import {
  CART_QUANTITY_MAX,
  canIncreaseCartQuantity,
  presetQuantityOptions,
} from '@features/cart/cartStock';

type Props = {
  quantity: number;
  /** In-stock cap for this variant; when unknown, treated as {@link CART_QUANTITY_MAX}. */
  maxQuantity?: number;
  onQuantityChange: (quantity: number) => void;
};

const TRIGGER_HEIGHT = 28;
const TRIGGER_MIN_WIDTH = 48;
const MENU_ROW_HEIGHT = 32;

/**
 * Compact cart quantity dropdown (1–5 presets, capped by stock) with + for higher qty.
 */
export function CartQuantitySelector({
  quantity,
  maxQuantity = CART_QUANTITY_MAX,
  onQuantityChange,
}: Props): React.ReactElement {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const stockCap = Math.max(0, Math.floor(maxQuantity));
  const effectiveMax = stockCap > 0 ? Math.min(CART_QUANTITY_MAX, stockCap) : 0;
  const q = effectiveMax > 0 ? Math.min(Math.max(Math.floor(quantity), 1), effectiveMax) : 0;

  const presetOptions = useMemo(() => presetQuantityOptions(effectiveMax), [effectiveMax]);

  const close = useCallback((): void => setOpen(false), []);

  const openMenu = useCallback((): void => {
    if (effectiveMax <= 0) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }, [effectiveMax]);

  const pick = useCallback(
    (value: number): void => {
      onQuantityChange(value);
      close();
    },
    [close, onQuantityChange],
  );

  const increment = useCallback((): void => {
    if (!canIncreaseCartQuantity(q, effectiveMax)) return;
    onQuantityChange(q + 1);
  }, [effectiveMax, onQuantityChange, q]);

  const menuWidth = Math.max(anchor?.width ?? TRIGGER_MIN_WIDTH, TRIGGER_MIN_WIDTH);
  const menuTop = (anchor?.y ?? 0) + (anchor?.height ?? TRIGGER_HEIGHT) + 2;
  const menuLeft = anchor?.x ?? 0;

  return (
    <View style={styles.row}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Quantity ${q}, change quantity`}
          accessibilityState={{ expanded: open, disabled: effectiveMax <= 0 }}
          disabled={effectiveMax <= 0}
          onPress={openMenu}
          style={({ pressed }) => [
            styles.trigger,
            open && styles.triggerOpen,
            pressed && styles.triggerPressed,
            effectiveMax <= 0 && styles.disabled,
          ]}
        >
          <Text style={styles.triggerValue}>{effectiveMax > 0 ? q : '—'}</Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={12}
            color="#6B7280"
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={!canIncreaseCartQuantity(q, effectiveMax)}
        onPress={increment}
        hitSlop={6}
        style={({ pressed }) => [
          styles.plusBtn,
          pressed && styles.triggerPressed,
          !canIncreaseCartQuantity(q, effectiveMax) && styles.plusBtnDisabled,
        ]}
      >
        <Ionicons name="add" size={16} color="#374151" />
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          {anchor ? (
            <View
              style={[
                styles.menu,
                {
                  top: menuTop,
                  left: menuLeft,
                  width: menuWidth,
                },
              ]}
            >
              {presetOptions.map((item, index) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item === q }}
                  onPress={() => pick(item)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    index === presetOptions.length - 1 && styles.menuRowLast,
                    item === q && styles.menuRowSelected,
                    pressed && styles.menuRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.menuRowText,
                      item === q && styles.menuRowTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: TRIGGER_MIN_WIDTH,
    height: TRIGGER_HEIGHT,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  triggerOpen: {
    borderColor: '#D1D5DB',
  },
  triggerPressed: {
    backgroundColor: '#F9FAFB',
  },
  disabled: {
    opacity: 0.45,
  },
  triggerValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  plusBtn: {
    width: 28,
    height: TRIGGER_HEIGHT,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  plusBtnDisabled: {
    opacity: 0.4,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  menuRow: {
    height: MENU_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowSelected: {
    backgroundColor: '#F9FAFB',
  },
  menuRowPressed: {
    backgroundColor: '#F3F4F6',
  },
  menuRowText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  menuRowTextSelected: {
    color: colors.brand,
    fontWeight: '600',
  },
});
