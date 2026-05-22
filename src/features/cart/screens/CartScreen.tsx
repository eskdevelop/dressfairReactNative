import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import {
  removeCartLineAndPersist,
  removeSelectedCartLinesAndPersist,
  toggleCartLineSelectedAndPersist,
  toggleSelectAllForCheckoutAndPersist,
} from '@features/cart/cartActions';
import { CartCheckoutBar } from '@features/cart/components/CartCheckoutBar';
import { CartCheckbox } from '@features/cart/components/CartCheckbox';
import { CartEmptyState } from '@features/cart/components/CartEmptyState';
import { CartLineItemRow } from '@features/cart/components/CartLineItemRow';
import {
  CartNewArrivalsSection,
  type CartNewArrivalsSectionHandle,
} from '@features/cart/components/CartNewArrivalsSection';
import { CartPromoBanner } from '@features/cart/components/CartPromoBanner';
import { CartTrustBadgesRow } from '@features/cart/components/CartTrustBadgesRow';
import { ManageCartSheet } from '@features/cart/components/ManageCartSheet';
import { PriceDetailsCartSheet } from '@features/cart/components/PriceDetailsCartSheet';
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

  const shippingConfig = useMemo(
    () => parseShippingConfigFromStore(storeShippingAmount, storeFreeShippingLimit, country),
    [country, storeFreeShippingLimit, storeShippingAmount],
  );

  const [manageVisible, setManageVisible] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  const onToggleSelect = useCallback(
    (lineKey: string) => {
      void toggleCartLineSelectedAndPersist(dispatch, country, lineKey, items);
    },
    [country, dispatch, items],
  );

  const onToggleAll = useCallback(() => {
    void toggleSelectAllForCheckoutAndPersist(dispatch, country, items);
  }, [country, dispatch, items]);

  const onRemove = useCallback(
    (lineKey: string) => {
      void removeCartLineAndPersist(dispatch, country, lineKey, items);
    },
    [country, dispatch, items],
  );

  const onRemoveSelected = useCallback(() => {
    const selectedCount = items.filter(row => row.isSelected).length;
    if (selectedCount === 0) {
      Alert.alert('', 'Please select items to remove.');
      return;
    }
    void removeSelectedCartLinesAndPersist(dispatch, country, items).then(() => {
      setManageVisible(false);
    });
  }, [country, dispatch, items]);

  const onCheckout = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('', 'Please add items to cart first.');
      return;
    }
    if (!hasSelectedCartItems(items)) {
      Alert.alert('', 'Please select products to checkout.');
      return;
    }
    setPriceSheetVisible(false);
    analytics.track('cart_native_checkout_tap');
    navigation.navigate('StorefrontCheckoutWeb');
  }, [items, navigation]);

  const selectedSubtotal = selectedTotalPrice(items);
  const selectedNormalSubtotal = selectedTotalNormalPrice(items);
  const checkoutTotal = totalWithShippingCharges(selectedSubtotal, shippingConfig);
  const selectedCount = items.filter(row => row.isSelected).length;
  const allSelected = isAllCartSelectedForCheckout(items);
  const showStrike =
    selectedNormalSubtotal > 0 && Math.abs(selectedNormalSubtotal - checkoutTotal) > 0.009;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}
      >
        {items.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 90 }}>
            <CartCheckbox checked={allSelected} onPress={onToggleAll} />
            <Text style={{ marginLeft: 2, fontSize: 14, color: '#111' }}>All</Text>
          </View>
        ) : (
          <View style={{ width: 90 }} />
        )}

        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '500',
            color: colors.textPrimary,
          }}
        >
          Cart{items.length > 0 ? ` (${items.length})` : ''}
        </Text>

        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setManageVisible(true)}
            hitSlop={8}
            style={{ width: 90, alignItems: 'flex-end', paddingRight: spacing.sm }}
          >
            <Ionicons name="menu" size={22} color="rgba(0,0,0,0.8)" />
          </Pressable>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => newArrivalsRef.current?.onParentScroll(e.nativeEvent)}
      >
        <View style={{ height: spacing.md }} />
        <CartPromoBanner />
        <View style={{ height: spacing.lg }} />

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          items.map((row, index) => (
            <View key={row.lineKey}>
              <CartLineItemRow
                row={row}
                currency={currency}
                cdnBase={cfg.customerAvatarCdnBaseUrl}
                onToggleSelect={onToggleSelect}
                onRemove={onRemove}
              />
              {index < items.length - 1 ? (
                <View
                  style={{ height: 1, backgroundColor: '#D1D5DB', marginHorizontal: spacing.md }}
                />
              ) : null}
            </View>
          ))
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

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <CartCheckoutBar
          currency={currency}
          total={checkoutTotal}
          strikeTotal={showStrike ? selectedNormalSubtotal : null}
          selectedCount={selectedCount}
          isSheetOpen={priceSheetVisible}
          onTogglePriceSheet={() => {
            if (items.length === 0) return;
            setPriceSheetVisible(v => !v);
          }}
          onCheckout={onCheckout}
        />
      </View>

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
        items={items}
        currency={currency}
        cdnBase={cfg.customerAvatarCdnBaseUrl}
        shippingConfig={shippingConfig}
        onClose={() => setPriceSheetVisible(false)}
        onCheckout={onCheckout}
      />
    </SafeAreaView>
  );
}
