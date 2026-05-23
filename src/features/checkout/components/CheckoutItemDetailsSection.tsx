import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@app/theme/tokens';
import type { CartLineItem } from '@features/cart/cartTypes';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';

type Props = {
  items: CartLineItem[];
  currency: string;
  cdnBase: string;
  onViewDetails: () => void;
};

const TILE_W = 56;
const TILE_H = 70;

function imageUri(cdnBase: string, image?: string): string | null {
  if (!image?.trim()) return null;
  const path = image.trim();
  const uri = path.startsWith('http') ? path : `${cdnBase.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  return isSupportedRemoteImage(uri) ? uri : null;
}

export function CheckoutItemDetailsSection({
  items,
  currency,
  cdnBase,
  onViewDetails,
}: Props): React.ReactElement {
  return (
    <View style={{ paddingTop: 8, paddingBottom: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111' }}>
          Item details ({items.length})
        </Text>
        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={onViewDetails}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280' }}>View details</Text>
            <Ionicons name="chevron-forward" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: 4,
        }}
      >
        {items.map(row => {
          const uri = imageUri(cdnBase, row.image);
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
                  <Text style={{ fontSize: 9, color: '#9CA3AF' }}>No image</Text>
                </View>
              )}
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  fontWeight: '500',
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
    </View>
  );
}
