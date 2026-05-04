import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

const logo = require('../../../assets/icon.png');

export function AppLoader() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      <Image
        source={logo}
        style={{
          width: 96,
          height: 96,
          borderRadius: radii.lg,
          marginBottom: spacing.xl,
        }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
