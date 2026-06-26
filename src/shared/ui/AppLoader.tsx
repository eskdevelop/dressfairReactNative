import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

const logo = require('../../../assets/icon.png');

type Props = {
  /** When false, show only the spinner (e.g. PDP overlay). Default true for full-screen boot. */
  showLogo?: boolean;
};

export function AppLoader({ showLogo = true }: Props) {
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
      {showLogo ? (
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
      ) : null}
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
