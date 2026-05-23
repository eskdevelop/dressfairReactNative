import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

const filledBoxStyle: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: radii.md,
  borderWidth: 1,
  borderColor: colors.border,
};

type Props = {
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  secure?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
  compact?: boolean;
  embedded?: boolean;
  /** Placeholder-only field (reference auth UI). */
  hideLabel?: boolean;
  /** White elevated input box. */
  filled?: boolean;
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
  embedded,
  hideLabel = false,
  filled = false,
}: Props): React.ReactElement {
  const [hidden, setHidden] = useState(Boolean(secure));
  const fieldHeight = compact || hideLabel ? 50 : 48;

  return (
    <View
      style={{
        marginHorizontal: embedded ? 0 : spacing.lg,
        marginBottom:
          hideLabel && filled ? spacing.md : compact ? spacing.sm : spacing.md,
        flex: embedded ? 1 : undefined,
      }}
    >
      {!hideLabel && label ? (
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
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          minHeight: fieldHeight,
          ...(filled
            ? filledBoxStyle
            : {
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                backgroundColor: '#F9FAFB',
              }),
        }}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          maxLength={maxLength}
          style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 12 }}
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

export { filledBoxStyle as authFilledInputBoxStyle };
