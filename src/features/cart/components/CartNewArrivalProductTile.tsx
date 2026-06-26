import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CountryCode } from '@shared/config/env';

import type { ListingProductRow } from '@features/categories/categoryModel';
import { displayPriceFor, strikePriceIfAny } from '@features/categories/categoryModel';
import { categoryTheme } from '@features/categories/categoryTheme';
import { cdnAssetUrl, isSupportedRemoteImage } from '@features/categories/categoryImage';
import { ProductTileQuickAddButton } from '@features/categories/components/ProductTileQuickAddButton';
import { prewarmListingProduct } from '@features/categories/productListingSeed';

type Props = {
  row: ListingProductRow;
  country: CountryCode;
  width: number;
  imgH: number;
  onOpen: (row: ListingProductRow) => void;
  /** Cart button tap — opens the native quick-add sheet. Falls back to onOpen. */
  onQuickAdd?: (sku: string) => void;
  storeCurrencyFallback: string;
};

const STAR_COLOR = '#F59E0B';
const STAR_EMPTY = '#D1D5DB';

function formatCartTilePrice(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return (Math.round(amount * 100) / 100).toFixed(2);
}

export function CartNewArrivalProductTile({
  row,
  country,
  width,
  imgH,
  onOpen,
  onQuickAdd,
  storeCurrencyFallback,
}: Props): React.ReactElement {
  const first = row.images[0]?.image ?? '';
  const uri =
    first.length > 0
      ? /^https?:\/\//i.test(first)
        ? first
        : cdnAssetUrl(country, first)
      : '';
  const ok = !!uri && isSupportedRemoteImage(uri);
  const currency = (storeCurrencyFallback || row.currencyCode || '').trim();
  const displayAmt = formatCartTilePrice(displayPriceFor(row.price));
  const strikeAmt = strikePriceIfAny(row.price);
  const onPressIn = () => prewarmListingProduct(row, country);

  return (
    <View style={{ flex: 1, maxWidth: width, backgroundColor: '#FFF' }}>
      <Pressable onPress={() => onOpen(row)} onPressIn={onPressIn}>
        <View style={{ overflow: 'hidden', borderRadius: 6 }}>
          {ok ? (
            <Image style={{ width: '100%', height: imgH }} source={{ uri }} resizeMode="cover" />
          ) : (
            <View
              style={{
                height: imgH,
                backgroundColor: '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>
      </Pressable>

      <Pressable onPress={() => onOpen(row)} onPressIn={onPressIn}>
        <Text
          style={{ fontSize: 11, lineHeight: 15, marginTop: 4, paddingHorizontal: 3, color: '#111' }}
          numberOfLines={2}
        >
          {row.name}
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          paddingHorizontal: 2,
          paddingTop: 1,
        }}
      >
        {[1, 2, 3, 4, 5].map(i =>
          i <= 4 ? (
            <Ionicons key={i} name="star" size={10} color={STAR_COLOR} />
          ) : (
            <Ionicons key={i} name="star-outline" size={10} color={STAR_EMPTY} />
          ),
        )}
        <Text style={{ fontSize: 10, color: '#111' }}>4.5</Text>
        <Text style={{ fontSize: 10, color: '#111' }}>(4)</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 3,
          paddingTop: 5,
          paddingBottom: 2,
          minHeight: 24,
          gap: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 5 }}>
          <Text style={{ fontWeight: '700', fontSize: 12, color: categoryTheme.primary }}>
            {currency.length > 0 ? `${currency} ${displayAmt}` : displayAmt}
          </Text>
          {strikeAmt != null ? (
            <Text
              style={{
                fontSize: 10,
                color: '#999999',
                textDecorationLine: 'line-through',
              }}
            >
              {formatCartTilePrice(strikeAmt)}
            </Text>
          ) : null}
        </View>
        <ProductTileQuickAddButton onPress={() => (onQuickAdd ?? (() => onOpen(row)))(row.productSku)} />
      </View>
    </View>
  );
}
