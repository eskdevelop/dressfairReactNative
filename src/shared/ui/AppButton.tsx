import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({ label, onPress, loading, disabled }: Props) {
  const isDisabled = Boolean(loading || disabled);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={{
        backgroundColor: isDisabled ? '#FDBA74' : colors.brand,
        paddingVertical: spacing.md,
        borderRadius: radii.pill,
        alignItems: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
