import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

import type { FormSelectOption } from './FormSelectField';

type Props = {
  placeholder: string;
  selectedValue: string;
  options: FormSelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  minHeight?: number;
  fontSize?: number;
  maxListHeight?: number;
};

/**
 * Compact white dropdown that expands directly below the trigger.
 * Used on Add Address where Android's native Picker shows a dark system dialog.
 */
export function InlineFormSelectField({
  placeholder,
  selectedValue,
  options,
  onValueChange,
  disabled = false,
  minHeight = 48,
  fontSize = 13,
  maxListHeight = 360,
}: Props): React.ReactElement {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const match = options.find(o => o.value === selectedValue);
    return match?.label ?? null;
  }, [options, selectedValue]);

  const pick = (value: string): void => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <View style={{ zIndex: open ? 20 : 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => {
          if (!disabled) setOpen(v => !v);
        }}
        style={{
          minHeight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: open ? colors.brand : colors.border,
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
            fontSize,
            color: selectedLabel ? colors.textPrimary : colors.textMuted,
          }}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>

      {open ? (
        <View
          style={{
            marginTop: 4,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: '#FFFFFF',
            maxHeight: maxListHeight,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {options.map(item => {
              const selected = item.value === selectedValue;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => pick(item.value)}
                  style={({ pressed }) => ({
                    minHeight: 40,
                    paddingHorizontal: spacing.md,
                    justifyContent: 'center',
                    backgroundColor: selected
                      ? '#FFF7ED'
                      : pressed
                        ? '#F9FAFB'
                        : '#FFFFFF',
                  })}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize,
                      color: selected ? colors.brand : colors.textPrimary,
                      fontWeight: selected ? '600' : '400',
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
