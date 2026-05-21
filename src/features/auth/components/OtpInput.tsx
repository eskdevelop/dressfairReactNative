import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

const OTP_LENGTH = 5;

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function OtpInput({ value, onChange }: Props): React.ReactElement {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const chars = value.split('');

  const setCharAt = useCallback(
    (index: number, char: string) => {
      const arr = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? '');
      arr[index] = char;
      const joined = arr.join('').slice(0, OTP_LENGTH);
      onChange(joined);
      if (char && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [chars, onChange],
  );

  const onKeyPress = useCallback(
    (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && !chars[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    },
    [chars],
  );

  const onChangeAt = useCallback(
    (index: number, text: string) => {
      const cleaned = text.replace(/\D/g, '');
      if (cleaned.length > 1) {
        onChange(cleaned.slice(0, OTP_LENGTH));
        const focusIdx = Math.min(cleaned.length, OTP_LENGTH - 1);
        inputsRef.current[focusIdx]?.focus();
        return;
      }
      setCharAt(index, cleaned);
    },
    [onChange, setCharAt],
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xl,
      }}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const display = chars[index] ?? '';
        return (
          <TextInput
            key={index}
            ref={ref => {
              inputsRef.current[index] = ref;
            }}
            value={display}
            onChangeText={text => onChangeAt(index, text)}
            onKeyPress={e => onKeyPress(index, e)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            selectTextOnFocus
            style={{
              width: 48,
              height: 52,
              borderWidth: isFocused ? 2 : 1,
              borderColor: isFocused ? colors.brand : colors.border,
              borderRadius: radii.md,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              backgroundColor: '#FFFFFF',
            }}
          />
        );
      })}
    </View>
  );
}

export function OtpResendRow({
  onResend,
  loading,
}: {
  onResend: () => void;
  loading?: boolean;
}): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
      <Text style={{ fontSize: 14, color: colors.textMuted }}>
        Did you Received any Code?{' '}
        <Pressable accessibilityRole="button" onPress={onResend} disabled={loading}>
          <Text style={{ color: colors.brand, fontWeight: '700' }}>Resend New Code</Text>
        </Pressable>
      </Text>
    </View>
  );
}

export const AUTH_OTP_LENGTH = OTP_LENGTH;
