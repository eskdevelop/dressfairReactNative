import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';

const IMG = 72;

type Props = {
  row: CartLineItem;
  currency: string;
  cdnBase: string;
  onRemove: (lineKey: string) => void;
};

/** Out-of-stock cart line — separate section, qty 0, no checkout selection. */
export function CartUnavailableLineItemRow({
  row,
  currency,
  cdnBase,
  onRemove,
}: Props): React.ReactElement {
  const [removeVisible, setRemoveVisible] = useState(false);
  const uri = cartLineImageUri(row.image, cdnBase);
  const showImg = !!uri && isSupportedRemoteImage(uri);

  const confirmRemove = useCallback(() => {
    setRemoveVisible(false);
    onRemove(row.lineKey);
  }, [onRemove, row.lineKey]);

  return (
    <>
      <View
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          backgroundColor: '#FAFAFA',
          opacity: 0.92,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 22,
              height: 22,
              marginTop: 26,
              borderRadius: 11,
              borderWidth: 1.5,
              borderColor: '#E5E7EB',
              backgroundColor: '#F3F4F6',
            }}
          />

          <View
            style={{
              marginLeft: 8,
              position: 'relative',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {showImg ? (
              <Image
                source={{ uri }}
                style={{ width: IMG, height: IMG, backgroundColor: '#E8E8E8' }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: IMG,
                  height: IMG,
                  backgroundColor: '#E8E8E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="image-outline" size={22} color="#C4C4C4" />
              </View>
            )}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.65)',
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 7,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                OUT OF STOCK
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 10, minHeight: IMG }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text
                numberOfLines={2}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: '400',
                  color: '#9CA3AF',
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
              <Text style={{ marginTop: 3, fontSize: 10, color: '#B0B0B0', lineHeight: 14 }}>
                Color: {row.color}
              </Text>
            ) : null}

            <View style={{ flex: 1 }} />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#9CA3AF' }}>
                {currency} {row.price.toFixed(2)}
              </Text>
              <View
                style={{
                  minWidth: 48,
                  height: 26,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#9CA3AF' }}>Qty 0</Text>
              </View>
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
