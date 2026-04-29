import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function AppErrorView({ message, onRetry }: Props) {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ color: colors.danger }}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            padding: spacing.md,
          }}
          onPress={onRetry}
        >
          <Text style={{ color: colors.textPrimary }}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
