import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@app/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.background,
          borderRadius: 11,
          marginHorizontal: 12,
          marginBottom: 8,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.dividerLight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
