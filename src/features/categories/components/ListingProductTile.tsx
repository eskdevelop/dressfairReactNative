import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CountryCode } from '@shared/config/env';

import type { ListingProductRow } from '../categoryModel';
import { hubPriceLine } from '../categoryModel';
import { categoryTheme } from '../categoryTheme';
import { cdnAssetUrl, isSupportedRemoteImage } from '../categoryImage';
import { CategoryProductAddToCartButton } from './CategoryProductAddToCartButton';

type Props = {
  row: ListingProductRow;
  country: CountryCode;
  width: number;
  imgH: number;
  onOpen: (sku: string) => void;
  onQuickAdd?: (sku: string) => void;
  storeCurrencyFallback: string;
};

export function ListingProductTile({
  row,
  country,
  width,
  imgH,
  onOpen,
  onQuickAdd,
  storeCurrencyFallback,
}: Props): React.ReactElement {
  const first = row.images[0]?.image ?? '';
  const uri = first ? cdnAssetUrl(country, first) : '';
  const ok = !!uri && isSupportedRemoteImage(uri);
  const fakeR = 4.5;

  const onCartPress = () => {
    if (onQuickAdd) {
      onQuickAdd(row.productSku);
      return;
    }
    onOpen(row.productSku);
  };

  return (
    <View style={{ flex: 1, maxWidth: width, marginHorizontal: 5, marginBottom: 6, backgroundColor: '#FFF' }}>
      <View style={{ position: 'relative' }}>
        <Pressable onPress={() => onOpen(row.productSku)}>
          {ok ? (
            <Image style={{ width: '100%', height: imgH }} source={{ uri }} resizeMode="cover" />
          ) : (
            <View style={{ height: imgH, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </Pressable>
        <CategoryProductAddToCartButton onPress={onCartPress} size="large" />
      </View>
      <Pressable onPress={() => onOpen(row.productSku)}>
        <Text style={{ fontSize: 10, marginTop: 5, paddingHorizontal: 3 }} numberOfLines={1}>
          {row.name}
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 2, paddingTop: 2 }}>
        {[1, 2, 3, 4, 5].map(i =>
          fakeR >= i ? (
            <Ionicons key={i} name="star" size={12} color="#111" />
          ) : fakeR > i - 1 && fakeR < i ? (
            <Ionicons key={i} name="star-half" size={12} color="#111" />
          ) : (
            <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />
          ),
        )}
        <Text style={{ fontSize: 10 }}>4.5</Text>
        <Text style={{ fontSize: 10 }}>(4)</Text>
      </View>
      <Pressable onPress={() => onOpen(row.productSku)}>
        <Text style={{ fontWeight: '700', paddingHorizontal: 3, paddingTop: 5, fontSize: 11, color: categoryTheme.primary }}>
          {hubPriceLine(row, storeCurrencyFallback)}
        </Text>
      </Pressable>
    </View>
  );
}
