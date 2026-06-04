import React, { useCallback, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';

import { CartCheckbox } from './CartCheckbox';
import { CartQuantitySelector } from './CartQuantitySelector';
import { CartStarRating } from './CartStarRating';

type Props = {
  row: CartLineItem;
  currency: string;
  cdnBase: string;
  onToggleSelect: (lineKey: string) => void;
  onRemove: (lineKey: string) => void;
  onQuantityChange: (lineKey: string, quantity: number) => void;
};

const IMG = 72;

export function CartLineItemRow({
  row,
  currency,
  cdnBase,
  onToggleSelect,
  onRemove,
  onQuantityChange,
}: Props): React.ReactElement {
  const [removeVisible, setRemoveVisible] = useState(false);
  const uri = cartLineImageUri(row.image, cdnBase);
  const showImg = !!uri && isSupportedRemoteImage(uri);
  const showStrike =
    !!row.normalPrice && row.normalPrice > 0 && row.normalPrice !== row.price;
  const showUrgencyBadge = (row.discountPercent ?? 0) > 0;

  const confirmRemove = useCallback(() => {
    setRemoveVisible(false);
    onRemove(row.lineKey);
  }, [onRemove, row.lineKey]);

  return (
    <>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ paddingTop: 26 }}>
            <CartCheckbox checked={row.isSelected} onPress={() => onToggleSelect(row.lineKey)} />
          </View>

          <View style={{ marginLeft: 8, position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
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
            {showUrgencyBadge ? (
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
                <Text style={{ color: '#FFF', fontSize: 7, fontWeight: '700', textAlign: 'center' }}>
                  ALMOST SOLD OUT
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flex: 1, marginLeft: 10, minHeight: IMG }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text
                numberOfLines={2}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: '400',
                  color: 'rgba(0,0,0,0.88)',
                  lineHeight: 16,
                  paddingRight: 4,
                }}
              >
                {row.name}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRemoveVisible(true)}
                hitSlop={10}
                style={{ padding: 2 }}
              >
                <Ionicons name="trash-outline" size={17} color="#B0B0B0" />
              </Pressable>
            </View>

            {row.color ? (
              <Text style={{ marginTop: 3, fontSize: 10, color: '#9CA3AF', lineHeight: 14 }}>
                Color: {row.color}
              </Text>
            ) : null}

            <CartStarRating />

            <View style={{ flex: 1 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.brand }}>
                  {currency} {row.price.toFixed(2)}
                </Text>
                {showStrike ? (
                  <Text
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      color: '#B0B0B0',
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {currency} {row.normalPrice!.toFixed(2)}
                  </Text>
                ) : null}
                {(row.discountPercent ?? 0) > 0 ? (
                  <View
                    style={{
                      marginLeft: 5,
                      paddingHorizontal: 3,
                      paddingVertical: 1,
                      borderWidth: 0.5,
                      borderColor: 'rgba(249,115,22,0.4)',
                      borderRadius: 2,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '500', color: colors.brand }}>
                      -{row.discountPercent}%
                    </Text>
                  </View>
                ) : null}
              </View>

              <CartQuantitySelector
                quantity={row.quantity}
                maxQuantity={row.availableQuantity ?? undefined}
                onQuantityChange={next => onQuantityChange(row.lineKey, next)}
              />
            </View>
          </View>
        </View>
      </View>

      <AppDeleteDialog
        visible={removeVisible}
        message={`Remove "${row.name}" from your cart?`}
        confirmLabel="Remove item"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveVisible(false)}
      />
    </>
  );
}
