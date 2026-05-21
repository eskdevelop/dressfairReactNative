import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

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
}: {
  countryCode: string;
  value: string;
  onChangeText: (text: string) => void;
  compact?: boolean;
}): React.ReactElement {
  const fieldHeight = compact ? 44 : 48;
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
        Mobile No
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View
          style={{
            minWidth: 72,
            height: fieldHeight,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: '#F9FAFB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600' }}>{countryCode}</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={text => onChangeText(text.replace(/\D/g, ''))}
          placeholder="Mobile No"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={15}
          style={{
            flex: 1,
            height: fieldHeight,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: '#F9FAFB',
            paddingHorizontal: spacing.md,
            fontSize: 15,
          }}
        />
      </View>
    </View>
  );
}
