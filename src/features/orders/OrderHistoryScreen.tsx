import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { fetchOrderHistory } from './ordersApi';
import type { Order, OrderCustomer, OrderStatusFilter } from './types';

type Status = 'idle' | 'loading' | 'success' | 'error';

const FILTERS: { id: OrderStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
];

// Map a free-text order status (Pending / Processing / Shipped / Delivered /
// Cancelled / Complete / etc.) to a stable bucket plus a colour. Anything we
// don't recognise renders neutral so the screen never crashes on a new
// status the backend introduces.
const statusBucket = (raw: string): { kind: 'pending' | 'completed' | 'cancelled' | 'other'; tint: string } => {
  const lower = raw.toLowerCase();
  if (
    lower.includes('cancel') ||
    lower.includes('refund') ||
    lower.includes('void') ||
    lower.includes('failed')
  ) {
    return { kind: 'cancelled', tint: colors.danger };
  }
  if (
    lower.includes('complete') ||
    lower.includes('deliver') ||
    lower.includes('shipped') ||
    lower.includes('paid') ||
    lower.includes('success')
  ) {
    return { kind: 'completed', tint: colors.success };
  }
  if (
    lower.includes('pend') ||
    lower.includes('process') ||
    lower.includes('await') ||
    lower.includes('hold')
  ) {
    return { kind: 'pending', tint: colors.brand };
  }
  return { kind: 'other', tint: colors.textMuted };
};

export function OrderHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isAuthenticated = useAppSelector(state => state.app.isAuthenticated);

  const [status, setStatus] = useState<Status>('idle');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<OrderCustomer | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await fetchOrderHistory();
      if (!result.success) {
        setStatus('error');
        setErrorMessage(
          result.message && result.message.length > 0
            ? result.message
            : 'Unable to load your orders right now.',
        );
        return;
      }
      setOrders(result.orders);
      setCustomer(result.customer);
      setStatus('success');
      analytics.track('orders_loaded', { count: result.orders.length });
    } catch (error) {
      crashReporter.capture(error, { source: 'OrderHistoryScreen.load' });
      setStatus('error');
      setErrorMessage('Unable to load your orders. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }, [loadOrders]);

  const onSignIn = useCallback(() => {
    analytics.track('orders_sign_in_pressed');
    // The storefront serves login as a modal triggered from the header
    // button, not a dedicated `/login` page. Land the user on Home so they
    // can tap "Sign in / Register" — once they finish, the WebView bridge
    // emits the auth message that flips `isAuthenticated` and this screen
    // reloads the orders automatically.
    openWebPath('/');
  }, []);

  const onOpenOrder = useCallback(
    (order: Order) => {
      analytics.track('orders_item_opened', { orderId: order.orderId });
      // Storefront convention: /account/order-info/<id> on OpenCart. Any
      // path the storefront actually exposes works — adjust here if your
      // theme uses a different route (e.g. /account/order/<id>).
      openWebPath(`/account/order-info/${order.orderId}`);
    },
    [],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => {
      const bucket = statusBucket(order.orderStatus).kind;
      if (filter === 'pending') return bucket === 'pending';
      if (filter === 'completed') return bucket === 'completed';
      return true;
    });
  }, [filter, orders]);

  const renderHeader = () => (
    <View>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
        }}
      >
        {customer?.customerName ? (
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            Hi {customer.customerName}
          </Text>
        ) : null}
        {customer?.customerMobile ? (
          <Text
            style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}
          >
            +{customer.customerMobile}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          gap: spacing.sm,
        }}
      >
        {FILTERS.map(item => {
          const active = filter === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              onPress={() => setFilter(item.id)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: active ? colors.brand : colors.border,
                backgroundColor: active ? colors.brand : '#FFFFFF',
              }}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : colors.textPrimary,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Order }) => {
    const bucket = statusBucket(item.orderStatus);
    const previewImages = item.products
      .flatMap(product => product.images)
      .slice(0, 3);
    const itemCount = item.products.reduce(
      (acc, product) => acc + (Number.isFinite(product.quantity) ? product.quantity : 0),
      0,
    );
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Order ${item.orderId}, ${item.orderStatus}`}
        onPress={() => onOpenOrder(item)}
        style={{
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          padding: spacing.md,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: '#FFFFFF',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '700',
              fontSize: 14,
            }}
          >
            Order #{item.orderId}
          </Text>
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: radii.pill,
              backgroundColor: `${bucket.tint}1A`,
            }}
          >
            <Text
              style={{ color: bucket.tint, fontSize: 11, fontWeight: '700' }}
            >
              {item.orderStatus}
            </Text>
          </View>
        </View>
        {item.products.length > 0 ? (
          <Text
            numberOfLines={1}
            style={{
              color: colors.textPrimary,
              marginTop: spacing.xs,
              fontSize: 13,
            }}
          >
            {item.products[0].productName}
            {item.products.length > 1
              ? ` and ${item.products.length - 1} more`
              : ''}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            marginTop: spacing.sm,
            gap: spacing.xs,
          }}
        >
          {previewImages.map((image, idx) => (
            <Image
              key={`${image.id ?? idx}-${idx}`}
              source={{ uri: image.url }}
              style={{
                width: 48,
                height: 48,
                borderRadius: radii.sm,
                backgroundColor: '#F3F4F6',
              }}
              resizeMode="cover"
            />
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.md,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {itemCount === 1 ? '1 item' : `${itemCount} items`}
          </Text>
          <Text
            style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14 }}
          >
            {item.currencyCode} {item.orderTotalAmount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
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
          style={{ padding: spacing.sm }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
            marginLeft: spacing.sm,
          }}
        >
          My orders
        </Text>
      </View>

      {!isAuthenticated ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons name="bag-handle-outline" size={48} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
              fontSize: 16,
            }}
          >
            Sign in to see your orders
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            Your orders, delivery status, and payment history will appear
            here once you sign in. Tap below to go to the home page and use
            the &ldquo;Sign in / Register&rdquo; button at the top.
          </Text>
          <TouchableOpacity
            onPress={onSignIn}
            accessibilityRole="button"
            testID="orders-sign-in"
            style={{
              marginTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radii.pill,
              backgroundColor: colors.brand,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              Go to home to sign in
            </Text>
          </TouchableOpacity>
        </View>
      ) : status === 'loading' && orders.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : status === 'error' && orders.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
            }}
          >
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => void loadOrders()}
            accessibilityRole="button"
            style={{
              marginTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
            }}
          >
            No orders yet
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            Start shopping and your orders will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.orderId)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                paddingVertical: spacing.xl,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.textMuted }}>
                No orders match the selected filter.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
