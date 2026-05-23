import React from 'react';
import { Text, View } from 'react-native';

import { colors, spacing } from '@app/theme/tokens';
import { CHECKOUT_SHIPPING } from '@features/checkout/checkoutTrustContent';

export function CheckoutShippingInfo(): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: 10 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: colors.brand,
          marginBottom: 8,
        }}
      >
        {CHECKOUT_SHIPPING.title}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '400',
          color: 'rgba(0,0,0,0.8)',
          lineHeight: 15,
          marginBottom: 3,
        }}
      >
        {CHECKOUT_SHIPPING.deliveryDays}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '400',
          color: 'rgba(0,0,0,0.6)',
          lineHeight: 15,
          marginBottom: 3,
        }}
      >
        {CHECKOUT_SHIPPING.lateCredit}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '400',
          color: 'rgba(0,0,0,0.6)',
          lineHeight: 15,
        }}
      >
        {CHECKOUT_SHIPPING.couriers}
      </Text>
    </View>
  );
}
