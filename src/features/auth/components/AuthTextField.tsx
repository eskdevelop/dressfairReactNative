import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  secure?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
  /** Tighter vertical spacing for long forms (register). */
  compact?: boolean;
};

export function AuthTextField({
  label,
  icon,
  secure,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  maxLength,
  compact,
}: Props): React.ReactElement {
  const [hidden, setHidden] = useState(Boolean(secure));

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: compact ? spacing.sm : spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: compact ? 13 : 14,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: compact ? 6 : 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor: '#F9FAFB',
          paddingHorizontal: spacing.md,
          minHeight: compact ? 44 : 48,
        }}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          maxLength={maxLength}
          style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 10 }}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden(v => !v)}
            hitSlop={8}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
