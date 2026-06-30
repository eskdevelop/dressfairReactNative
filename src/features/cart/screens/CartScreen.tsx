import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import {
  deselectUnavailableCartLines,
  removeCartLineAndPersist,
  removeSelectedCartLinesAndPersist,
  toggleCartLineSelectedAndPersist,
  toggleSelectAllInStockForCheckoutAndPersist,
  updateCartLineQuantityWithStockCheck,
} from '@features/cart/cartActions';
import {
  fetchAvailableQuantityForCartLine,
  partitionCartLinesByStock,
} from '@features/cart/cartStock';
import { CartCheckoutBar } from '@features/cart/components/CartCheckoutBar';
import { CartCheckbox } from '@features/cart/components/CartCheckbox';
import { CartEmptyState } from '@features/cart/components/CartEmptyState';
import { CartLineItemRow } from '@features/cart/components/CartLineItemRow';
import { CartUnavailableLineItemRow } from '@features/cart/components/CartUnavailableLineItemRow';
import {
  CartNewArrivalsSection,
  type CartNewArrivalsSectionHandle,
} from '@features/cart/components/CartNewArrivalsSection';
import { CartPromoBanner } from '@features/cart/components/CartPromoBanner';
import { CartTrustBadgesRow } from '@features/cart/components/CartTrustBadgesRow';
import { ManageCartSheet } from '@features/cart/components/ManageCartSheet';
import { PriceDetailsCartSheet } from '@features/cart/components/PriceDetailsCartSheet';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';
import { useAppToast } from '@shared/ui/AppToast';
import {
  parseShippingConfigFromStore,
  selectedTotalNormalPrice,
  selectedTotalPrice,
  totalWithShippingCharges,
} from '@features/cart/cartPricing';
import { selectCartItems } from '@features/cart/cartSlice';
import {
  hasSelectedCartItems,
  isAllCartSelectedForCheckout,
} from '@features/cart/parseWebCartItems';
import type { RootStackParamList } from '@navigation/types';
import { getEnvConfig, type CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

function CartSectionDivider(): React.ReactElement {
  return <View style={{ height: 8, backgroundColor: '#F5F5F5' }} />;
}

function CartListDivider(): React.ReactElement {
  return (
    <View
      style={{ height: 1, backgroundColor: '#F0F0F0', marginHorizontal: spacing.md }}
    />
  );
}

export function CartScreen(): React.ReactElement {
  const navigation = useNavigation<RootNav>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const storeShippingAmount = useAppSelector(s => s.app.storeShippingAmount);
  const storeFreeShippingLimit = useAppSelector(s => s.app.storeFreeShippingLimit);
  const items = useAppSelector(selectCartItems);
  const cfg = getEnvConfig(country);
  const currency = storeCurrencyCode || 'AED';
  const newArrivalsRef = useRef<CartNewArrivalsSectionHandle | null>(null);
  const { show: showToast, ToastHost } = useAppToast(112);

  const shippingConfig = useMemo(
    () => parseShippingConfigFromStore(storeShippingAmount, storeFreeShippingLimit, country),
    [country, storeFreeShippingLimit, storeShippingAmount],
  );

  const [manageVisible, setManageVisible] = React.useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = React.useState(false);
  const [bulkRemoveConfirm, setBulkRemoveConfirm] = React.useState(false);
  const [stockByLineKey, setStockByLineKey] = React.useState<Record<string, number>>({});

  const { available: availableItems, unavailable: unavailableItems, stockLoaded } =
    useMemo(() => partitionCartLinesByStock(items, stockByLineKey), [items, stockByLineKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const pairs = await Promise.all(
        items.map(async row => {
          const available = await fetchAvailableQuantityForCartLine(row, {
            forceRefresh: true,
          });
          return [row.lineKey, available] as const;
        }),
      );
      if (!cancelled) {
        setStockByLineKey(Object.fromEntries(pairs));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    if (!stockLoaded) return;
    void deselectUnavailableCartLines(dispatch, country, items, stockByLineKey);
  }, [country, dispatch, items, stockByLineKey, stockLoaded]);

  const onToggleSelect = useCallback(
    (lineKey: string) => {
      void toggleCartLineSelectedAndPersist(dispatch, country, lineKey, items);
    },
    [country, dispatch, items],
  );

  const onToggleAll = useCallback(() => {
    if (availableItems.length === 0) return;
    void toggleSelectAllInStockForCheckoutAndPersist(
      dispatch,
      country,
      items,
      availableItems.map(r => r.lineKey),
    );
  }, [availableItems, country, dispatch, items]);

  const onRemove = useCallback(
    (lineKey: string) => {
      void removeCartLineAndPersist(dispatch, country, lineKey, items).then(() => {
        showToast('Removed from cart');
      });
    },
    [country, dispatch, items, showToast],
  );

  const onQuantityChange = useCallback(
    (lineKey: string, quantity: number) => {
      const prevQty = items.find(r => r.lineKey === lineKey)?.quantity ?? 0;
      void (async () => {
        const result = await updateCartLineQuantityWithStockCheck(
          dispatch,
          country,
          lineKey,
          quantity,
          items,
        );
        if (result.ok) {
          setStockByLineKey(prev => ({ ...prev, [lineKey]: result.available }));
          if (result.quantity > prevQty) {
            showToast(`Quantity increased to ${result.quantity}`);
          } else if (result.quantity < prevQty) {
            showToast(`Quantity decreased to ${result.quantity}`);
          } else {
            showToast(`Quantity updated to ${result.quantity}`);
          }
          return;
        }
        if (result.reason === 'out_of_stock') {
          showToast('This item is out of stock');
          return;
        }
        if (result.reason === 'exceeds_stock') {
          showToast(
            result.available === 1
              ? 'Only 1 item available in stock'
              : `Only ${result.available} items available in stock`,
          );
        }
      })();
    },
    [country, dispatch, items, showToast],
  );

  const onRemoveSelected = useCallback(() => {
    const selectedCount = items.filter(row => row.isSelected).length;
    if (selectedCount === 0) {
      Alert.alert('', 'Please select items to remove.');
      return;
    }
    setManageVisible(false);
    setBulkRemoveConfirm(true);
  }, [items]);

  const confirmBulkRemove = useCallback(() => {
    setBulkRemoveConfirm(false);
    void removeSelectedCartLinesAndPersist(dispatch, country, items).then(() => {
      setManageVisible(false);
      showToast('Selected items removed from cart');
    });
  }, [country, dispatch, items, showToast]);

  const onCheckout = useCallback(() => {
    if (availableItems.length === 0 && unavailableItems.length > 0) {
      Alert.alert('', 'All items in your cart are out of stock.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('', 'Please add items to cart first.');
      return;
    }
    if (!hasSelectedCartItems(availableItems)) {
      Alert.alert('', 'Please select products to checkout.');
      return;
    }
    setPriceSheetVisible(false);
    analytics.track('cart_native_checkout_tap');
    navigation.navigate('Checkout');
  }, [availableItems, items.length, navigation, unavailableItems.length]);

  const selectedSubtotal = selectedTotalPrice(availableItems);
  const selectedNormalSubtotal = selectedTotalNormalPrice(availableItems);
  const checkoutTotal = totalWithShippingCharges(selectedSubtotal, shippingConfig);
  const selectedCount = availableItems.filter(row => row.isSelected).length;
  const bulkRemoveCount = items.filter(row => row.isSelected).length;
  const allSelected =
    availableItems.length > 0 && isAllCartSelectedForCheckout(availableItems);
  const showStrike =
    selectedNormalSubtotal > 0 && Math.abs(selectedNormalSubtotal - checkoutTotal) > 0.009;

  const renderAvailableList = (): React.ReactElement => (
    <>
      {availableItems.map((row, index) => (
        <View key={row.lineKey}>
          <CartLineItemRow
            row={row}
            currency={currency}
            cdnBase={cfg.customerAvatarCdnBaseUrl}
            onToggleSelect={onToggleSelect}
            onRemove={onRemove}
            onQuantityChange={onQuantityChange}
          />
          {index < availableItems.length - 1 ? <CartListDivider /> : null}
        </View>
      ))}
    </>
  );

  const renderUnavailableSection = (): React.ReactElement | null => {
    if (unavailableItems.length === 0) return null;
    return (
      <>
        <CartSectionDivider />
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xs,
            backgroundColor: '#FAFAFA',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
            Unavailable
          </Text>
          <Text style={{ marginTop: 2, fontSize: 11, color: colors.textMuted }}>
            {unavailableItems.length} item{unavailableItems.length === 1 ? '' : 's'} out of stock —
            remove to continue
          </Text>
        </View>
        {unavailableItems.map((row, index) => (
          <View key={row.lineKey}>
            <CartUnavailableLineItemRow
              row={row}
              currency={currency}
              cdnBase={cfg.customerAvatarCdnBaseUrl}
              onRemove={onRemove}
            />
            {index < unavailableItems.length - 1 ? <CartListDivider /> : null}
          </View>
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {items.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            Cart
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: '#FFFFFF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 90 }}>
            <CartCheckbox
              checked={allSelected}
              onPress={onToggleAll}
            />
            <Text style={{ marginLeft: 6, fontSize: 13, color: '#555', fontWeight: '500' }}>All</Text>
          </View>

          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            Cart ({items.length})
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setManageVisible(true)}
            hitSlop={8}
            style={{ width: 90, alignItems: 'flex-end', paddingRight: spacing.sm }}
          >
            <Ionicons name="menu" size={22} color="rgba(0,0,0,0.8)" />
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: items.length > 0 ? 100 : spacing.xl }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => newArrivalsRef.current?.onParentScroll(e.nativeEvent)}
      >
        <CartPromoBanner />
        <View style={{ height: spacing.md }} />

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <>
            {renderAvailableList()}
            {renderUnavailableSection()}
          </>
        )}

        <CartSectionDivider />
        <CartTrustBadgesRow />
        <CartSectionDivider />

        <CartNewArrivalsSection
          ref={newArrivalsRef}
          navigation={navigation}
          country={country}
          storeCurrencyCode={currency}
        />
      </ScrollView>

      {items.length > 0 ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <CartCheckoutBar
            currency={currency}
            total={checkoutTotal}
            strikeTotal={showStrike ? selectedNormalSubtotal : null}
            selectedCount={selectedCount}
            isSheetOpen={priceSheetVisible}
            onTogglePriceSheet={() => setPriceSheetVisible(v => !v)}
            onCheckout={onCheckout}
          />
        </View>
      ) : null}

      <ToastHost />

      <ManageCartSheet
        visible={manageVisible}
        items={items}
        currency={currency}
        cdnBase={cfg.customerAvatarCdnBaseUrl}
        onClose={() => setManageVisible(false)}
        onToggleItem={onToggleSelect}
        onToggleAll={onToggleAll}
        onRemoveSelected={onRemoveSelected}
      />

      <PriceDetailsCartSheet
        visible={priceSheetVisible}
        items={availableItems}
        currency={currency}
        cdnBase={cfg.customerAvatarCdnBaseUrl}
        shippingConfig={shippingConfig}
        onClose={() => setPriceSheetVisible(false)}
        onCheckout={onCheckout}
      />

      <AppDeleteDialog
        visible={bulkRemoveConfirm}
        message={`Remove ${bulkRemoveCount} selected item${bulkRemoveCount === 1 ? '' : 's'} from your cart?`}
        confirmLabel="Remove items"
        onConfirm={confirmBulkRemove}
        onCancel={() => setBulkRemoveConfirm(false)}
      />
    </SafeAreaView>
  );
}
