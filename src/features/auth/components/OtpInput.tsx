import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

const OTP_LENGTH = 5;

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
};

export type OtpInputHandle = {
  focusFirst: () => void;
};

export const OtpInput = forwardRef<OtpInputHandle, Props>(function OtpInput(
  { value, onChange, error },
  ref,
) {
  const { width: ww } = useWindowDimensions();
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const chars = value.split('');
  const hasError = Boolean(error?.trim());

  const hPad = spacing.lg * 2;
  const gap = ww < 360 ? 8 : 10;
  const boxSize = Math.min(52, Math.floor((ww - hPad - gap * (OTP_LENGTH - 1)) / OTP_LENGTH));

  useImperativeHandle(
    ref,
    () => ({
      focusFirst: () => {
        inputsRef.current[0]?.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 280);
    return () => clearTimeout(t);
  }, []);

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
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap,
          marginHorizontal: spacing.lg,
          marginTop: spacing.xl,
          marginBottom: hasError ? spacing.sm : spacing.lg,
        }}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, index) => {
          const isFocused = focusedIndex === index;
          const filled = Boolean(chars[index]);
          const borderColor = hasError
            ? colors.danger
            : isFocused
              ? colors.brand
              : filled
                ? 'rgba(249, 115, 22, 0.35)'
                : colors.border;

          return (
            <TextInput
              key={index}
              ref={el => {
                inputsRef.current[index] = el;
              }}
              value={chars[index] ?? ''}
              onChangeText={text => onChangeAt(index, text)}
              onKeyPress={e => onKeyPress(index, e)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              selectTextOnFocus
              accessibilityLabel={`Digit ${index + 1} of ${OTP_LENGTH}`}
              style={{
                width: boxSize,
                height: boxSize + 4,
                borderWidth: isFocused || hasError ? 2 : 1,
                borderColor,
                borderRadius: radii.md,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: '700',
                color: colors.textPrimaryDark,
                backgroundColor: hasError ? '#FEF2F2' : filled ? '#FFF7ED' : '#FAFAFA',
                ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
                ...(isFocused && !hasError
                  ? {
                      shadowColor: colors.brand,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  : null),
              }}
            />
          );
        })}
      </View>

      {hasError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
            backgroundColor: '#FFF7ED',
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: 'rgba(249, 115, 22, 0.35)',
          }}
        >
          <Ionicons name="alert-circle" size={18} color={colors.brand} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: colors.textPrimaryDark, lineHeight: 18 }}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

export function OtpResendRow({
  onResend,
  loading,
  prefix = "Didn't receive a code?",
  linkLabel = 'Resend code',
}: {
  onResend: () => void;
  loading?: boolean;
  prefix?: string;
  linkLabel?: string;
}): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
      <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
        {prefix}{' '}
        <Text
          style={{ color: colors.brand, fontWeight: '700', fontSize: 14, lineHeight: 20 }}
          onPress={loading ? undefined : onResend}
          suppressHighlighting
        >
          {loading ? 'Sending…' : linkLabel}
        </Text>
      </Text>
    </View>
  );
}

export const AUTH_OTP_LENGTH = OTP_LENGTH;
