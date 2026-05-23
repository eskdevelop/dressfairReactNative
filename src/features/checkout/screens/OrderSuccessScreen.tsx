import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import { fetchOrderById } from '@features/checkout/checkoutApi';
import type { OrderSuccessDetail } from '@features/checkout/types';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderSuccess'>;
type Route = RouteProp<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderSuccessDetail | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetchOrderById(orderId);
      if (res.ok && res.order) {
        setOrder(res.order);
        analytics.track('checkout_native_success_view', { order_id: orderId });
      }
      setLoading(false);
    })();
  }, [orderId]);

  const currency = order?.currencyCode || 'AED';
  const total = order?.orderTotalAmount || '0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, alignItems: 'center' }}>
        <Ionicons name="checkmark-circle" size={72} color="#16A34A" style={{ marginTop: 40 }} />
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111', marginTop: spacing.lg }}>
          Order placed successfully
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: spacing.sm }}>
          Order #{orderId}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} />
        ) : order ? (
          <View style={{ width: '100%', marginTop: spacing.xl }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111' }}>
              {currency} {total}
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: spacing.sm }}>
              {order.customerName} • {order.customerMobile}
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
              {order.customerCity}, {order.customerArea}
            </Text>
            {order.products.map((p, i) => (
              <Text key={`${p.sku}-${i}`} style={{ fontSize: 13, color: '#111', marginTop: 8 }}>
                {p.name} × {p.quantity}
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={{
            marginTop: spacing.xl,
            width: '100%',
            backgroundColor: colors.brand,
            borderRadius: 24,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 15 }}>Continue shopping</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('OrderHistory')}
          style={{
            marginTop: spacing.md,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.brand,
            borderRadius: 24,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.brand, fontWeight: '600', fontSize: 15 }}>Track order</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
