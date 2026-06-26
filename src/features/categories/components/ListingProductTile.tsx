import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CountryCode } from '@shared/config/env';

import type { ListingProductRow } from '../categoryModel';
import { displayPriceFor } from '../categoryModel';
import { cdnAssetUrl, isSupportedRemoteImage } from '../categoryImage';
import { prewarmListingProduct } from '../productListingSeed';
import { ProductTileQuickAddButton } from './ProductTileQuickAddButton';

type Props = {
  row: ListingProductRow;
  country: CountryCode;
  width: number;
  imgH: number;
  onOpen: (row: ListingProductRow) => void;
  onQuickAdd?: (sku: string) => void;
  storeCurrencyFallback: string;
};

const STAR_FILLED = '#111111';
const STAR_EMPTY = '#D1D5DB';

function formatTilePrice(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return (Math.round(amount * 100) / 100).toFixed(2);
}

/** Stable pseudo sold count for PLP parity with dressfair.com tiles. */
function soldCountLabel(productId: number): string {
  const n = ((productId * 7919 + 1024) % 48000) + 8000;
  if (n >= 1000) return `${Math.round(n / 1000)}k+ sold`;
  return `${n}+ sold`;
}

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
  const currency = (storeCurrencyFallback || row.currencyCode || '').trim();
  const displayAmt = formatTilePrice(displayPriceFor(row.price));
  const priceText = currency.length > 0 ? `${currency} ${displayAmt}` : displayAmt;

  const onCartPress = () => {
    if (onQuickAdd) {
      onQuickAdd(row.productSku);
      return;
    }
    onOpen(row);
  };

  const onPressIn = () => {
    prewarmListingProduct(row, country);
  };

  return (
    <View style={{ width, marginBottom: 10, backgroundColor: '#FFF' }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onOpen(row)}
        onPressIn={onPressIn}
      >
        <View style={{ width: '100%', height: imgH, overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
          {ok ? (
            <Image style={{ width: '100%', height: '100%' }} source={{ uri }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => onOpen(row)}
        onPressIn={onPressIn}
      >
        <Text
          style={{ fontSize: 11, lineHeight: 14, marginTop: 6, color: '#111' }}
          numberOfLines={1}
        >
          {row.name}
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map(i =>
          i <= 4 ? (
            <Ionicons key={i} name="star" size={11} color={STAR_FILLED} />
          ) : (
            <Ionicons key={i} name="star-outline" size={11} color={STAR_EMPTY} />
          ),
        )}
        <Text style={{ fontSize: 10, color: '#111', marginLeft: 1 }}>4.5</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6,
          minHeight: 24,
          gap: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <Text style={{ fontWeight: '700', fontSize: 12, color: '#111' }} numberOfLines={1}>
            {priceText}
          </Text>
          <Ionicons name="flame" size={11} color="#EA580C" />
          <Text style={{ fontSize: 10, color: '#6B7280', flexShrink: 1 }} numberOfLines={1}>
            {soldCountLabel(row.productId)}
          </Text>
        </View>
        <ProductTileQuickAddButton onPress={onCartPress} />
      </View>
    </View>
  );
}
