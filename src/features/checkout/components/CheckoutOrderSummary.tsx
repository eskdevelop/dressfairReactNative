import React from 'react';
import { Text, View } from 'react-native';

import { colors, spacing } from '@app/theme/tokens';

type Props = {
  currency: string;
  itemsNormalTotal: number;
  itemsSaleTotal: number;
  discount: number;
  shipping: number;
  orderTotal: number;
};

function Row({
  label,
  value,
  valueColor = '#111',
  strike,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strike?: boolean;
  bold?: boolean;
}): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <Text style={{ fontSize: 13, color: '#111' }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: bold ? '700' : '400',
          color: valueColor,
          textDecorationLine: strike ? 'line-through' : 'none',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function CheckoutOrderSummary({
  currency,
  itemsNormalTotal,
  itemsSaleTotal,
  discount,
  shipping,
  orderTotal,
}: Props): React.ReactElement {
  const showStrike = discount > 0.009;

  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: 6 }}>
      {showStrike ? (
        <Row
          label="Item(s) total:"
          value={`${currency} ${itemsNormalTotal.toFixed(2)}`}
          strike
        />
      ) : null}
      {showStrike ? (
        <Row
          label="Item(s) discount:"
          value={`-${currency} ${discount.toFixed(2)}`}
          valueColor="#16A34A"
        />
      ) : null}
      <Row
        label="Sub Total:"
        value={`${currency} ${itemsSaleTotal.toFixed(2)}`}
        valueColor={colors.brand}
      />
      <Row label="Shipping:" value={`${currency} ${shipping.toFixed(2)}`} />
      <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />
      <Row
        label="Order Total:"
        value={`${currency} ${orderTotal.toFixed(2)}`}
        bold
      />
    </View>
  );
}
