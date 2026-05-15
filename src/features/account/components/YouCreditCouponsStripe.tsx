import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  isAuthenticated: boolean;
  storeCurrencyCode: string | undefined;
  creditLine: string;
  couponsLine: string;
};

/** Flutter `couponsPrice()` bordered two-column stripe. */
export function YouCreditCouponsStripe({
  isAuthenticated,
  storeCurrencyCode,
  creditLine,
  couponsLine,
}: Props): React.ReactElement {
  const creditShown = isAuthenticated
    ? creditLine
    : `${storeCurrencyCode?.trim()?.length ? storeCurrencyCode : 'AED'} 0`;

  const couponShown = isAuthenticated ? couponsLine : '0';

  return (
    <View
      style={{
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.12)',
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#111' }}>{creditShown}</Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: '#4B5563' }}>Credit balance</Text>
        </View>
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(0,0,0,0.12)', marginVertical: 2 }} />
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#111' }}>{couponShown}</Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: '#4B5563' }}>Coupons & offers</Text>
        </View>
      </View>
    </View>
  );
}
