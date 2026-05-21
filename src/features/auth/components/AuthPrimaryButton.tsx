import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthPrimaryButton({ label, onPress, loading, disabled }: Props): React.ReactElement {
  const isDisabled = Boolean(loading || disabled);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={{
        height: 48,
        borderRadius: radii.pill,
        backgroundColor: isDisabled ? '#FDBA74' : colors.brand,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.lg,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{label}</Text>
      )}
    </Pressable>
  );
}
