import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
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
import { useNewArrivalsPage1Query } from '@features/account/useNewArrivalsQuery';
import { CartNewArrivalProductTile } from '@features/cart/components/CartNewArrivalProductTile';
import { QuickAddToCartSheet } from '@features/cart/components/QuickAddToCartSheet';
import type { ListingProductRow } from '@features/categories/categoryModel';
import { prefetchProductDetailsForSkus } from '@features/categories/productDetailCache';
import { seedFromListingRow } from '@features/categories/productListingSeed';
import { openStorefrontProduct } from '@navigation/navigationRef';
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

    const { data: page1, isPending, isError, error: queryError, refetch } = useNewArrivalsPage1Query(country);

    const [appendItems, setAppendItems] = useState<ListingProductRow[]>([]);
    const [moreLoading, setMoreLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextPage, setNextPage] = useState(2);
    const [quickAddSku, setQuickAddSku] = useState<string | null>(null);

    const loadMoreInFlightRef = useRef(false);
    const lastScrollMetricsRef = useRef<NativeScrollEvent | null>(null);
    const loadMoreRef = useRef<(() => Promise<void>) | null>(null);

    useEffect(() => {
      setAppendItems([]);
      if (page1) {
        setHasMore(page1.hasMore);
        setNextPage(page1.hasMore ? 2 : 1);
      }
    }, [country, page1]);

    const items = useMemo(
      () => [...(page1?.products ?? []), ...appendItems],
      [appendItems, page1?.products],
    );

    useEffect(() => {
      if (items.length === 0) return;
      prefetchProductDetailsForSkus(items.map(row => row.productSku), 8);
    }, [items]);

    const loading = isPending && items.length === 0;
    const error =
      isError && items.length === 0
        ? (queryError?.message ?? 'Could not load new arrivals')
        : null;

    const loadInitial = useCallback(async () => {
      setAppendItems([]);
      await refetch();
    }, [refetch]);

    const loadMore = useCallback(async () => {
      if (!hasMore || loading || nextPage < 2) return;
      if (loadMoreInFlightRef.current) return;
      loadMoreInFlightRef.current = true;
      setMoreLoading(true);
      try {
        const res = await fetchNewArrivalsPage(nextPage);
        if (res.ok) {
          setAppendItems(prev => [...prev, ...res.products]);
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
      (row: ListingProductRow) => {
        analytics.track('cart_new_arrivals_open_pdp');
        openStorefrontProduct(row.productSku, seedFromListingRow(row, storeCurrencyCode));
      },
      [storeCurrencyCode],
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
