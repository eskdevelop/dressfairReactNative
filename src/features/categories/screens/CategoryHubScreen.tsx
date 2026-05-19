import React, { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import type { CategoryStackParamList, MainTabParamList } from '@navigation/types';
import type { CountryCode } from '@shared/config/env';

import {
  cateKeyForCategoryListing,
  isFeatureHubCategory,
  listingSlugForViewAll,
} from '../categoryBrowseRoutes';
import { loadCachedCategories } from '../categoryCache';
import { fetchNormalizeAndPersist } from '../categoryHydration';
import type { CategoryRow } from '../categoryModel';
import { hubPriceLine } from '../categoryModel';
import type { HubProductRow, SubCategoryRow } from '../categoryModel';
import { cdnAssetUrl, isSupportedRemoteImage } from '../categoryImage';
import { categoryTheme } from '../categoryTheme';
import { CategorySearchBar } from '../components/CategorySearchBar';
import { DeliveryBanner } from '../components/DeliveryBanner';
import { OffersModal } from '../components/OffersModal';

type HubNav = CompositeNavigationProp<
  NativeStackNavigationProp<CategoryStackParamList, 'CategoryHub'>,
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = { navigation: HubNav };

/** Flutter main category grid parity (hard-coded placeholders). */
const FAKE_DISPLAY_RATING = 4.5;
const FAKE_REVIEWS = 4;

function chunkPairs<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    out.push(items.slice(i, i + 2));
  }
  return out;
}

function sidebarLabel(row: CategoryRow): string {
  if (row.id === 0 && row.name === 'All') return 'Feature';
  return row.name;
}

function ViewAllGlyph({ size }: { size: number }) {
  const name = 'apps-outline' as IonName;
  return <Ionicons name={name} color="rgba(0,0,0,0.55)" size={size} />;
}

function starSet(rating: number): Array<'filled' | 'half' | 'empty'> {
  const out: Array<'filled' | 'half' | 'empty'> = [];
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) out.push('filled');
    else if (rating > i - 1 && rating < i) out.push('half');
    else out.push('empty');
  }
  return out;
}

function StarsRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {starSet(rating).map((k, idx) =>
        k === 'filled' ? (
          <Ionicons key={idx} name="star" color="#111" size={12} />
        ) : k === 'half' ? (
          <Ionicons key={idx} name="star-half" color="#111" size={12} />
        ) : (
          <Ionicons key={idx} name="star-outline" color="#D1D5DB" size={12} />
        ),
      )}
    </View>
  );
}

function RelatedProductCard(props: {
  item: HubProductRow;
  country: CountryCode;
  onPressSku: (sku: string) => void;
  cardWidth: number;
  imageHeight: number;
  storeCurrencyFallback: string;
}) {
  const { item, country, onPressSku, cardWidth, imageHeight, storeCurrencyFallback } = props;

  const first = item.images[0]?.image ?? '';
  const uri = first ? cdnAssetUrl(country, first) : '';

  const showImg = !!uri && isSupportedRemoteImage(uri);

  return (
    <View style={{ backgroundColor: '#FFF', width: cardWidth, marginHorizontal: 3, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" onPress={() => onPressSku(item.productSku)}>
        {showImg ? (
          <Image
            source={{ uri }}
            style={{ height: imageHeight, width: '100%', backgroundColor: '#EEE' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ height: imageHeight, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </Pressable>
      <View style={{ gap: 4, paddingHorizontal: 4, paddingVertical: 6 }}>
        <Pressable onPress={() => onPressSku(item.productSku)}>
          <Text style={{ fontSize: 11, fontWeight: '500' }} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <StarsRow rating={FAKE_DISPLAY_RATING} />
          <Text style={{ fontSize: 10 }}>{FAKE_DISPLAY_RATING.toFixed(1)}</Text>
          <Text style={{ fontSize: 10 }}>({FAKE_REVIEWS})</Text>
        </View>
        <Pressable onPress={() => onPressSku(item.productSku)}>
          <Text style={{ fontWeight: '700', color: categoryTheme.primary, fontSize: 11 }}>
            {hubPriceLine(item, storeCurrencyFallback)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SubcategoryCell(props: {
  sub: SubCategoryRow;
  country: CountryCode;
  cellWidth: number;
  onPress: () => void;
}) {
  const { sub, country, cellWidth, onPress } = props;

  const rel = sub.image?.trim();
  const uri = rel ? cdnAssetUrl(country, rel) : '';
  const showImg = !!uri && isSupportedRemoteImage(uri);

  return (
    <View style={{ width: cellWidth, alignItems: 'center' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={sub.name} onPress={onPress}>
        <View
          style={{
            height: 58,
            width: 58,
            borderRadius: 29,
            backgroundColor: '#E5E7EB',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {showImg ? (
            <Image source={{ uri }} style={{ height: '100%', width: '100%' }} resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={22} color="#9CA3AF" />
          )}
        </View>
      </Pressable>
      <Text style={{ marginTop: 10, paddingHorizontal: 8, fontSize: 10, textAlign: 'center' }} numberOfLines={2}>
        {sub.name}
      </Text>
    </View>
  );
}

export function CategoryHubScreen({ navigation }: Props) {
  const country = useAppSelector(s => s.app.country);
  const storeCurrencyCode = useAppSelector(s => s.app.storeCurrencyCode);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [offersOpen, setOffersOpen] = useState(false);
  const { width: ww } = useWindowDimensions();

  const sidebarWidth = ww * 0.25;
  const contentWidth = ww - sidebarWidth - 1;
  /** 3 columns: width must account for horizontal padding + gutters or row wraps to 2 cols. */
  const subGridHPad = 12;
  const subColGap = 6;
  const subCols = 3;
  const subGridInner = Math.max(0, contentWidth - subGridHPad);
  const cellWidth = Math.max(0, (subGridInner - subColGap * (subCols - 1)) / subCols);

  const loadTree = useCallback(async () => {
    setBannerError(null);

    const cached = await loadCachedCategories(country);
    if (cached.length > 0) {
      setCategories(cached);
      setSelectedId(cached[0]?.id ?? 0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await fetchNormalizeAndPersist(country);
    if (!res.ok || res.categories.length === 0) {
      setCategories([]);
      setSelectedId(null);
      setBannerError(res.error ?? 'Could not load categories');
      setLoading(false);
      return;
    }

    setCategories(res.categories);
    setSelectedId(res.categories[0]?.id ?? 0);
    setLoading(false);
  }, [country]);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  const selected = useMemo(
    () => (selectedId !== null ? categories.find(c => c.id === selectedId) ?? null : null),
    [categories, selectedId],
  );

  const openCategoryWeb = useCallback(
    (listingSlug: string, titleHint: string | undefined, hubCategory: CategoryRow | null) => {
      const s = listingSlug.trim();
      if (!s) return;
      navigation.navigate('CategoryWebListing', {
        slug: s,
        titleHint,
        searchPlaceholder: hubCategory?.name,
      });
    },
    [navigation],
  );

  const openListing = useCallback(
    (cateKey: string | null | undefined, titleHint?: string) => {
      if (!cateKey) return;
      navigation.navigate('CategoryListing', { cateKey, titleHint });
    },
    [navigation],
  );

  const onViewAllPress = useCallback(() => {
    if (!selected) return;
    const slug = listingSlugForViewAll(selected);
    if (slug) {
      openCategoryWeb(slug, 'View All', selected);
      return;
    }
    const key = cateKeyForCategoryListing(selected);
    if (key) openListing(key, 'View All');
  }, [openCategoryWeb, selected, openListing]);

  const onSubcategoryPress = useCallback(
    (sub: SubCategoryRow) => {
      const s = sub.slug?.trim();
      if (s) {
        openCategoryWeb(s, sub.name, selected);
      } else {
        openListing(sub.name, sub.name);
      }
    },
    [openCategoryWeb, openListing, selected],
  );

  const openPdp = useCallback(
    (sku: string) => {
      const s = sku.trim();
      if (!s) return;
      // CategoryHub uses a tab + stack composite `navigation`; `navigate` can
      // target the tab navigator and miss `CategoryProductWeb`. Push targets
      // the native stack that hosts this screen.
      navigation.dispatch(StackActions.push('CategoryProductWeb', { sku: s }));
    },
    [navigation],
  );

  const relatedRows = useMemo(() => chunkPairs(selected?.products ?? []), [selected?.products]);
  const relPad = 6;
  const relGap = 8;
  const relUsable = contentWidth - relPad * 2;
  const relatedCardW = Math.max(0, Math.floor((relUsable - relGap) / 2));
  const relatedImgH = Math.min(150, Math.round(relatedCardW * 1.12));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      <OffersModal visible={offersOpen} onClose={() => setOffersOpen(false)} />
      <View style={{ paddingTop: 6 }}>
        <CategorySearchBar onOpenSearch={() => navigation.navigate('CategorySearch')} />
      </View>
      <View style={{ height: 10 }} />

      <DeliveryBanner onPressDetails={() => setOffersOpen(true)} />
      <View style={{ height: 6 }} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <ActivityIndicator color={categoryTheme.primary} size="large" />
        </View>
      ) : bannerError !== null && categories.length === 0 ? (
        <View style={{ padding: 28, gap: 12, alignItems: 'center' }}>
          <Text style={{ color: '#111', textAlign: 'center' }}>{bannerError}</Text>
          <Pressable style={{ paddingVertical: 10, paddingHorizontal: 22, borderRadius: 8, backgroundColor: categoryTheme.primary }} onPress={() => void loadTree()}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      ) : selected !== null ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              width: sidebarWidth,
              backgroundColor: categoryTheme.sidebarBg,
              borderRightWidth: 0.4,
              borderRightColor: categoryTheme.sidebarBorder,
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowOffset: { width: 2, height: 0 },
              shadowRadius: 4,
            }}
          >
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={categories}
              extraData={selectedId}
              showsVerticalScrollIndicator={false}
              keyExtractor={(c, idx) => `sidebar-${idx}-${c.id}-${c.slug ?? ''}`}
              renderItem={({ item }) => {
                const sel = item.id === selectedId;
                return (
                  <Pressable onPress={() => setSelectedId(item.id)}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 10, backgroundColor: sel ? '#FFF' : 'transparent' }}>
                      <Text style={{ fontSize: 10, fontWeight: sel ? '500' : '400', color: sel ? categoryTheme.primary : categoryTheme.textDark }} numberOfLines={2}>
                        {sidebarLabel(item)}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 56 }} nestedScrollEnabled>
            <Text style={{ marginHorizontal: 8, marginTop: 8, fontWeight: '600', fontSize: 13.5, color: '#000' }}>Shop by Category</Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                marginTop: 8,
                paddingHorizontal: 6,
                columnGap: subColGap,
                rowGap: 12,
              }}
            >
              <View style={{ width: cellWidth, alignItems: 'center' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View All"
                  onPress={onViewAllPress}
                  disabled={!selected || (listingSlugForViewAll(selected) == null && cateKeyForCategoryListing(selected) == null)}
                >
                  <View
                    style={{
                      height: 55,
                      width: 55,
                      borderRadius: 28,
                      backgroundColor: categoryTheme.sidebarBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      shadowOffset: { height: 2, width: 0 },
                      elevation: 2,
                    }}
                  >
                    <ViewAllGlyph size={26} />
                  </View>
                </Pressable>
                <Text style={{ marginTop: 10, fontSize: 10 }} numberOfLines={2}>
                  View All
                </Text>
              </View>

              {selected.subCategories.map((sub, subIdx) => (
                <SubcategoryCell
                  key={`sub-${selectedId}-${sub.groupMainCategoryId}-${sub.id}-${subIdx}-${sub.slug ?? ''}`}
                  sub={sub}
                  country={country}
                  cellWidth={cellWidth}
                  onPress={() => onSubcategoryPress(sub)}
                />
              ))}
            </View>

            <Text style={{ marginHorizontal: 8, marginTop: 22, marginBottom: 10, fontWeight: '600', fontSize: 13.5 }}>Related Products</Text>
            {relatedRows.length === 0 ? (
              <Text style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 24, fontSize: 12, color: '#6B7280' }}>
                No products found
              </Text>
            ) : (
              relatedRows.map((pair, rowIdx) => (
                <View
                  key={`related-row-${String(pair[0]?.productId)}-${String(pair[1]?.productId ?? 'x')}-${String(rowIdx)}`}
                  style={{ flexDirection: 'row', justifyContent: 'center', gap: relGap, paddingHorizontal: relPad }}
                >
                  <RelatedProductCard
                    item={pair[0]!}
                    country={country}
                    onPressSku={openPdp}
                    cardWidth={relatedCardW}
                    imageHeight={relatedImgH}
                    storeCurrencyFallback={storeCurrencyCode}
                  />
                  {pair[1] ? (
                    <RelatedProductCard
                      item={pair[1]}
                      country={country}
                      onPressSku={openPdp}
                      cardWidth={relatedCardW}
                      imageHeight={relatedImgH}
                      storeCurrencyFallback={storeCurrencyCode}
                    />
                  ) : (
                    <View style={{ width: relatedCardW }} />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      ) : (
        <Text style={{ textAlign: 'center', padding: 36 }}>No categories available</Text>
      )}
    </SafeAreaView>
  );
}
