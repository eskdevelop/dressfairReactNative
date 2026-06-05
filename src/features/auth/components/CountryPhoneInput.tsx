import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

import { authFilledInputBoxStyle } from './AuthTextField';

type SplitMobilePhoneFieldProps = {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  maxNationalLength: number;
  placeholder?: string;
  fieldHeight?: number;
  backgroundColor?: string;
  hint?: string;
};

/** Unified country-code + national number row (single bordered control). */
export function SplitMobilePhoneField({
  countryCode,
  value,
  onChangeText,
  maxNationalLength,
  placeholder = 'Mobile number',
  fieldHeight = 48,
  backgroundColor = '#FFFFFF',
  hint,
}: SplitMobilePhoneFieldProps): React.ReactElement {
  const onDigitsChange = (text: string): void => {
    onChangeText(text.replace(/\D/g, '').slice(0, maxNationalLength));
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: fieldHeight,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch',
            paddingHorizontal: spacing.md,
            backgroundColor: '#F3F4F6',
            borderRightWidth: 1,
            borderRightColor: colors.border,
            minWidth: 84,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textMuted, marginRight: 1 }}>+</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            {countryCode}
          </Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onDigitsChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={maxNationalLength}
          style={{
            flex: 1,
            minHeight: fieldHeight,
            paddingHorizontal: spacing.md,
            fontSize: 15,
            color: colors.textPrimary,
            backgroundColor: 'transparent',
          }}
        />
      </View>
      {hint ? (
        <Text style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>{hint}</Text>
      ) : null}
    </View>
  );
}

type Props = {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  maxNationalLength: number;
  placeholder?: string;
};

export function CountryPhoneInput({
  countryCode,
  value,
  onChangeText,
  maxNationalLength,
  placeholder = 'Enter WhatsApp Number',
}: Props): React.ReactElement {
  return (
    <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
      <SplitMobilePhoneField
        countryCode={countryCode}
        value={value}
        onChangeText={onChangeText}
        maxNationalLength={maxNationalLength}
        placeholder={placeholder}
        backgroundColor="#F9FAFB"
        hint={`Enter ${maxNationalLength}-digit mobile number`}
      />
    </View>
  );
}

/** Split mobile field for registration (country code + digits). */
export function RegisterMobileInput({
  countryCode,
  value,
  onChangeText,
  maxNationalLength,
  compact,
  hideLabel = false,
  filled = false,
  embedded = false,
  label = 'Mobile No',
  surfaceColor,
}: {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  maxNationalLength: number;
  compact?: boolean;
  hideLabel?: boolean;
  filled?: boolean;
  /** No outer horizontal margin — for forms that already have screen padding. */
  embedded?: boolean;
  label?: string;
  surfaceColor?: string;
}): React.ReactElement {
  const fieldHeight = compact || hideLabel ? 50 : 48;

  return (
    <View
      style={{
        marginHorizontal: embedded ? 0 : spacing.lg,
        marginBottom: embedded
          ? 0
          : hideLabel && filled
            ? spacing.md
            : compact
              ? spacing.sm
              : spacing.md,
      }}
    >
      {!hideLabel ? (
        <Text
          style={{
            fontSize: embedded ? 12 : compact ? 13 : 14,
            fontWeight: embedded ? '600' : '700',
            color: embedded ? colors.textMuted : colors.textPrimary,
            marginBottom: compact ? 6 : embedded ? 6 : 8,
          }}
        >
          {label}
        </Text>
      ) : null}
      <SplitMobilePhoneField
        countryCode={countryCode}
        value={value}
        onChangeText={onChangeText}
        maxNationalLength={maxNationalLength}
        fieldHeight={fieldHeight}
        backgroundColor={surfaceColor ?? (filled ? authFilledInputBoxStyle.backgroundColor : '#F9FAFB')}
        hint={embedded ? `Enter ${maxNationalLength}-digit WhatsApp number` : undefined}
      />
    </View>
  );
}
