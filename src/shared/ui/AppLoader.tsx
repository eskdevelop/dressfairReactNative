import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors, spacing } from '@app/theme/tokens';

export function AppLoader() {
  return (
    <View style={{ padding: spacing.lg, alignItems: 'center' }}>
      <ActivityIndicator size="small" color={colors.brand} />
    </View>
  );
}
