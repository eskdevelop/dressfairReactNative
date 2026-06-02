import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';

export type FormSelectOption = {
  label: string;
  value: string;
};

type Props = {
  placeholder: string;
  selectedValue: string;
  options: FormSelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  minHeight?: number;
};

/**
 * Light-themed select field. Avoids Android's native Picker dropdown, which
 * inherits the system dark Material theme and renders a black popup list.
 */
export function FormSelectField({
  placeholder,
  selectedValue,
  options,
  onValueChange,
  disabled = false,
  minHeight = 48,
}: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const match = options.find(o => o.value === selectedValue);
    return match?.label ?? null;
  }, [options, selectedValue]);

  const close = (): void => setOpen(false);

  const pick = (value: string): void => {
    onValueChange(value);
    close();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          minHeight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: spacing.md,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 15,
            color: selectedLabel ? colors.textPrimary : colors.textMuted,
          }}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
          onPress={close}
        >
          <Pressable
            style={{
              maxHeight: '70%',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: radii.lg,
              borderTopRightRadius: radii.lg,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            }}
            onPress={e => e.stopPropagation()}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                {placeholder}
              </Text>
              <Pressable accessibilityRole="button" onPress={close} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.value === selectedValue;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => pick(item.value)}
                    style={{
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      backgroundColor: selected ? '#FFF7ED' : '#FFFFFF',
                      borderBottomWidth: 1,
                      borderBottomColor: colors.dividerLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: selected ? colors.brand : colors.textPrimary,
                        fontWeight: selected ? '600' : '400',
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
