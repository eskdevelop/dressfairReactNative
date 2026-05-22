import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';

import { CartCheckbox } from './CartCheckbox';
import { CartStarRating } from './CartStarRating';

type Props = {
  row: CartLineItem;
  currency: string;
  cdnBase: string;
  onToggleSelect: (lineKey: string) => void;
  onRemove: (lineKey: string) => void;
};

export function CartLineItemRow({
  row,
  currency,
  cdnBase,
  onToggleSelect,
  onRemove,
}: Props): React.ReactElement {
  const uri = cartLineImageUri(row.image, cdnBase);
  const showImg = !!uri && isSupportedRemoteImage(uri);
  const showStrike =
    !!row.normalPrice && row.normalPrice > 0 && row.normalPrice !== row.price;
  const showUrgencyBadge = (row.discountPercent ?? 0) > 0;

  const confirmRemove = () => {
    Alert.alert('Remove item', `Remove "${row.name}" from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemove(row.lineKey) },
    ]);
  };

  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ paddingTop: 28 }}>
          <CartCheckbox checked={row.isSelected} onPress={() => onToggleSelect(row.lineKey)} />
        </View>

        <View style={{ marginLeft: 4, position: 'relative' }}>
          {showImg ? (
            <Image
              source={{ uri }}
              style={{ width: 80, height: 80, borderRadius: 4 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 4,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}
          {showUrgencyBadge ? (
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>Almost Sold Out</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text
              numberOfLines={2}
              style={{ flex: 1, fontSize: 12, color: 'rgba(0,0,0,0.9)', lineHeight: 16 }}
            >
              {row.name}
            </Text>
            <Pressable accessibilityRole="button" onPress={confirmRemove} hitSlop={8} style={{ paddingLeft: 4 }}>
              <Ionicons name="trash" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {row.color ? (
            <Text style={{ marginTop: 2, fontSize: 11, color: 'rgba(0,0,0,0.9)' }}>
              Color : {row.color}
            </Text>
          ) : null}

          <CartStarRating />

          {showStrike ? (
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                color: '#6B7280',
                fontWeight: '600',
                textDecorationLine: 'line-through',
              }}
            >
              {row.normalPrice}
              {currency}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.brand }}>
              {row.price}
              {currency}
            </Text>
            {(row.discountPercent ?? 0) > 0 ? (
              <View
                style={{
                  marginLeft: 6,
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderWidth: 0.5,
                  borderColor: colors.brand,
                  borderRadius: 2,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '600', color: colors.brand }}>
                  -{row.discountPercent}%
                </Text>
              </View>
            ) : null}
            <View style={{ flex: 1 }} />
            <View
              style={{
                width: 22,
                height: 22,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: '#111' }}>{row.quantity}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
