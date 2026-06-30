import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, radii } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

import { statusDisplayUpper } from './orderStatusPartition';
import type { Order, OrderCustomer, OrderProduct } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  order: Order;
  customer?: OrderCustomer;
};

const ID_GREY = '#616161';

function ProductBlock({
  product,
  productIndex,
  productsLength,
  order,
}: {
  product: OrderProduct;
  productIndex: number;
  productsLength: number;
  order: Order;
}): React.ReactElement {
  const isLast = productIndex === productsLength - 1;

  return (
    <View style={{ paddingVertical: 8 }}>
      {product.images.length > 0 ? (
        <FlatList
          data={product.images}
          horizontal
          keyExtractor={(img, i) => String(img.id ?? i)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: img }) => (
            <View style={{ marginRight: 8 }}>
              <Image
                source={{ uri: img.url }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: radii.sm,
                  backgroundColor: '#E5E7EB',
                }}
                resizeMode="cover"
              />
            </View>
          )}
        />
      ) : null}

      <Text
        style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: '600',
          color: colors.textPrimary,
        }}
        numberOfLines={2}
      >
        {product.productName}
      </Text>

      {isLast ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.textPrimary }}>Qty: {product.quantity}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="account-balance-wallet" size={14} color={colors.brand} />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 11,
                fontWeight: '600',
                color: colors.brand,
              }}
            >
              {order.orderTotalAmount} {order.currencyCode}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 8,
          height: StyleSheet.hairlineWidth,
          backgroundColor: '#D1D5DB',
        }}
      />
    </View>
  );
}

export function OrderTrackCard({ order, customer }: Props): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [expanded, setExpanded] = useState(false);
  const customerName = customer?.customerName?.trim() || '-';
  const area = customer?.customerArea?.trim() || '-';
  const city = customer?.customerCity?.trim() || '-';

  const toggle = useCallback(() => {
    setExpanded(e => !e);
  }, []);

  const openDetails = useCallback(() => {
    analytics.track('orders_detail_opened', { orderId: order.orderId });
    navigation.navigate('OrderDetail', { order, customer });
  }, [customer, navigation, order]);

  const products = order.products;
  const textTrim =
    Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : undefined;

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Pressable onPress={toggle}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text
              style={{
                color: colors.brand,
                fontSize: 12,
                fontWeight: '700',
                ...textTrim,
              }}
            >
              {statusDisplayUpper(order.orderStatus)}
            </Text>
            <Text style={{ fontSize: 10, color: ID_GREY, ...textTrim }}>ID: {order.orderId}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text
              style={{ flex: 1, fontSize: 11, color: colors.textPrimary, ...textTrim }}
              numberOfLines={1}
            >
              <Text style={{ fontWeight: '400' }}>Customer: </Text>
              <Text style={{ fontWeight: '700' }}>{customerName}</Text>
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
              style={{ marginLeft: 8 }}
            />
          </View>

          <Text
            style={{ marginTop: 2, fontSize: 10, color: ID_GREY, ...textTrim }}
            numberOfLines={1}
          >
            Address: {area}, {city}
          </Text>
        </View>
      </Pressable>

      {expanded && products.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {products.map((product, productIndex) => (
            <ProductBlock
              key={`${order.orderId}-${product.productSku}-${productIndex}`}
              product={product}
              productIndex={productIndex}
              productsLength={products.length}
              order={order}
            />
          ))}
        </View>
      ) : null}

      {expanded && products.length === 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>No line items for this order.</Text>
        </View>
      ) : null}

      <Pressable
        onPress={openDetails}
        accessibilityRole="button"
        accessibilityLabel="Show order details"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: colors.brand,
            textAlign: 'center',
            ...textTrim,
          }}
        >
          Show details
        </Text>
      </Pressable>
    </View>
  );
}
