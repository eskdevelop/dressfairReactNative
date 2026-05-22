import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import {
  checkShipping,
  selectedDiscount,
  selectedTotalNormalPrice,
  selectedTotalPrice,
  totalWithShippingCharges,
  type CartShippingConfig,
} from '@features/cart/cartPricing';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';

import { CartCheckoutBar } from './CartCheckoutBar';

type Props = {
  visible: boolean;
  items: CartLineItem[];
  currency: string;
  cdnBase: string;
  shippingConfig: CartShippingConfig;
  onClose: () => void;
  onCheckout: () => void;
};

function SelectedThumb({
  row,
  currency,
  cdnBase,
}: {
  row: CartLineItem;
  currency: string;
  cdnBase: string;
}): React.ReactElement {
  const uri = cartLineImageUri(row.image, cdnBase);
  const showImg = !!uri && isSupportedRemoteImage(uri);

  return (
    <View style={{ alignItems: 'center', marginHorizontal: 5 }}>
      <View style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden' }}>
        {showImg ? (
          <Image source={{ uri }} style={{ width: 70, height: 70 }} resizeMode="cover" />
        ) : (
          <View
            style={{
              width: 70,
              height: 70,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="image-outline" size={20} color="#9CA3AF" />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            left: 3,
            right: 3,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 2,
            paddingVertical: 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ color: '#FFF', fontSize: 6, fontWeight: '700', textAlign: 'center' }}
          >
            ALMOST SOLD OUT
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 6,
          paddingHorizontal: 4,
          paddingVertical: 2,
          backgroundColor: '#FAFAFA',
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#111' }}>
          {currency} {row.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

export function PriceDetailsCartSheet({
  visible,
  items,
  currency,
  cdnBase,
  shippingConfig,
  onClose,
  onCheckout,
}: Props): React.ReactElement {
  const selected = items.filter(row => row.isSelected);
  const itemsNormalTotal = selectedTotalNormalPrice(items);
  const itemsSaleTotal = selectedTotalPrice(items);
  const discount = selectedDiscount(items);
  const shipping = checkShipping(itemsSaleTotal, shippingConfig);
  const grandTotal = totalWithShippingCharges(itemsSaleTotal, shippingConfig);
  const showDiscount = discount > 0 && discount !== itemsNormalTotal;
  const showStrike =
    itemsNormalTotal > 0 && Math.abs(itemsNormalTotal - grandTotal) > 0.009;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            maxHeight: '90%',
            backgroundColor: '#FFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: spacing.lg,
          }}
          onPress={e => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ height: spacing.md }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#111' }}>Price Details</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                hitSlop={10}
                style={{ flex: 1, alignItems: 'flex-end' }}
              >
                <Ionicons name="close" size={20} color="#111" />
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.sm,
              }}
            >
              <Ionicons name="checkmark" size={15} color="#16A34A" />
              <Text style={{ marginLeft: 4, fontSize: 12, color: '#16A34A' }}>
                Dress Fair Purchase Protection
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: '#EEEEEE', marginVertical: spacing.md }} />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '500' }}>Cart ({selected.length})</Text>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={colors.brand}
                style={{ marginLeft: 6 }}
              />
              <Text style={{ marginLeft: 2, fontSize: 10, fontWeight: '500', color: colors.brand }}>
                ALMOST SOLD OUT
              </Text>
            </View>

            {selected.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: spacing.sm }}
              >
                {selected.map(row => (
                  <SelectedThumb key={row.lineKey} row={row} currency={currency} cdnBase={cdnBase} />
                ))}
              </ScrollView>
            ) : null}

            <View style={{ height: 1, backgroundColor: '#EEEEEE', marginBottom: spacing.md }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: '#111' }}>Item(s) Price</Text>
              <Text style={{ fontSize: 13, color: '#111' }}>
                {currency} {itemsNormalTotal.toFixed(2)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: '#111' }}>Shipping Charges</Text>
              {shipping === 0 ? (
                <Text style={{ fontSize: 13, color: '#16A34A' }}>FREE</Text>
              ) : (
                <Text style={{ fontSize: 13, color: '#111' }}>
                  {currency} {shipping.toFixed(2)}
                </Text>
              )}
            </View>

            {showDiscount ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: '#111' }}>Item(s) discount</Text>
                <Text style={{ fontSize: 13, color: '#16A34A' }}>
                  {currency} {discount.toFixed(2)}
                </Text>
              </View>
            ) : null}

            <View style={{ height: 1, backgroundColor: '#EEEEEE', marginVertical: spacing.sm }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#111' }}>Total</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.brand }}>
                {currency} {grandTotal.toFixed(2)}
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginBottom: spacing.lg }}>
              *Please refer to your final actual payment amount.
            </Text>

            <CartCheckoutBar
              currency={currency}
              total={grandTotal}
              strikeTotal={showStrike ? itemsNormalTotal : null}
              selectedCount={selected.length}
              isSheetOpen
              onTogglePriceSheet={onClose}
              onCheckout={onCheckout}
            />
            <View style={{ height: spacing.lg }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
