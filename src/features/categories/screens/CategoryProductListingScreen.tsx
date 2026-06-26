import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import type { CategoryStackParamList, MainTabParamList } from '@navigation/types';
import { QuickAddToCartSheet } from '@features/cart/components/QuickAddToCartSheet';
import { analytics } from '@shared/observability/analytics';
import { openStorefrontProduct } from '@navigation/navigationRef';
import type { CountryCode } from '@shared/config/env';

import { fetchProductsBySlug } from '../categoryApi';
import type { ListingProductRow } from '../categoryModel';
import {
  getMemoryListingPage1,
  loadCachedListingPage1,
  saveCachedListingPage1,
  type ListingCacheFingerprint,
} from '../listingCache';
import { categoryTheme } from '../categoryTheme';
import { ListingProductTile } from '../components/ListingProductTile';
import { CategorySearchBar } from '../components/CategorySearchBar';
import {
  CategoryListingFilters,
  type FilterPanelKind,
} from '../components/CategoryListingFilters';
import { CategorySubcategoryStrip } from '../components/CategorySubcategoryStrip';
import { apiSortFieldsForChoice, type SortChoice } from '../categorySort';
import { prefetchProductDetailsForSkus } from '../productDetailCache';
import { seedFromListingRow } from '../productListingSeed';
import { useCategoryTreeQuery } from '../useCategoryTreeQuery';
import { ProductGridSkeleton } from '@shared/ui/ProductGridSkeleton';

/** Native category PLP — dressfair.com `/c/{slug}` parity with filters. */
export function CategoryProductListingScreen({
  navigation,
  route,
}: NativeStackScreenProps<CategoryStackParamList, 'CategoryListing'>) {
  const { cateSlug, titleHint, searchPlaceholder, hubCategoryId } = route.params;
  const country = useAppSelector(s => s.app.country);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);

  const [quickAddSku, setQuickAddSku] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<FilterPanelKind>('none');
  const [sortChoice, setSortChoice] = useState<SortChoice>('Default');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { sort, order } = useMemo(() => apiSortFieldsForChoice(sortChoice), [sortChoice]);

  const cacheFingerprint = useMemo<ListingCacheFingerprint>(
    () => ({
      sort,
      order,
      color: selectedColor ?? '',
      size: selectedSize ?? '',
    }),
    [sort, order, selectedColor, selectedSize],
  );

  const listingSeed = useMemo(
    () => getMemoryListingPage1(country as CountryCode, cateSlug, cacheFingerprint),
    [country, cateSlug, cacheFingerprint],
  );

  const [items, setItems] = useState<ListingProductRow[]>(() => listingSeed?.products ?? []);
  const [loading, setLoading] = useState(() => !listingSeed);
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => listingSeed?.pagination.currentPage ?? 1);
  const [lastPage, setLastPage] = useState(() => listingSeed?.pagination.lastPage ?? 1);

  const { data: categories = [] } = useCategoryTreeQuery(country as CountryCode);
  const hubCategory = useMemo(
    () => (hubCategoryId != null ? categories.find(c => c.id === hubCategoryId) ?? null : null),
    [categories, hubCategoryId],
  );

  const { width: ww } = useWindowDimensions();
  const gridPad = 8;
  const cardGap = 8;
  const cardW = Math.floor((ww - gridPad * 2 - cardGap) / 2);
  /** dressfair.com PLP portrait image ratio */
  const cardH = Math.round(cardW * 1.32);

  const fetchOpts = useMemo(
    () => ({
      sort,
      order,
      color: selectedColor ?? undefined,
      size: selectedSize ?? undefined,
      country: country as CountryCode,
    }),
    [country, order, selectedColor, selectedSize, sort],
  );

  const applyListingResult = useCallback(
    (products: ListingProductRow[], pagination: { currentPage: number; lastPage: number }, append: boolean) => {
      if (append) {
        setItems(prev => [...prev, ...products]);
      } else {
        setItems(products);
      }
      setLastPage(pagination.lastPage);
      setPage(pagination.currentPage);
    },
    [],
  );

  const refreshPage1InBackground = useCallback(async () => {
    const res = await fetchProductsBySlug(cateSlug, 1, fetchOpts);
    if (!res.ok) return;
    applyListingResult(res.products, res.pagination, false);
    void saveCachedListingPage1(
      country as CountryCode,
      cateSlug,
      cacheFingerprint,
      res.products,
      res.pagination,
    );
  }, [applyListingResult, cacheFingerprint, cateSlug, country, fetchOpts]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) {
        setMoreLoading(true);
      } else if (nextPage === 1) {
        const memoryHit = getMemoryListingPage1(country as CountryCode, cateSlug, cacheFingerprint);
        if (memoryHit) {
          applyListingResult(memoryHit.products, memoryHit.pagination, false);
          setLoading(false);
          setRefreshing(false);
          setError(null);
          void refreshPage1InBackground();
          return;
        }

        const diskHit = await loadCachedListingPage1(country as CountryCode, cateSlug, cacheFingerprint);
        if (diskHit) {
          applyListingResult(diskHit.products, diskHit.pagination, false);
          setLoading(false);
          setRefreshing(false);
          setError(null);
          void refreshPage1InBackground();
          return;
        }

        if (itemsRef.current.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoading(true);
      }

      setError(null);
      const res = await fetchProductsBySlug(cateSlug, nextPage, fetchOpts);
      if (!res.ok) {
        setError(res.error ?? 'Failed to load');
        if (!append && itemsRef.current.length === 0) setItems([]);
      } else {
        applyListingResult(res.products, res.pagination, append);
        if (nextPage === 1 && !append) {
          prefetchProductDetailsForSkus(
            res.products.map(p => p.productSku),
            8,
          );
          void saveCachedListingPage1(
            country as CountryCode,
            cateSlug,
            cacheFingerprint,
            res.products,
            res.pagination,
          );
        }
      }
      if (append) setMoreLoading(false);
      else {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyListingResult, cacheFingerprint, cateSlug, country, fetchOpts, refreshPage1InBackground],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage, cateSlug, country, cacheFingerprint]);

  const canLoadMore = page < lastPage;

  const fetchNext = useCallback(() => {
    if (moreLoading || loading || !canLoadMore) return;
    void loadPage(page + 1, true);
  }, [canLoadMore, loadPage, loading, moreLoading, page]);

  const searchLabel = searchPlaceholder?.trim() || titleHint?.trim() || cateSlug;

  const openPdp = useCallback(
    (row: ListingProductRow) => {
      openStorefrontProduct(row.productSku, seedFromListingRow(row, storeCurrencyCode));
    },
    [storeCurrencyCode],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 35 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      prefetchProductDetailsForSkus(
        viewableItems
          .map(token => token.item as ListingProductRow | undefined)
          .filter((row): row is ListingProductRow => row != null && typeof row.productSku === 'string')
          .map(row => row.productSku),
        6,
      );
    },
  ).current;

  const openQuickAdd = useCallback((sku: string) => {
    const s = sku.trim();
    if (!s) return;
    analytics.track('category_listing_quick_add_open');
    setQuickAddSku(s);
  }, []);

  const goToCartTab = useCallback(() => {
    setQuickAddSku(null);
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>()?.navigate('Cart');
  }, [navigation]);

  const onSubcategorySelect = useCallback(
    (slug: string, title: string) => {
      if (slug === cateSlug) return;
      navigation.replace('CategoryListing', {
        cateSlug: slug,
        titleHint: title,
        searchPlaceholder: searchPlaceholder ?? hubCategory?.name,
        hubCategoryId,
      });
    },
    [cateSlug, hubCategory?.name, hubCategoryId, navigation, searchPlaceholder],
  );

  const onResetAllFilters = useCallback(() => {
    setSortChoice('Default');
    setSelectedColor(null);
    setSelectedSize(null);
  }, []);

  const listHeader = useMemo(
    () => (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 2, paddingBottom: 6, paddingLeft: 2 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={{ paddingVertical: 6, paddingHorizontal: 6 }}
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <CategorySearchBar
              placeholder={searchLabel}
              showCameraIcon
              style={{ marginHorizontal: 0, marginRight: 10 }}
              onOpenSearch={() => navigation.navigate('CategorySearch')}
            />
          </View>
        </View>

        {hubCategory && hubCategory.subCategories.length > 0 ? (
          <CategorySubcategoryStrip
            subCategories={hubCategory.subCategories}
            activeSlug={cateSlug}
            country={country as CountryCode}
            onSelect={onSubcategorySelect}
          />
        ) : null}

        <CategoryListingFilters
          sortChoice={sortChoice}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          openPanel={openPanel}
          onOpenPanel={setOpenPanel}
          onSortChange={setSortChoice}
          onColorChange={setSelectedColor}
          onSizeChange={setSelectedSize}
          onResetAll={onResetAllFilters}
        />
      </View>
    ),
    [
      cateSlug,
      country,
      hubCategory,
      navigation,
      onResetAllFilters,
      onSubcategorySelect,
      openPanel,
      searchLabel,
      selectedColor,
      selectedSize,
      sortChoice,
    ],
  );

  const listEmpty = useMemo(() => {
    if (loading && items.length === 0) {
      return (
        <View style={{ paddingTop: 8, paddingHorizontal: gridPad }}>
          <ProductGridSkeleton cardW={cardW} cardH={cardH} />
        </View>
      );
    }
    if (error && items.length === 0) {
      return (
        <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
          <Text style={{ textAlign: 'center' }}>{error}</Text>
          <Pressable
            style={{ backgroundColor: categoryTheme.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => void loadPage(1, false)}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (refreshing) return null;
    return <Text style={{ textAlign: 'center', marginTop: 60 }}>No data found</Text>;
  }, [cardH, cardW, error, gridPad, items.length, loadPage, loading, refreshing]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      <QuickAddToCartSheet
        visible={quickAddSku != null}
        sku={quickAddSku}
        country={country as CountryCode}
        storeCurrencyCode={storeCurrencyCode}
        onClose={() => setQuickAddSku(null)}
        onGoToCart={goToCartTab}
      />

      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(it, i) => `${String(it.productId)}-${String(i)}`}
        numColumns={2}
        ListHeaderComponent={listHeader}
        columnWrapperStyle={{ gap: cardGap, paddingHorizontal: gridPad }}
        contentContainerStyle={{ paddingBottom: 72, flexGrow: items.length === 0 ? 1 : undefined }}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchNext()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          refreshing || moreLoading ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color={categoryTheme.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ListingProductTile
            row={item}
            country={country as CountryCode}
            width={cardW}
            imgH={cardH}
            onOpen={openPdp}
            onQuickAdd={openQuickAdd}
            storeCurrencyFallback={storeCurrencyCode}
          />
        )}
      />
    </SafeAreaView>
  );
}
