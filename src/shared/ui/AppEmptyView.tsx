import React from 'react';
import { Text, View } from 'react-native';

import { colors, spacing } from '@app/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
};

export function AppEmptyView({ title, subtitle }: Props) {
  return (
    <View style={{ padding: spacing.lg, alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted }}>{subtitle}</Text> : null}
    </View>
  );
}
