import React, { useMemo } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

import { OrderImageGallery } from './components/OrderImageGallery';
import { statusDisplayUpper } from './orderStatusPartition';
import { collectOrderImages } from './orderImages';
import type { OrderProduct } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type Rt = RouteProp<RootStackParamList, 'OrderDetail'>;

const ID_GREY = '#616161';

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      <Text style={{ width: 110, fontSize: 12, color: colors.textMuted }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 12, color: colors.textPrimary, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function ProductDetailRow({ product, index }: { product: OrderProduct; index: number }): React.ReactElement {
  const textTrim =
    Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : undefined;

  return (
    <View
      style={{
        paddingVertical: spacing.sm,
        borderTopWidth: index === 0 ? 0 : 1,
        borderTopColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: colors.textPrimary,
          ...textTrim,
        }}
      >
        {product.productName}
      </Text>
      {product.productSku ? (
        <Text style={{ marginTop: 4, fontSize: 11, color: ID_GREY, ...textTrim }}>
          SKU: {product.productSku}
        </Text>
      ) : null}
      {product.optionLabel ? (
        <Text style={{ marginTop: 4, fontSize: 11, color: ID_GREY, ...textTrim }}>
          Option: {product.optionLabel}
        </Text>
      ) : null}
      <Text style={{ marginTop: 4, fontSize: 11, color: colors.textPrimary, ...textTrim }}>
        Quantity: {product.quantity}
      </Text>
      {product.images.length > 0 ? (
        <Text style={{ marginTop: 4, fontSize: 11, color: colors.textMuted, ...textTrim }}>
          {product.images.length} image{product.images.length === 1 ? '' : 's'} in gallery above
        </Text>
      ) : null}
    </View>
  );
}

export function OrderDetailScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const { order, customer } = useRoute<Rt>().params;

  const images = useMemo(() => collectOrderImages(order), [order]);
  const customerName = customer?.customerName?.trim() || '—';
  const customerMobile = customer?.customerMobile?.trim() || '—';
  const customerCountry = customer?.customerCountry?.trim() || '—';
  const customerCity = customer?.customerCity?.trim() || '—';
  const customerArea = customer?.customerArea?.trim() || '—';

  React.useEffect(() => {
    analytics.track('orders_detail_viewed', { orderId: order.orderId });
  }, [order.orderId]);

  const textTrim =
    Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ width: 40, paddingVertical: spacing.xs }}
        >
          <Ionicons name="chevron-back" size={22} color="rgba(0,0,0,0.7)" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, ...textTrim }}>
            Order details
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.pageMuted }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <OrderImageGallery images={images} />

        {images.length === 0 ? (
          <View
            style={{
              marginHorizontal: spacing.md,
              marginTop: spacing.md,
              padding: spacing.lg,
              borderRadius: radii.md,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
            <Text style={{ marginTop: spacing.sm, fontSize: 12, color: colors.textMuted, ...textTrim }}>
              No product images for this order
            </Text>
          </View>
        ) : null}

        <DetailCard title="Order summary">
          <DetailRow label="Order ID" value={String(order.orderId)} />
          <DetailRow label="Status" value={statusDisplayUpper(order.orderStatus)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialIcons name="account-balance-wallet" size={16} color={colors.brand} />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                fontWeight: '700',
                color: colors.brand,
                ...textTrim,
              }}
            >
              {order.orderTotalAmount} {order.currencyCode}
            </Text>
          </View>
        </DetailCard>

        <DetailCard title="Delivery details">
          <DetailRow label="Customer" value={customerName} />
          <DetailRow label="Mobile" value={customerMobile} />
          <DetailRow label="Country" value={customerCountry} />
          <DetailRow label="City" value={customerCity} />
          <DetailRow label="Area" value={customerArea} />
        </DetailCard>

        <DetailCard title={`Items (${order.products.length})`}>
          {order.products.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted, ...textTrim }}>
              No line items for this order.
            </Text>
          ) : (
            order.products.map((product, index) => (
              <ProductDetailRow key={`${product.productSku}-${index}`} product={product} index={index} />
            ))
          )}
        </DetailCard>
      </ScrollView>
    </SafeAreaView>
  );
}

export default OrderDetailScreen;
