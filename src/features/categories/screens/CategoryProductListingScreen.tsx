import React, { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import type { CategoryStackParamList } from '@navigation/types';
import { openWebPath } from '@navigation/navigationRef';
import { productHrefForSku } from '@shared/config/env';
import type { CountryCode } from '@shared/config/env';

import { fetchProductsBySlug } from '../categoryApi';
import type { ListingProductRow } from '../categoryModel';
import { categoryTheme } from '../categoryTheme';
import { ListingProductTile } from '../components/ListingProductTile';
import { CategorySearchBar } from '../components/CategorySearchBar';
import { DeliveryBanner } from '../components/DeliveryBanner';
import { OffersModal } from '../components/OffersModal';
import { apiSortFieldsForChoice, labelForStoredSort, type SortChoice } from '../categorySort';

/** Flutter `SubCategoryProductScreen` + filter bar parity (stubs for filter/color/size). */
export function CategoryProductListingScreen({
  navigation,
  route,
}: NativeStackScreenProps<CategoryStackParamList, 'CategoryListing'>) {
  const { cateKey, titleHint } = route.params;
  const country = useAppSelector(s => s.app.country);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);
  const [offersOpen, setOffersOpen] = useState(false);
  const [sortModal, setSortModal] = useState(false);
  const [sortChoice, setSortChoice] = useState<SortChoice>('Default');
  const [items, setItems] = useState<ListingProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const { width: ww } = useWindowDimensions();
  const cardGap = 4;
  const cardW = Math.floor((ww - cardGap) / 2) - 10;
  const cardH = ww * 0.29;

  const { sort, order } = useMemo(() => apiSortFieldsForChoice(sortChoice), [sortChoice]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setMoreLoading(true);
      else setLoading(true);
      setError(null);
      const res = await fetchProductsBySlug(cateKey, nextPage, { sort, order, country });
      if (!res.ok) {
        setError(res.error ?? 'Failed to load');
        if (!append) setItems([]);
      } else if (append) {
        setItems(prev => [...prev, ...res.products]);
      } else {
        setItems(res.products);
      }
      setLastPage(res.pagination.lastPage);
      setPage(res.pagination.currentPage);
      if (append) setMoreLoading(false);
      else setLoading(false);
    },
    [cateKey, sort, order, country],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage, sortChoice, cateKey]);

  const canLoadMore = page < lastPage;

  const fetchNext = useCallback(() => {
    if (moreLoading || loading || !canLoadMore) return;
    void loadPage(page + 1, true);
  }, [canLoadMore, loadPage, loading, moreLoading, page]);

  const sortOptions = useMemo(() => ['Clear', 'New Arrival', 'Popular', 'Price: Low to High', 'Price: High to Low'] as const satisfies readonly (SortChoice | 'Clear')[], []);

  const onPickSort = (opt: string) => {
    setSortModal(false);
    if (opt === 'Clear') setSortChoice('Default');
    else setSortChoice(opt as SortChoice);
  };

  const pickTitle = titleHint ?? cateKey;

  const openPdp = (sku: string) => {
    const href = productHrefForSku(sku, country as CountryCode);
    if (href) openWebPath(href);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      <OffersModal visible={offersOpen} onClose={() => setOffersOpen(false)} />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8, gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={{ flex: 1, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
          {pickTitle}
        </Text>
      </View>

      <CategorySearchBar onOpenSearch={() => navigation.navigate('CategorySearch')} />
      <View style={{ height: 10 }} />
      <DeliveryBanner onPressDetails={() => setOffersOpen(true)} />
      <View style={{ height: 10 }} />

      <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 8, gap: 10, alignItems: 'center' }}>
          <FilterChip label="Filters" icon="options-outline" onPress={() => undefined} />
          <FilterChip label={labelForStoredSort(sortChoice)} showChevron onPress={() => setSortModal(true)} />
          <FilterChip label="Color" onPress={() => undefined} />
          <FilterChip label="Size" onPress={() => undefined} />
        </View>
      </ScrollView>

      <Modal transparent visible={sortModal} animationType="fade" onRequestClose={() => setSortModal(false)}>
        <Pressable style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => setSortModal(false)}>
          <Pressable onPress={e => e.stopPropagation()} style={{ marginHorizontal: 36, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden' }}>
            <Text style={{ padding: 14, fontWeight: '600', fontSize: 15 }}>Sort by</Text>
            <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />
            {sortOptions.map(opt => (
              <Pressable
                key={opt}
                accessibilityRole="button"
                onPress={() => onPickSort(opt)}
                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 14 }}>{opt}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color={categoryTheme.primary} />
        </View>
      ) : error && items.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
          <Text style={{ textAlign: 'center' }}>{error}</Text>
          <Pressable
            style={{ backgroundColor: categoryTheme.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => void loadPage(1, false)}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, i) => `${String(it.productId)}-${String(i)}`}
          numColumns={2}
          columnWrapperStyle={{ gap: cardGap }}
          contentContainerStyle={{ paddingBottom: 72, paddingHorizontal: 4 }}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.2}
          onEndReached={() => fetchNext()}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 60 }}>No data found</Text>}
          ListFooterComponent={
            moreLoading ? (
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
              storeCurrencyFallback={storeCurrencyCode}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  icon,
  showChevron,
  onPress,
}: {
  label: string;
  icon?: IonName;
  showChevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: '#F3F4F6',
        }}
      >
        {icon ? <Ionicons name={icon} size={16} /> : null}
        <Text style={{ fontSize: 11, color: '#111' }}>{label}</Text>
        {showChevron ? <Ionicons name="chevron-down" size={14} /> : null}
      </View>
    </Pressable>
  );
}
