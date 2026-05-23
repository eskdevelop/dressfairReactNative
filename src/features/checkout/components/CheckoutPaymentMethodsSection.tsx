import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors, spacing } from '@app/theme/tokens';
import type { CheckoutPaymentMethod } from '@features/checkout/types';

type Props = {
  methods: CheckoutPaymentMethod[];
  selectedId: number | null;
  loading: boolean;
  errorMessage?: string | null;
  onSelect: (id: number) => void;
  onRetry?: () => void;
};

export function CheckoutPaymentMethodsSection({
  methods,
  selectedId,
  loading,
  errorMessage,
  onSelect,
  onRetry,
}: Props): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingTop: 4, paddingBottom: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 }}>
        Payment Method
      </Text>
      {loading ? (
        <View style={{ paddingVertical: 6, alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} size="small" />
        </View>
      ) : errorMessage && methods.length === 0 ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, color: '#DC2626' }}>{errorMessage}</Text>
          {onRetry ? (
            <Pressable accessibilityRole="button" onPress={onRetry}>
              <Text style={{ fontSize: 12, color: colors.brand, fontWeight: '600' }}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : methods.length === 0 ? (
        <Text style={{ fontSize: 12, color: '#6B7280' }}>No payment methods available</Text>
      ) : (
        methods.map(method => {
          const selected = selectedId === method.id;
          return (
            <Pressable
              key={method.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onSelect(method.id)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: selected ? colors.brand : '#D1D5DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                {selected ? (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.brand,
                    }}
                  />
                ) : null}
              </View>
              <Text style={{ fontSize: 13, color: '#111', fontWeight: selected ? '600' : '400' }}>
                {method.name}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}
