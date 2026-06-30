import React from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import { CheckoutOrderSummary } from '@features/checkout/components/CheckoutOrderSummary';
import { CheckoutSubmitBar } from '@features/checkout/components/CheckoutSubmitBar';
import type { CartLineItem } from '@features/cart/cartTypes';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';
import { useTabBarBottomInset } from '@navigation/useTabBarBottomInset';

type Props = {
  visible: boolean;
  currency: string;
  items: CartLineItem[];
  cdnBase: string;
  itemsNormalTotal: number;
  itemsSaleTotal: number;
  discount: number;
  shipping: number;
  orderTotal: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const TILE_W = 56;
const TILE_H = 72;

function thumbUri(cdnBase: string, image?: string): string | null {
  if (!image?.trim()) return null;
  const path = image.trim();
  const uri = path.startsWith('http') ? path : `${cdnBase.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  return isSupportedRemoteImage(uri) ? uri : null;
}

export function CheckoutPriceDetailsSheet({
  visible,
  currency,
  items,
  cdnBase,
  itemsNormalTotal,
  itemsSaleTotal,
  discount,
  shipping,
  orderTotal,
  submitting,
  onClose,
  onSubmit,
}: Props): React.ReactElement {
  const bottomInset = useTabBarBottomInset();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '88%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: '#EEEEEE',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111' }}>Price Details</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              hitSlop={12}
              style={{ position: 'absolute', right: spacing.md }}
            >
              <Ionicons name="close" size={24} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Ionicons name="shield-checkmark" size={16} color="#1BAA68" />
              <Text style={{ fontSize: 12, color: '#1BAA68' }}>Dress Fair Purchase Protection</Text>
            </View>

            <Text style={{ paddingHorizontal: spacing.md, fontSize: 14, fontWeight: '600' }}>
              Cart ({items.length})
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              {items.map(row => {
                const uri = thumbUri(cdnBase, row.image);
                return (
                  <View
                    key={row.lineKey}
                    style={{ width: TILE_W, alignItems: 'center', marginRight: 10 }}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={{ width: TILE_W, height: TILE_H, backgroundColor: '#F3F4F6' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: TILE_W,
                          height: TILE_H,
                          backgroundColor: '#F3F4F6',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="image-outline" size={18} color="#9CA3AF" />
                      </View>
                    )}
                    <Text
                      style={{
                        marginTop: 5,
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#111',
                        textAlign: 'center',
                      }}
                    >
                      {currency} {row.price.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <CheckoutOrderSummary
              currency={currency}
              itemsNormalTotal={itemsNormalTotal}
              itemsSaleTotal={itemsSaleTotal}
              discount={discount}
              shipping={shipping}
              orderTotal={orderTotal}
            />

            <Text
              style={{
                paddingHorizontal: spacing.md,
                fontSize: 11,
                color: '#6B7280',
                lineHeight: 16,
                marginTop: spacing.sm,
              }}
            >
              By Submitting your order, you agree to our{' '}
              <Text style={{ color: colors.brand }}>Term of Use</Text> and{' '}
              <Text style={{ color: colors.brand }}>Privacy policy</Text>
            </Text>
          </ScrollView>

          <View style={{ paddingTop: spacing.sm, paddingBottom: bottomInset + spacing.xs }}>
            <CheckoutSubmitBar
            currency={currency}
            total={orderTotal}
            strikeTotal={itemsNormalTotal + shipping}
            isSheetOpen
            submitting={submitting}
            onTogglePriceSheet={onClose}
            onSubmit={onSubmit}
          />
          </View>
        </View>
      </View>
    </Modal>
  );
}
