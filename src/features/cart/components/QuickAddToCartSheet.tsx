import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { CartStarRating } from '@features/cart/components/CartStarRating';
import {
  addProductToCartAndPersist,
  updateCartLineQuantityAndPersist,
} from '@features/cart/cartActions';
import { selectCartItems } from '@features/cart/cartSlice';
import type { WebCartRawItem } from '@features/cart/cartTypes';
import { cartLineKey } from '@features/cart/parseWebCartItems';
import { cdnAssetUrl, isSupportedRemoteImage } from '@features/categories/categoryImage';
import { displayPriceFor, strikePriceIfAny } from '@features/categories/categoryModel';
import type { ProductDetail, ProductSizeOption } from '@features/categories/productDetailApi';
import { fetchProductDetail } from '@features/categories/productDetailApi';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';

const LOW_STOCK_THRESHOLD = 5;
const ACTION_HEIGHT = 40;
const SELECTED_CHIP_BG = '#FFF7ED';

type Props = {
  visible: boolean;
  /** Initial SKU to load. Color selection may switch to a sibling SKU. */
  sku: string | null;
  country: CountryCode;
  storeCurrencyCode: string;
  onClose: () => void;
  /** Navigate the user to the Cart. Falls back to closing the sheet. */
  onGoToCart?: () => void;
};

function priceAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return (Math.round(amount * 100) / 100).toFixed(2);
}

function firstInStockSizeId(detail: ProductDetail): number | null {
  if (detail.sizeOptions.length === 0) return null;
  const inStock = detail.sizeOptions.find(o => o.availableQuantity > 0);
  return inStock ? inStock.productOptionId : null;
}

export function QuickAddToCartSheet({
  visible,
  sku,
  country,
  storeCurrencyCode,
  onClose,
  onGoToCart,
}: Props): React.ReactElement {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const cartItems = useAppSelector(selectCartItems);

  const [activeSku, setActiveSku] = useState<string | null>(sku);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (visible) {
      setActiveSku(sku);
      setDetail(null);
      setError(null);
      setSelectedSizeId(null);
    }
  }, [visible, sku]);

  const loadDetail = useCallback(
    async (targetSku: string, mode: 'initial' | 'switch') => {
      if (mode === 'initial') setLoading(true);
      else setSwitching(true);
      setError(null);
      const res = await fetchProductDetail(targetSku);
      if (res.ok) {
        setDetail(res.detail);
        setSelectedSizeId(firstInStockSizeId(res.detail));
      } else if (mode === 'initial') {
        setDetail(null);
        setError(res.error || 'Could not load product');
      }
      setLoading(false);
      setSwitching(false);
    },
    [],
  );

  useEffect(() => {
    if (!visible || !activeSku) return;
    void loadDetail(activeSku, detail ? 'switch' : 'initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, activeSku]);

  const displayPrice = detail ? displayPriceFor(detail.price) : 0;
  const strike = detail ? strikePriceIfAny(detail.price) : null;
  const discountPercent =
    strike && strike > displayPrice ? Math.round((1 - displayPrice / strike) * 100) : null;
  const currency = (storeCurrencyCode || detail?.currencyCode || '').trim();

  const selectedSize: ProductSizeOption | null = useMemo(() => {
    if (!detail || selectedSizeId == null) return null;
    return detail.sizeOptions.find(o => o.productOptionId === selectedSizeId) ?? null;
  }, [detail, selectedSizeId]);

  const headerImage = detail?.images[0] ?? '';
  const headerUri = headerImage ? cdnAssetUrl(country, headerImage) : '';
  const headerOk = !!headerUri && isSupportedRemoteImage(headerUri);

  const requiresSize = (detail?.sizeOptions.length ?? 0) > 0;

  const selectedLineKey = useMemo(() => {
    if (!detail) return null;
    if (requiresSize && !selectedSize) return null;
    return cartLineKey(detail.sku, selectedSize?.productOptionId ?? 0);
  }, [detail, requiresSize, selectedSize]);

  const cartLine = useMemo(
    () => (selectedLineKey ? cartItems.find(r => r.lineKey === selectedLineKey) ?? null : null),
    [cartItems, selectedLineKey],
  );

  const priceText = (amount: number): string =>
    currency.length > 0 ? `${currency} ${priceAmount(amount)}` : priceAmount(amount);

  const handleAdd = useCallback(async () => {
    if (!detail || adding) return;
    if (requiresSize && (!selectedSize || selectedSize.availableQuantity <= 0)) return;

    setAdding(true);
    const web: WebCartRawItem = {
      id: detail.productId,
      product_option_id: selectedSize?.productOptionId ?? 0,
      sku: detail.sku,
      name: detail.name,
      quantity: 1,
      price: displayPrice,
      size: selectedSize?.label ?? '',
      color: detail.color,
      image: headerImage,
    };
    if (strike && strike > displayPrice) {
      web.normal_price = strike;
    }

    const ok = await addProductToCartAndPersist(dispatch, country, web, cartItems);
    setAdding(false);
    if (ok) {
      analytics.track('native_quick_add_to_cart', {
        sku: detail.sku,
        product_option_id: selectedSize?.productOptionId ?? 0,
      });
    }
  }, [
    detail,
    adding,
    requiresSize,
    selectedSize,
    displayPrice,
    strike,
    headerImage,
    dispatch,
    country,
    cartItems,
  ]);

  const changeQty = useCallback(
    (delta: number) => {
      if (!cartLine) return;
      const next = cartLine.quantity + delta;
      if (next < 1) return;
      void updateCartLineQuantityAndPersist(dispatch, country, cartLine.lineKey, next, cartItems);
    },
    [cartLine, dispatch, country, cartItems],
  );

  const handleGoToCart = useCallback(() => {
    if (onGoToCart) onGoToCart();
    else onClose();
  }, [onGoToCart, onClose]);

  const lowStock = !!detail && detail.availableQty > 0 && detail.availableQty <= LOW_STOCK_THRESHOLD;
  const footerPadBottom = Math.max(insets.bottom + 16, 24);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            maxHeight: '85%',
            backgroundColor: '#FFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          onPress={e => e.stopPropagation()}
        >
          {loading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 36, paddingHorizontal: spacing.lg, alignItems: 'center', gap: 12 }}>
              <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>{error}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => activeSku && void loadDetail(activeSku, 'initial')}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 9,
                  borderRadius: radii.md,
                  backgroundColor: colors.brand,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Retry</Text>
              </Pressable>
            </View>
          ) : detail ? (
            <>
              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 12, paddingBottom: 0 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {headerOk ? (
                    <Image
                      source={{ uri: headerUri }}
                      style={{ width: 52, height: 64, borderRadius: 6, backgroundColor: '#F3F4F6' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 52,
                        height: 64,
                        borderRadius: 6,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 10, paddingRight: 22 }}>
                    <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: '#111', lineHeight: 17 }}>
                      {detail.name}
                    </Text>
                    {detail.availableQty > 0 ? (
                      <Text style={{ fontSize: 10, color: colors.brand, marginTop: 2, fontWeight: '500' }}>
                        Only {detail.availableQty} left
                      </Text>
                    ) : null}
                    <CartStarRating />
                    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{priceText(displayPrice)}</Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={onClose}
                    hitSlop={10}
                    style={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <Ionicons name="close" size={18} color="#111" />
                  </Pressable>
                </View>

                <View style={{ height: 1, backgroundColor: colors.dividerLight, marginVertical: 8 }} />

                {detail.colorOptions.length > 0 ? (
                  <View style={{ marginBottom: 8, opacity: switching ? 0.5 : 1 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {detail.colorOptions.map(c => {
                        const selected = c.sku === detail.sku;
                        const cUri = c.image ? cdnAssetUrl(country, c.image) : '';
                        const cOk = !!cUri && isSupportedRemoteImage(cUri);
                        return (
                          <Pressable
                            key={c.sku}
                            accessibilityRole="button"
                            accessibilityLabel={`Color ${c.color}`}
                            disabled={switching}
                            onPress={() => {
                              if (c.sku !== activeSku) setActiveSku(c.sku);
                            }}
                            style={{ alignItems: 'center', width: 48 }}
                          >
                            <View
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 6,
                                borderWidth: selected ? 2 : 1,
                                borderColor: selected ? colors.brand : '#E5E7EB',
                                overflow: 'hidden',
                                backgroundColor: '#F3F4F6',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {cOk ? (
                                <Image source={{ uri: cUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              ) : (
                                <Ionicons name="image-outline" size={16} color="#9CA3AF" />
                              )}
                            </View>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 10,
                                marginTop: 4,
                                color: selected ? colors.brand : '#444',
                                fontWeight: selected ? '600' : '400',
                              }}
                            >
                              {c.color}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {detail.sizeOptions.length > 0 ? (
                  <View style={{ marginBottom: 6, opacity: switching ? 0.5 : 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#111', marginBottom: 4 }}>Sizes</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {detail.sizeOptions.map(o => {
                        const selected = o.productOptionId === selectedSizeId;
                        const outOfStock = o.availableQuantity <= 0;
                        return (
                          <Pressable
                            key={o.productOptionId}
                            accessibilityRole="button"
                            accessibilityState={{ selected, disabled: outOfStock }}
                            disabled={outOfStock || switching}
                            onPress={() => setSelectedSizeId(o.productOptionId)}
                            style={{
                              minWidth: 26,
                              height: 24,
                              paddingHorizontal: 3,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderColor: selected ? colors.brand : '#E5E7EB',
                              backgroundColor: selected ? SELECTED_CHIP_BG : '#FFF',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: outOfStock ? 0.4 : 1,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: selected ? '600' : '400',
                                color: selected ? colors.brand : '#111',
                              }}
                            >
                              {o.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brand }}>{priceText(displayPrice)}</Text>
                  {strike && strike > displayPrice ? (
                    <Text style={{ fontSize: 10, color: '#999999', textDecorationLine: 'line-through' }}>
                      {priceText(strike)}
                    </Text>
                  ) : null}
                  {discountPercent != null ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.brand,
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ color: colors.brand, fontSize: 10, fontWeight: '700' }}>{discountPercent}% OFF</Text>
                    </View>
                  ) : null}
                  {lowStock ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.brand,
                        borderRadius: 4,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ color: colors.brand, fontSize: 10, fontWeight: '600' }}>ALMOST SOLD OUT</Text>
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              <View
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingTop: 6,
                  paddingBottom: footerPadBottom,
                  borderTopWidth: 1,
                  borderTopColor: colors.dividerLight,
                }}
              >
                {cartLine ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        borderRadius: radii.pill,
                        height: ACTION_HEIGHT,
                        paddingHorizontal: 4,
                      }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Decrease quantity"
                        hitSlop={6}
                        disabled={cartLine.quantity <= 1}
                        onPress={() => changeQty(-1)}
                        style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', opacity: cartLine.quantity <= 1 ? 0.4 : 1 }}
                      >
                        <Ionicons name="remove" size={18} color="#111" />
                      </Pressable>
                      <Text style={{ minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#111' }}>
                        {cartLine.quantity}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Increase quantity"
                        hitSlop={6}
                        disabled={cartLine.quantity >= 99}
                        onPress={() => changeQty(1)}
                        style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="add" size={18} color="#111" />
                      </Pressable>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go to cart"
                      onPress={handleGoToCart}
                      style={{
                        flex: 1,
                        height: ACTION_HEIGHT,
                        borderRadius: radii.pill,
                        backgroundColor: colors.brand,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Go To cart</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add to cart"
                    disabled={adding || (requiresSize && !selectedSize)}
                    onPress={() => void handleAdd()}
                    style={{
                      height: ACTION_HEIGHT,
                      borderRadius: radii.pill,
                      backgroundColor: requiresSize && !selectedSize ? '#F3C9A8' : colors.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {adding ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>
                        {requiresSize && !selectedSize ? 'Select a size' : 'Add To cart'}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
