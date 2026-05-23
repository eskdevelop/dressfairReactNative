import React from 'react';
import { View } from 'react-native';

import { spacing } from '@app/theme/tokens';

export function CheckoutDottedDivider(): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: spacing.md,
        marginVertical: 4,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        height: 1,
      }}
    />
  );
}

export function CheckoutSolidDivider(): React.ReactElement {
  return (
    <View
      style={{
        height: 6,
        backgroundColor: '#F5F5F5',
        marginVertical: 4,
      }}
    />
  );
}
