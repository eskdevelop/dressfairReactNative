import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CountryCode } from '@shared/config/env';

import type { ListingProductRow } from '@features/categories/categoryModel';
import { displayPriceFor, strikePriceIfAny } from '@features/categories/categoryModel';
import { categoryTheme } from '@features/categories/categoryTheme';
import { cdnAssetUrl, isSupportedRemoteImage } from '@features/categories/categoryImage';

type Props = {
  row: ListingProductRow;
  country: CountryCode;
  width: number;
  imgH: number;
  onOpen: (sku: string) => void;
  storeCurrencyFallback: string;
};

const CART_BTN_HEIGHT = 26;

/*
function CartGridAddButton({ onPress }: { onPress: () => void }): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add to cart"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({
        height: CART_BTN_HEIGHT,
        paddingHorizontal: 11,
        borderRadius: CART_BTN_HEIGHT / 2,
        borderWidth: 1,
        borderColor: '#222222',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Ionicons name="cart-outline" size={14} color="#222222" />
    </Pressable>
  );
}
*/
// Hidden for now — You tab + Cart empty-state new-arrivals grids.

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
  storeCurrencyFallback,
}: Props): React.ReactElement {
  const first = row.images[0]?.image ?? '';
  const uri = first ? cdnAssetUrl(country, first) : '';
  const ok = !!uri && isSupportedRemoteImage(uri);
  const fakeR = 4.5;
  const currency = (storeCurrencyFallback || row.currencyCode || '').trim();
  const displayAmt = formatCartTilePrice(displayPriceFor(row.price));
  const strikeAmt = strikePriceIfAny(row.price);

  return (
    <View style={{ flex: 1, maxWidth: width, backgroundColor: '#FFF' }}>
      <Pressable onPress={() => onOpen(row.productSku)}>
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
      </Pressable>

      <Pressable onPress={() => onOpen(row.productSku)}>
        <Text
          style={{ fontSize: 10, marginTop: 5, paddingHorizontal: 3, color: '#111' }}
          numberOfLines={1}
        >
          {row.name}
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 2,
          paddingTop: 2,
        }}
      >
        {[1, 2, 3, 4, 5].map(i =>
          fakeR >= i ? (
            <Ionicons key={i} name="star" size={12} color="#111" />
          ) : fakeR > i - 1 && fakeR < i ? (
            <Ionicons key={i} name="star-half" size={12} color="#111" />
          ) : (
            <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />
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
          paddingTop: 6,
          paddingBottom: 4,
          minHeight: CART_BTN_HEIGHT,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            flexShrink: 1,
            gap: 5,
            paddingRight: 6,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 11, color: categoryTheme.primary }}>
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
        {/* <CartGridAddButton onPress={() => onOpen(row.productSku)} /> */}
      </View>
    </View>
  );
}
