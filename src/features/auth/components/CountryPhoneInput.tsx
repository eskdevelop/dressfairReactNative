import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

import { authFilledInputBoxStyle } from './AuthTextField';

type Props = {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function CountryPhoneInput({
  countryCode,
  value,
  onChangeText,
  placeholder = 'Enter WhatsApp Number',
}: Props): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.xl, gap: 10 }}>
      <View
        style={{
          minWidth: 72,
          height: 48,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor: '#F9FAFB',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{countryCode}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={text => onChangeText(text.replace(/\D/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        maxLength={15}
        style={{
          flex: 1,
          height: 48,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          backgroundColor: '#F9FAFB',
          paddingHorizontal: spacing.md,
          fontSize: 15,
          color: colors.textPrimary,
        }}
      />
    </View>
  );
}

/** Split mobile field for registration (country code + digits). */
export function RegisterMobileInput({
  countryCode,
  value,
  onChangeText,
  compact,
  hideLabel = false,
  filled = false,
}: {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  compact?: boolean;
  hideLabel?: boolean;
  filled?: boolean;
}): React.ReactElement {
  const fieldHeight = compact || hideLabel ? 50 : 48;
  const boxStyle = filled
    ? authFilledInputBoxStyle
    : {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: '#F9FAFB',
      };

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: hideLabel && filled ? spacing.md : compact ? spacing.sm : spacing.md,
      }}
    >
      {!hideLabel ? (
        <Text
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: compact ? 6 : 8,
          }}
        >
          Mobile No
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View
          style={{
            minWidth: 72,
            height: fieldHeight,
            alignItems: 'center',
            justifyContent: 'center',
            ...boxStyle,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{countryCode}</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={text => onChangeText(text.replace(/\D/g, ''))}
          placeholder="Mobile number"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={15}
          style={{
            flex: 1,
            height: fieldHeight,
            paddingHorizontal: spacing.md,
            fontSize: 15,
            color: colors.textPrimary,
            ...boxStyle,
          }}
        />
      </View>
    </View>
  );
}
