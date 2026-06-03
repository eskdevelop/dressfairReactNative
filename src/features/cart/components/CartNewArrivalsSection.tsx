import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '@app/theme/tokens';
import { fetchNewArrivalsPage } from '@features/account/newArrivalsApi';
import { CartNewArrivalProductTile } from '@features/cart/components/CartNewArrivalProductTile';
import { QuickAddToCartSheet } from '@features/cart/components/QuickAddToCartSheet';
import type { ListingProductRow } from '@features/categories/categoryModel';
import type { RootStackParamList } from '@navigation/types';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { ProductGridSkeleton } from '@shared/ui/ProductGridSkeleton';

const SCROLL_PROGRESS_LOAD_MORE = 0.6;

export type CartNewArrivalsSectionHandle = {
  onParentScroll: (ev: NativeScrollEvent) => void;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  country: CountryCode;
  storeCurrencyCode: string;
};

function scrollThroughProgress(ev: NativeScrollEvent): number {
  const { contentOffset, layoutMeasurement, contentSize } = ev;
  const maxScroll = contentSize.height - layoutMeasurement.height;
  if (maxScroll <= 0) return 0;
  return contentOffset.y / maxScroll;
}

export const CartNewArrivalsSection = forwardRef<CartNewArrivalsSectionHandle, Props>(
  function CartNewArrivalsSection({ navigation, country, storeCurrencyCode }, ref) {
    const { width: ww } = useWindowDimensions();
    const cardGap = 4;
    const hPad = spacing.sm * 2;
    const cardW = Math.floor((ww - hPad - cardGap) / 2);
    const cardH = Math.round(cardW * 1.32);

    const [items, setItems] = useState<ListingProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [moreLoading, setMoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [nextPage, setNextPage] = useState(1);
    const [quickAddSku, setQuickAddSku] = useState<string | null>(null);

    const loadMoreInFlightRef = useRef(false);
    const lastScrollMetricsRef = useRef<NativeScrollEvent | null>(null);
    const loadMoreRef = useRef<(() => Promise<void>) | null>(null);

    const loadInitial = useCallback(async () => {
      setLoading(true);
      setError(null);
      setItems([]);
      setHasMore(true);
      setNextPage(1);
      lastScrollMetricsRef.current = null;
      const res = await fetchNewArrivalsPage(1);
      if (!res.ok) {
        setError(res.error ?? 'Could not load new arrivals');
        setItems([]);
        setHasMore(false);
      } else {
        setItems(res.products);
        setHasMore(res.hasMore);
        setNextPage(res.hasMore ? 2 : 1);
      }
      setLoading(false);
    }, []);

    useEffect(() => {
      void loadInitial();
    }, [country, loadInitial]);

    const loadMore = useCallback(async () => {
      if (!hasMore || loading || nextPage < 2) return;
      if (loadMoreInFlightRef.current) return;
      loadMoreInFlightRef.current = true;
      setMoreLoading(true);
      try {
        const res = await fetchNewArrivalsPage(nextPage);
        if (res.ok) {
          setItems(prev => [...prev, ...res.products]);
          setHasMore(res.hasMore);
          if (res.hasMore) setNextPage(p => p + 1);
        }
      } finally {
        loadMoreInFlightRef.current = false;
        setMoreLoading(false);
      }
    }, [hasMore, loading, nextPage]);

    loadMoreRef.current = loadMore;

    const tryLoadMoreFromScroll = useCallback(
      (ev: NativeScrollEvent) => {
        if (scrollThroughProgress(ev) < SCROLL_PROGRESS_LOAD_MORE) return;
        void loadMore();
      },
      [loadMore],
    );

    useImperativeHandle(
      ref,
      () => ({
        onParentScroll: (ev: NativeScrollEvent) => {
          lastScrollMetricsRef.current = ev;
          tryLoadMoreFromScroll(ev);
        },
      }),
      [tryLoadMoreFromScroll],
    );

    useEffect(() => {
      const ev = lastScrollMetricsRef.current;
      if (!ev || !hasMore || loading || items.length === 0) return;
      if (loadMoreInFlightRef.current) return;
      if (scrollThroughProgress(ev) >= SCROLL_PROGRESS_LOAD_MORE) {
        void loadMoreRef.current?.();
      }
    }, [items.length, hasMore, loading]);

    const openPdp = useCallback(
      (sku: string) => {
        const s = sku.trim();
        if (!s) return;
        analytics.track('cart_new_arrivals_open_pdp');
        navigation.navigate('StorefrontProductWeb', { sku: s });
      },
      [navigation],
    );

    const openQuickAdd = useCallback((sku: string) => {
      const s = sku.trim();
      if (!s) return;
      analytics.track('cart_new_arrivals_quick_add_open');
      setQuickAddSku(s);
    }, []);

    const pairs: [ListingProductRow, ListingProductRow | undefined][] = [];
    for (let i = 0; i < items.length; i += 2) {
      pairs.push([items[i], items[i + 1]]);
    }

    return (
      <View style={{ marginTop: spacing.sm, paddingHorizontal: spacing.sm }}>
        {loading && items.length === 0 ? (
          <ProductGridSkeleton cardW={cardW} cardH={cardH} />
        ) : error && items.length === 0 ? (
          <View style={{ paddingVertical: 24, alignItems: 'center', gap: 12 }}>
            <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadInitial()}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: colors.brand,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24, color: colors.textMuted, fontSize: 14 }}>
            No data found
          </Text>
        ) : (
          <View>
            {pairs.map((pair, rowIdx) => (
              <View
                key={`cart-na-row-${String(pair[0].productId)}-${String(rowIdx)}`}
                style={{ flexDirection: 'row', marginBottom: cardGap, gap: cardGap }}
              >
                <CartNewArrivalProductTile
                  row={pair[0]}
                  country={country}
                  width={cardW}
                  imgH={cardH}
                  onOpen={openPdp}
                  onQuickAdd={openQuickAdd}
                  storeCurrencyFallback={storeCurrencyCode}
                />
                {pair[1] ? (
                  <CartNewArrivalProductTile
                    row={pair[1]}
                    country={country}
                    width={cardW}
                    imgH={cardH}
                    onOpen={openPdp}
                    onQuickAdd={openQuickAdd}
                    storeCurrencyFallback={storeCurrencyCode}
                  />
                ) : (
                  <View style={{ flex: 1, maxWidth: cardW }} />
                )}
              </View>
            ))}

            {hasMore && moreLoading ? (
              <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
                <ActivityIndicator color={colors.brand} accessibilityLabel="Loading more products" />
              </View>
            ) : null}
          </View>
        )}

        <QuickAddToCartSheet
          visible={quickAddSku != null}
          sku={quickAddSku}
          country={country}
          storeCurrencyCode={storeCurrencyCode}
          onClose={() => setQuickAddSku(null)}
          onGoToCart={() => setQuickAddSku(null)}
        />
      </View>
    );
  },
);
