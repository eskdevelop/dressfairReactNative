import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import { CheckoutSubmitBar } from '@features/checkout/components/CheckoutSubmitBar';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';
import { useTabBarBottomInset } from '@navigation/useTabBarBottomInset';

type Props = {
  visible: boolean;
  items: CartLineItem[];
  currency: string;
  cdnBase: string;
  itemsNormalTotal: number;
  shipping: number;
  orderTotal: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const IMG = 76;
const GREEN = '#16A34A';
const GREEN_LIGHT = '#ECFDF3';
const GREEN_BORDER = '#BBF7D0';

function variantLabel(row: CartLineItem): string | null {
  const parts: string[] = [];
  if (row.color?.trim()) parts.push(`Color: ${row.color.trim()}`);
  if (row.size?.trim()) parts.push(`Label size: ${row.size.trim()}`);
  return parts.length > 0 ? parts.join(' / ') : null;
}

function FreeShippingPill(): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 10, paddingHorizontal: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: GREEN_LIGHT,
          borderWidth: 1,
          borderColor: GREEN_BORDER,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: GREEN,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 7,
          }}
        >
          <Ionicons name="checkmark" size={11} color="#FFF" />
        </View>
        <Text style={{ fontSize: 11, color: GREEN, fontWeight: '600', letterSpacing: 0.1 }}>
          Free shipping on eligible orders
        </Text>
      </View>
    </View>
  );
}

function ItemDetailRow({
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
  const showStrike =
    !!row.normalPrice && row.normalPrice > 0 && row.normalPrice !== row.price;
  const showBadge = (row.discountPercent ?? 0) > 0;
  const variant = variantLabel(row);

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EBEBEB',
      }}
    >
      <View style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
        {showImg ? (
          <Image
            source={{ uri }}
            style={{ width: IMG, height: IMG, backgroundColor: '#F5F5F5' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: IMG,
              height: IMG,
              backgroundColor: '#F5F5F5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="image-outline" size={22} color="#C4C4C4" />
          </View>
        )}
        {showBadge ? (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.58)',
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: '#FFF',
                fontSize: 7,
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: 0.2,
              }}
            >
              ALMOST SOLD OUT
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
        <View>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              fontWeight: '400',
              color: 'rgba(0,0,0,0.88)',
              lineHeight: 16,
            }}
          >
            {row.name}
          </Text>
          {variant ? (
            <Text
              numberOfLines={1}
              style={{ marginTop: 3, fontSize: 10, color: '#9CA3AF', lineHeight: 14 }}
            >
              {variant}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.brand, marginRight: 5 }}>
            {currency} {row.price.toFixed(2)}
          </Text>
          {showStrike ? (
            <Text
              style={{
                fontSize: 11,
                color: '#B0B0B0',
                textDecorationLine: 'line-through',
                marginRight: 5,
              }}
            >
              {currency} {row.normalPrice!.toFixed(2)}
            </Text>
          ) : null}
          {showBadge ? (
            <View
              style={{
                paddingHorizontal: 3,
                paddingVertical: 1,
                borderWidth: 0.5,
                borderColor: 'rgba(249,115,22,0.45)',
                borderRadius: 2,
                marginRight: 5,
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: '500', color: colors.brand }}>
                -{row.discountPercent}%
              </Text>
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          <View
            style={{
              minWidth: 32,
              height: 24,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 4,
              paddingHorizontal: 6,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FAFAFA',
            }}
          >
            <Text style={{ fontSize: 11, color: '#555' }}>{row.quantity}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function CheckoutItemDetailsSheet({
  visible,
  items,
  currency,
  cdnBase,
  itemsNormalTotal,
  shipping,
  orderTotal,
  submitting,
  onClose,
  onSubmit,
}: Props): React.ReactElement {
  const bottomInset = useTabBarBottomInset();
  const { height: windowH } = useWindowDimensions();
  const listMaxHeight = Math.min(windowH * 0.52, items.length * 108 + 16);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            maxHeight: '90%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
            <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#E5E5E5',
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 12,
                paddingHorizontal: spacing.xl,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#222' }}>
                Item details ({items.length})
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                hitSlop={12}
                style={{
                  position: 'absolute',
                  right: spacing.md,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#666" />
              </Pressable>
            </View>

            <FreeShippingPill />

            <ScrollView
              style={{ maxHeight: listMaxHeight }}
              contentContainerStyle={{ paddingBottom: spacing.sm }}
              showsVerticalScrollIndicator={false}
            >
              {items.map(row => (
                <ItemDetailRow key={row.lineKey} row={row} currency={currency} cdnBase={cdnBase} />
              ))}
            </ScrollView>

            <View
              style={{
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: '#EEE',
                paddingTop: spacing.sm,
                paddingBottom: bottomInset + spacing.xs,
              }}
            >
              <CheckoutSubmitBar
                currency={currency}
                total={orderTotal}
                strikeTotal={itemsNormalTotal + shipping}
                itemCount={items.length}
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
