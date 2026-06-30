import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { openStorefrontLogin } from '@features/account/requireStorefrontLogin';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { fetchOrderHistory } from './ordersApi';
import { OrdersEmptyState } from './OrdersEmptyState';
import { OrderTrackCard } from './OrderTrackCard';
import {
  partitionOrdersForTrackTabs,
  shortcutToTrackTab,
  TRACK_TABS,
  type TrackTabId,
} from './orderStatusPartition';
import type { Order, OrderCustomer } from './types';

export function OrderHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderHistory'>>();
  const { width: windowWidth } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);

  const isAuthenticated = useAppSelector(state => state.app.isAuthenticated);
  const country = useAppSelector(state => state.app.country);

  const [fetchStatus, setFetchStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<OrderCustomer | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TrackTabId>('all');
  const activeTabRef = useRef<TrackTabId>(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    const shortcut = route.params?.shortcut;
    if (shortcut) {
      setActiveTab(shortcutToTrackTab(shortcut));
    }
  }, [route.params?.shortcut]);

  const loadOrders = useCallback(async () => {
    setFetchStatus('loading');
    setErrorMessage(null);
    try {
      const result = await fetchOrderHistory();
      if (!result.success) {
        setFetchStatus('error');
        setErrorMessage(
          result.message && result.message.length > 0
            ? result.message
            : 'Unable to load your orders right now.',
        );
        return;
      }
      setOrders(result.orders);
      setCustomer(result.customer);
      setFetchStatus('success');
      analytics.track('orders_loaded', { count: result.orders.length });
    } catch (error) {
      crashReporter.capture(error, { source: 'OrderHistoryScreen.load' });
      setFetchStatus('error');
      setErrorMessage('Unable to load your orders. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  const partition = useMemo(() => partitionOrdersForTrackTabs(orders), [orders]);

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
    openStorefrontLogin(country);
  }, [country]);

  /**
   * Show main shell (tabs + pager) whenever we are not in: unauthenticated,
   * initial loading spinner, or hard error with no data.
   */
  const showOrdersShell =
    isAuthenticated &&
    !(orders.length === 0 && (fetchStatus === 'idle' || fetchStatus === 'loading')) &&
    !(fetchStatus === 'error' && orders.length === 0);

  /** Sync pager when data loads or width changes. Swipe-driven `activeTab` changes are ignored (no deps on tab). */
  useLayoutEffect(() => {
    if (!showOrdersShell || fetchStatus !== 'success' || windowWidth <= 0) return;
    const i = TRACK_TABS.findIndex(t => t.id === activeTabRef.current);
    if (i < 0) return;
    pagerRef.current?.scrollTo({ x: i * windowWidth, animated: false });
  }, [showOrdersShell, fetchStatus, windowWidth]);

  const onTabPress = useCallback(
    (id: TrackTabId) => {
      const i = TRACK_TABS.findIndex(t => t.id === id);
      if (i < 0) return;
      setActiveTab(id);
      pagerRef.current?.scrollTo({ x: i * windowWidth, animated: true });
    },
    [windowWidth],
  );

  const onPagerMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / Math.max(1, windowWidth));
      const i = Math.max(0, Math.min(TRACK_TABS.length - 1, page));
      setActiveTab(TRACK_TABS[i].id);
    },
    [windowWidth],
  );

  const renderTrackTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        alignItems: 'center',
      }}
    >
      {TRACK_TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onTabPress(tab.id)}
            style={{
              marginHorizontal: 6,
              paddingHorizontal: 4,
              paddingTop: spacing.xs,
              paddingBottom: spacing.sm,
              alignItems: 'center',
              minWidth: 72,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: active ? colors.brand : colors.textSecondary,
                lineHeight: 18,
              }}
            >
              {tab.label}
            </Text>
            <View
              style={{
                marginTop: spacing.sm,
                height: 3,
                width: '100%',
                borderRadius: 2,
                backgroundColor: active ? colors.brand : 'transparent',
              }}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderHeaderBar = () => (
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
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          Your orders
        </Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );

  const androidText = Platform.OS === 'android' ? { includeFontPadding: false } : undefined;

  const renderOrderPage = (tabId: TrackTabId) => {
    const listData = partition[tabId];
    const tabLabel = TRACK_TABS.find(t => t.id === tabId)?.label ?? 'orders';
    return (
      <View style={{ width: windowWidth, flex: 1 }} key={tabId}>
        <FlatList
          data={listData}
          keyExtractor={item => String(item.orderId)}
          renderItem={({ item }) => <OrderTrackCard order={item} customer={customer} />}
          contentContainerStyle={
            listData.length === 0
              ? { flexGrow: 1 }
              : {
                  paddingHorizontal: 12,
                  paddingTop: 12,
                  paddingBottom: spacing.xl,
                }
          }
          nestedScrollEnabled
          ListEmptyComponent={<OrdersEmptyState tabId={tabId} tabLabel={tabLabel} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {renderHeaderBar()}
      {!isAuthenticated ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
            backgroundColor: colors.pageMuted,
          }}
        >
          <Ionicons name="bag-handle-outline" size={48} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
              fontSize: 16,
              ...androidText,
            }}
          >
            Sign in to see your orders
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.xs,
              ...androidText,
            }}
          >
            Your orders, delivery status, and payment history will appear here once you sign in. Tap
            below to open sign in.
          </Text>
          <TouchableOpacity
            onPress={onSignIn}
            accessibilityRole="button"
            testID="orders-sign-in"
            style={{
              marginTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: 999,
              backgroundColor: colors.brand,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', ...androidText }}>
              Go to home to sign in
            </Text>
          </TouchableOpacity>
        </View>
      ) : isAuthenticated &&
        orders.length === 0 &&
        (fetchStatus === 'idle' || fetchStatus === 'loading') ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.pageMuted,
          }}
        >
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : fetchStatus === 'error' && orders.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
            backgroundColor: colors.pageMuted,
          }}
        >
          <Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
              textAlign: 'center',
              ...androidText,
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
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600', ...androidText }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.pageMuted }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {renderTrackTabs()}
          </View>
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            onMomentumScrollEnd={onPagerMomentumEnd}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            {TRACK_TABS.map(tab => renderOrderPage(tab.id))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
