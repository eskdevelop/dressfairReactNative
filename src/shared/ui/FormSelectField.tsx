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

type TriggerApi = {
  open: () => void;
  selectedLabel: string | null;
  selectedValue: string;
};

type Props = {
  placeholder: string;
  selectedValue: string;
  options: FormSelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  minHeight?: number;
  /** Custom trigger (e.g. a settings row). When omitted, a default bordered box is rendered. */
  renderTrigger?: (api: TriggerApi) => React.ReactElement;
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
  renderTrigger,
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

  const openSheet = (): void => {
    if (!disabled) setOpen(true);
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ open: openSheet, selectedLabel, selectedValue })
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          disabled={disabled}
          onPress={openSheet}
          style={({ pressed }) => ({
            minHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: open ? colors.brand : colors.border,
            borderRadius: radii.lg,
            backgroundColor: pressed ? '#FAFAFA' : '#FFFFFF',
            paddingHorizontal: spacing.lg,
            opacity: disabled ? 0.55 : 1,
          })}
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
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      )}

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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            }}
            onPress={e => e.stopPropagation()}
          >
            <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#E0E0E0',
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: spacing.md,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                {placeholder}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={close}
                hitSlop={12}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#F2F2F2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
              renderItem={({ item }) => {
                const selected = item.value === selectedValue;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => pick(item.value)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 52,
                      paddingHorizontal: spacing.md,
                      marginVertical: 3,
                      borderRadius: radii.md,
                      backgroundColor: selected
                        ? '#FFF7ED'
                        : pressed
                          ? '#F7F7F7'
                          : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: selected ? colors.brand : 'transparent',
                    })}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: selected ? colors.brand : colors.textPrimary,
                        fontWeight: selected ? '600' : '400',
                      }}
                    >
                      {item.label}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.brand} />
                    ) : null}
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
