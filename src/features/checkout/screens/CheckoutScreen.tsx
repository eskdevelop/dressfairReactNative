import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { fetchCustomerProfile } from '@features/account/customerApi';
import { openStorefrontLogin } from '@features/account/requireStorefrontLogin';
import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import { removeSelectedCartLinesAfterOrder } from '@features/cart/cartActions';
import { parseShippingConfigFromStore } from '@features/cart/cartPricing';
import { selectCartItems } from '@features/cart/cartSlice';
import {
  buildPlaceOrderBody,
  getDefaultAddress,
  isCashOnDeliveryMethod,
  isProfileCompleteForCheckout,
} from '@features/checkout/buildPlaceOrderBody';
import { fetchPaymentMethods, placeOrder } from '@features/checkout/checkoutApi';
import { CheckoutAddressSection } from '@features/checkout/components/CheckoutAddressSection';
import { CheckoutAddressSheet } from '@features/checkout/components/CheckoutAddressSheet';
import {
  CheckoutDottedDivider,
  CheckoutSolidDivider,
} from '@features/checkout/components/CheckoutDottedDivider';
import { CheckoutItemDetailsSection } from '@features/checkout/components/CheckoutItemDetailsSection';
import { CheckoutItemDetailsSheet } from '@features/checkout/components/CheckoutItemDetailsSheet';
import { CheckoutOrderSummary } from '@features/checkout/components/CheckoutOrderSummary';
import { CheckoutPaymentMethodsSection } from '@features/checkout/components/CheckoutPaymentMethodsSection';
import { CheckoutPriceDetailsSheet } from '@features/checkout/components/CheckoutPriceDetailsSheet';
import { CheckoutShippingInfo } from '@features/checkout/components/CheckoutShippingInfo';
import { CheckoutSubmitBar } from '@features/checkout/components/CheckoutSubmitBar';
import { CheckoutTrustBlocks } from '@features/checkout/components/CheckoutTrustBlocks';
import {
  checkShipping,
  selectedCartLines,
  selectedDiscount,
  selectedTotalNormalPrice,
  selectedTotalPrice,
  totalWithShippingCharges,
} from '@features/checkout/checkoutPricing';
import type { CheckoutPaymentMethod } from '@features/checkout/types';
import type { RootStackParamList } from '@navigation/types';
import { useTabBarBottomInset } from '@navigation/useTabBarBottomInset';
import { getEnvConfig, type CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppActionDialog } from '@shared/ui/AppActionDialog';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type CheckoutGateDialog = {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  confirmLabel: string;
  hideCancel?: boolean;
  onConfirm: () => void;
};

export function CheckoutScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const bottomInset = useTabBarBottomInset();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const storeShippingAmount = useAppSelector(s => s.app.storeShippingAmount);
  const storeFreeShippingLimit = useAppSelector(s => s.app.storeFreeShippingLimit);
  const allItems = useAppSelector(selectCartItems);
  const selectedItems = useMemo(() => selectedCartLines(allItems), [allItems]);
  const cfg = getEnvConfig(country);
  const currency = storeCurrencyCode || 'AED';

  const shippingConfig = useMemo(
    () => parseShippingConfigFromStore(storeShippingAmount, storeFreeShippingLimit, country),
    [country, storeFreeShippingLimit, storeShippingAmount],
  );

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddressRecord | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);
  const [itemDetailsSheetVisible, setItemDetailsSheetVisible] = useState(false);
  const [gateDialog, setGateDialog] = useState<CheckoutGateDialog | null>(null);

  const closeGateDialog = useCallback(() => setGateDialog(null), []);

  const itemsSaleTotal = selectedTotalPrice(allItems);
  const itemsNormalTotal = selectedTotalNormalPrice(allItems);
  const discount = selectedDiscount(allItems);
  const shipping = checkShipping(itemsSaleTotal, shippingConfig);
  const orderTotal = totalWithShippingCharges(itemsSaleTotal, shippingConfig);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetchCustomerProfile();
      if (res.ok) {
        setProfile(res.profile);
        setDefaultAddress(getDefaultAddress(res.profile));
      } else {
        setProfile(null);
        setDefaultAddress(null);
      }
    } catch {
      setProfile(null);
      setDefaultAddress(null);
    }
  }, []);

  const loadPaymentMethods = useCallback(async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await fetchPaymentMethods();
      if (res.ok && res.methods.length > 0) {
        setPaymentMethods(res.methods);
        setSelectedPaymentId(res.methods[0]!.id);
      } else {
        setPaymentMethods([]);
        setSelectedPaymentId(null);
        setPaymentError(
          res.message ??
            (res.ok ? 'No payment methods available' : 'Failed to load payment methods'),
        );
      }
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
      void loadPaymentMethods();
    }, [loadProfile, loadPaymentMethods]),
  );

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigation.goBack();
    }
  }, [navigation, selectedItems.length]);

  const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentId) ?? null;

  const submitOrder = useCallback(async () => {
    if (!isAuthenticated) {
      setGateDialog({
        title: 'Sign in to continue',
        message: 'Log in to place your order and track deliveries on Dress Fair.',
        icon: 'log-in-outline',
        confirmLabel: 'Log in',
        onConfirm: () => {
          closeGateDialog();
          openStorefrontLogin(country);
        },
      });
      return;
    }
    if (!defaultAddress) {
      setGateDialog({
        title: 'Add delivery address',
        message: 'Please add a shipping address before placing your order.',
        icon: 'location-outline',
        confirmLabel: 'Add address',
        onConfirm: () => {
          closeGateDialog();
          setAddressSheetVisible(true);
        },
      });
      return;
    }
    if (!profile || !isProfileCompleteForCheckout(profile)) {
      setGateDialog({
        title: 'Complete your profile',
        message: 'Update your profile details so we can process your order smoothly.',
        icon: 'person-outline',
        confirmLabel: 'Edit profile',
        onConfirm: () => {
          closeGateDialog();
          if (profile) navigation.navigate('ProfileEdit', { profile });
        },
      });
      return;
    }
    if (!selectedPayment) {
      setGateDialog({
        title: 'Select payment method',
        message: 'Choose how you would like to pay for this order.',
        icon: 'card-outline',
        confirmLabel: 'Got it',
        hideCancel: true,
        onConfirm: closeGateDialog,
      });
      return;
    }

    const body = buildPlaceOrderBody({
      profile,
      address: defaultAddress,
      items: allItems,
      paymentMethod: selectedPayment,
      shippingConfig,
    });

    setSubmitting(true);
    analytics.track('checkout_native_submit_tap');
    const result = await placeOrder(body);
    setSubmitting(false);

    if (!result.ok) {
      setGateDialog({
        title: 'Could not place order',
        message: result.message,
        icon: 'alert-circle-outline',
        confirmLabel: 'Try again',
        hideCancel: true,
        onConfirm: closeGateDialog,
      });
      return;
    }

    setPriceSheetVisible(false);
    setItemDetailsSheetVisible(false);

    // Card / online methods return a hosted Stripe Checkout URL: the order is
    // not paid yet, so keep the cart and send the user to the payment WebView.
    // The cart is cleared and OrderSuccess shown only after payment completes.
    // COD is always final on placement and uses the native success flow below,
    // even if the backend includes a checkout_url in its response.
    if (result.checkoutUrl && !isCashOnDeliveryMethod(selectedPayment)) {
      analytics.track('checkout_card_payment_open', { order_id: result.orderId });
      navigation.replace('CardPaymentWeb', {
        checkoutUrl: result.checkoutUrl,
        orderId: result.orderId,
      });
      return;
    }

    // Cash on Delivery (and any method without a payment URL): order is final.
    await removeSelectedCartLinesAfterOrder(dispatch, country, allItems);
    analytics.track('checkout_native_order_success', { order_id: result.orderId });
    navigation.replace('OrderSuccess', { orderId: result.orderId });
  }, [
    allItems,
    closeGateDialog,
    country,
    defaultAddress,
    dispatch,
    isAuthenticated,
    navigation,
    profile,
    selectedPayment,
    shippingConfig,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
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
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '500',
            color: colors.textPrimary,
            marginRight: 28,
          }}
        >
          Check out ({selectedItems.length})
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <CheckoutAddressSection
          profile={profile}
          address={defaultAddress}
          isAuthenticated={isAuthenticated}
          country={country}
          onPress={() => setAddressSheetVisible(true)}
          onAddAddress={() => {
            if (profile) {
              navigation.navigate('AddressForm', {
                mode: 'add',
                profileMobile: profile.mobile,
                profileFirstname: profile.firstname,
                profileLastname: profile.lastname,
              });
            } else {
              setAddressSheetVisible(true);
            }
          }}
        />
        <CheckoutItemDetailsSection
          items={selectedItems}
          currency={currency}
          cdnBase={cfg.customerAvatarCdnBaseUrl}
          onViewDetails={() => setItemDetailsSheetVisible(true)}
        />
        <CheckoutDottedDivider />
        <CheckoutPaymentMethodsSection
          methods={paymentMethods}
          selectedId={selectedPaymentId}
          loading={paymentLoading}
          errorMessage={paymentError}
          onSelect={setSelectedPaymentId}
          onRetry={() => void loadPaymentMethods()}
        />
        <CheckoutSolidDivider />
        <CheckoutOrderSummary
          currency={currency}
          itemsNormalTotal={itemsNormalTotal}
          itemsSaleTotal={itemsSaleTotal}
          discount={discount}
          shipping={shipping}
          orderTotal={orderTotal}
        />
        <CheckoutSolidDivider />
        <CheckoutShippingInfo />
        <CheckoutSolidDivider />
        <CheckoutTrustBlocks
          onDeliveryLearnMore={() => navigation.navigate('DeliveryGuarantee')}
          onSecurePrivacyLearnMore={() => navigation.navigate('DeliveryGuarantee')}
          onPurchaseProtectionLearnMore={() => navigation.navigate('PurchaseProtection')}
        />
      </ScrollView>

      <View
        style={{
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          paddingTop: spacing.sm,
          paddingBottom: bottomInset + spacing.xs,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <CheckoutSubmitBar
          currency={currency}
          total={orderTotal}
          strikeTotal={itemsNormalTotal + shipping}
          isSheetOpen={priceSheetVisible}
          submitting={submitting}
          onTogglePriceSheet={() => setPriceSheetVisible(v => !v)}
          onSubmit={() => void submitOrder()}
        />
      </View>

      <CheckoutAddressSheet
        visible={addressSheetVisible}
        profile={profile}
        onClose={() => setAddressSheetVisible(false)}
        onRefreshProfile={loadProfile}
        navigation={navigation}
      />

      <CheckoutItemDetailsSheet
        visible={itemDetailsSheetVisible}
        items={selectedItems}
        currency={currency}
        cdnBase={cfg.customerAvatarCdnBaseUrl}
        itemsNormalTotal={itemsNormalTotal}
        shipping={shipping}
        orderTotal={orderTotal}
        submitting={submitting}
        onClose={() => setItemDetailsSheetVisible(false)}
        onSubmit={() => void submitOrder()}
      />

      <CheckoutPriceDetailsSheet
        visible={priceSheetVisible}
        currency={currency}
        items={selectedItems}
        cdnBase={cfg.customerAvatarCdnBaseUrl}
        itemsNormalTotal={itemsNormalTotal}
        itemsSaleTotal={itemsSaleTotal}
        discount={discount}
        shipping={shipping}
        orderTotal={orderTotal}
        submitting={submitting}
        onClose={() => setPriceSheetVisible(false)}
        onSubmit={() => void submitOrder()}
      />

      <AppActionDialog
        visible={gateDialog != null}
        title={gateDialog?.title}
        message={gateDialog?.message ?? ''}
        icon={gateDialog?.icon}
        confirmLabel={gateDialog?.confirmLabel}
        hideCancel={gateDialog?.hideCancel}
        onConfirm={() => gateDialog?.onConfirm()}
        onCancel={closeGateDialog}
      />
    </SafeAreaView>
  );
}
