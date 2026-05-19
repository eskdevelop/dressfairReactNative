import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import type {
  CategoryStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '@navigation/types';
import { productHrefForSku, getEnvConfig } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import {
  cateKeyForCategoryListing,
  listingSlugForViewAll,
} from '@features/categories/categoryBrowseRoutes';
import { loadCachedCategories } from '@features/categories/categoryCache';
import { fetchNormalizeAndPersist } from '@features/categories/categoryHydration';
import type { CategoryRow } from '@features/categories/categoryModel';
import { wishlist } from '@features/wishlist/wishlist';
import { WebViewScreen } from '@features/webview/WebViewScreen';

import {
  APP_SEARCH_BORDER,
  APP_SEARCH_BORDER_WIDTH,
  APP_SEARCH_BTN_H,
  APP_SEARCH_BTN_RADIUS,
  APP_SEARCH_BTN_W,
  APP_SEARCH_FONT_SIZE,
  APP_SEARCH_ICON_SIZE,
  APP_SEARCH_PAD_L,
  APP_SEARCH_PAD_R,
  APP_SEARCH_PAD_V,
  APP_SEARCH_PLACEHOLDER,
  APP_SEARCH_RADIUS,
  APP_SEARCH_SIDE_MARGIN,
} from '@features/categories/components/appSearchBarTokens';

import { PopularCategoryChips, RecentSearchChipRow } from './SearchHomeSections';
import { recentSearches, type RecentSearchEntry } from './recentSearches';
import type { SearchProductHit, SearchSuggestion } from './searchApi';
import { fetchSuggestions, searchProductsLp } from './searchApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

export type SearchScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function categoryStackNavigation(
  nav: SearchScreenNavigation,
): NativeStackNavigationProp<CategoryStackParamList> {
  return nav as unknown as NativeStackNavigationProp<CategoryStackParamList>;
}

const SUGGESTIONS_DEBOUNCE_MS = 200;
const RESULTS_DEBOUNCE_MS = 350;
const GRID_HORIZONTAL_PADDING = spacing.lg;
const GRID_GAP = spacing.md;

export function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigation>();
  const route = useRoute();
  const isCategoryHostedSearch = route.name === 'CategorySearch';
  const country = useAppSelector(state => state.app.country);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistIdSet = useMemo(
    () => new Set(wishlistItems.map(item => item.productId)),
    [wishlistItems],
  );
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [results, setResults] = useState<SearchProductHit[]>([]);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsLastPage, setResultsLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resultsStatus, setResultsStatus] = useState<Status>('idle');
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsStatus, setSuggestionsStatus] = useState<Status>('idle');
  const [recents, setRecents] = useState<RecentSearchEntry[]>([]);
  const [popularCategories, setPopularCategories] = useState<CategoryRow[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  /** Set from embedded browsing-history WebView bridge when the page lists product hits. */
  const [browsingHistoryHasItems, setBrowsingHistoryHasItems] = useState(false);

  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return Math.floor((screenWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2);
  }, []);

  const browsingHistoryPath = useMemo(() => {
    const base = getEnvConfig(country).webCategoriesPath.replace(/\/+$/, '');
    return `${base}/user/browsing-history`;
  }, [country]);

  useEffect(() => {
    setBrowsingHistoryHasItems(false);
  }, [browsingHistoryPath]);

  const onBrowsingHistoryLayout = useCallback((hasItems: boolean) => {
    setBrowsingHistoryHasItems(hasItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      recentSearches.list().then(list => {
        if (active) setRecents(list);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setPopularLoading(true);
        const cached = await loadCachedCategories(country);
        if (cancelled) return;
        if (cached.length > 0) {
          setPopularCategories(cached);
          setPopularLoading(false);
          return;
        }
        const res = await fetchNormalizeAndPersist(country);
        if (cancelled) return;
        setPopularCategories(res.categories);
        setPopularLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [country]),
  );

  /** Android: first back clears the query (Flutter WillPopScope parity). */
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (query.trim().length === 0) return false;
        setQuery('');
        setSuggestions([]);
        setCommittedQuery('');
        setResults([]);
        setResultsPage(1);
        setResultsLastPage(1);
        setResultsStatus('idle');
        return true;
      });
      return () => sub.remove();
    }, [query]),
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1 || trimmed === committedQuery) {
      setSuggestions([]);
      setSuggestionsStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSuggestionsStatus('loading');
      try {
        const items = await fetchSuggestions(trimmed, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setSuggestions(items);
        setSuggestionsStatus('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        crashReporter.capture(error, {
          source: 'SearchScreen.fetchSuggestions',
        });
        setSuggestions([]);
        setSuggestionsStatus('error');
      }
    }, SUGGESTIONS_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, committedQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setResultsStatus('idle');
      setResultsError(null);
      setCommittedQuery('');
      setResultsPage(1);
      setResultsLastPage(1);
      return;
    }
    if (trimmed === committedQuery && resultsStatus === 'success') {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResultsStatus('loading');
      setResultsError(null);
      try {
        const { items, lastPage } = await searchProductsLp(trimmed, {
          signal: controller.signal,
          page: 1,
        });
        if (controller.signal.aborted) return;
        setResults(items);
        setResultsPage(1);
        setResultsLastPage(lastPage);
        setResultsStatus('success');
        setCommittedQuery(trimmed);
        analytics.track('search_query_committed', {
          length: trimmed.length,
          resultCount: items.length,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        crashReporter.capture(error, {
          source: 'SearchScreen.searchProductsLp',
        });
        setResultsStatus('error');
        setResultsError('Unable to search right now. Please try again.');
      }
    }, RESULTS_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, committedQuery, resultsStatus]);

  const loadMoreResults = useCallback(async () => {
    const trimmed = committedQuery.trim();
    if (trimmed.length < 2) return;
    if (loadingMore) return;
    if (resultsStatus !== 'success') return;
    if (resultsPage >= resultsLastPage) return;

    setLoadingMore(true);
    try {
      const nextPage = resultsPage + 1;
      const { items, lastPage } = await searchProductsLp(trimmed, { page: nextPage });
      setResults(prev => {
        const seen = new Set(prev.map(p => p.productId));
        const merged = [...prev];
        for (const it of items) {
          if (!seen.has(it.productId)) {
            seen.add(it.productId);
            merged.push(it);
          }
        }
        return merged;
      });
      setResultsPage(nextPage);
      setResultsLastPage(lastPage);
    } catch (error) {
      crashReporter.capture(error, { source: 'SearchScreen.loadMoreResults' });
    } finally {
      setLoadingMore(false);
    }
  }, [committedQuery, loadingMore, resultsLastPage, resultsPage, resultsStatus]);

  const persistRecent = useCallback(async (term: string, options?: { thumbRelativePath?: string | null }) => {
    try {
      const next = await recentSearches.add(term, options);
      setRecents(next);
    } catch (error) {
      crashReporter.capture(error, { source: 'SearchScreen.persistRecent' });
    }
  }, []);

  const removeRecent = useCallback(async (term: string) => {
    try {
      const next = await recentSearches.remove(term);
      setRecents(next);
    } catch (error) {
      crashReporter.capture(error, { source: 'SearchScreen.removeRecent' });
    }
  }, []);

  const clearRecents = useCallback(async () => {
    try {
      await recentSearches.clear();
      setRecents([]);
    } catch (error) {
      crashReporter.capture(error, { source: 'SearchScreen.clearRecents' });
    }
  }, []);

  const openProductPdp = useCallback(
    (product: SearchProductHit) => {
      const sku = product.sku.trim();
      if (sku.length > 0) {
        if (isCategoryHostedSearch) {
          categoryStackNavigation(navigation).navigate('CategoryProductWeb', {
            sku,
          });
        } else {
          navigation.navigate('StorefrontProductWeb', { sku });
        }
        return;
      }
      openWebPath(product.href);
    },
    [isCategoryHostedSearch, navigation],
  );

  const onProductPress = useCallback(
    (product: SearchProductHit) => {
      analytics.track('search_result_tapped', {
        productId: product.productId,
        sku: product.sku,
        query: committedQuery,
      });
      Keyboard.dismiss();
      const term = committedQuery.length > 0 ? committedQuery : query.trim();
      if (term.length > 0) {
        void persistRecent(term, { thumbRelativePath: product.thumbRelativePath });
      }
      openProductPdp(product);
    },
    [committedQuery, openProductPdp, persistRecent, query],
  );

  const onToggleWishlist = useCallback((product: SearchProductHit) => {
    void wishlist
      .toggle(product)
      .then(({ favourited }) => {
        analytics.track(
          favourited ? 'wishlist_item_added' : 'wishlist_item_removed_from_search',
          {
            productId: product.productId,
            sku: product.sku,
          },
        );
      })
      .catch(error => {
        crashReporter.capture(error, {
          source: 'SearchScreen.toggleWishlist',
        });
      });
  }, []);

  const onSuggestionPress = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.kind === 'product') {
        analytics.track('search_suggestion_tapped', {
          kind: 'product',
          sku: suggestion.sku,
        });
        Keyboard.dismiss();
        const term = query.trim();
        if (term.length > 0) {
          void persistRecent(term);
        }
        const sku = suggestion.sku.trim();
        if (sku.length > 0) {
          if (isCategoryHostedSearch) {
            categoryStackNavigation(navigation).navigate('CategoryProductWeb', {
              sku,
            });
          } else {
            navigation.navigate('StorefrontProductWeb', { sku });
          }
          return;
        }
        const href = productHrefForSku(suggestion.sku, country);
        if (href !== null) {
          openWebPath(href);
        }
        return;
      }
      analytics.track('search_suggestion_tapped', { kind: 'query' });
      setQuery(suggestion.title);
    },
    [country, isCategoryHostedSearch, navigation, persistRecent, query],
  );

  const onRecentPress = useCallback((term: string) => {
    analytics.track('search_recent_reused', { length: term.length });
    setQuery(term);
    inputRef.current?.focus();
  }, []);

  const onSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    void persistRecent(trimmed);
    Keyboard.dismiss();
    if (trimmed.length >= 2) {
      setCommittedQuery('');
      setResultsStatus('idle');
      setResultsPage(1);
      setResultsLastPage(1);
    }
  }, [persistRecent, query]);

  const onPopularCategoryPress = useCallback(
    (cat: CategoryRow) => {
      Keyboard.dismiss();
      analytics.track('search_popular_category_tapped', {
        categoryId: cat.id,
        slug: cat.slug ?? null,
      });
      const slug = listingSlugForViewAll(cat);
      if (slug) {
        const params = { slug, titleHint: cat.name, searchPlaceholder: cat.name };
        if (isCategoryHostedSearch) {
          categoryStackNavigation(navigation).navigate('CategoryWebListing', params);
        } else {
          navigation.navigate('Category', {
            screen: 'CategoryWebListing',
            params,
          });
        }
        return;
      }
      const cateKey = cateKeyForCategoryListing(cat);
      if (cateKey) {
        const params = { cateKey, titleHint: cat.name };
        if (isCategoryHostedSearch) {
          categoryStackNavigation(navigation).navigate('CategoryListing', params);
        } else {
          navigation.navigate('Category', {
            screen: 'CategoryListing',
            params,
          });
        }
      }
    },
    [isCategoryHostedSearch, navigation],
  );

  const renderProduct = useCallback(
    ({ item, index }: { item: SearchProductHit; index: number }) => {
      const favourited = wishlistIdSet.has(item.productId);
      return (
        <View
          style={{
            width: cardWidth,
            marginLeft: index % 2 === 0 ? 0 : GRID_GAP,
            marginBottom: spacing.lg,
          }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${item.name}${item.specialPrice ? `, on sale for ${item.specialPrice}` : ''}`}
            onPress={() => onProductPress(item)}
          >
            <View
              style={{
                width: cardWidth,
                height: cardWidth,
                borderRadius: radii.md,
                backgroundColor: '#F3F4F6',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="image-outline" size={28} color={colors.textMuted} />
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  favourited
                    ? `Remove ${item.name} from wishlist`
                    : `Add ${item.name} to wishlist`
                }
                onPress={() => onToggleWishlist(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID={`search-heart-${item.productId}`}
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  width: 32,
                  height: 32,
                  borderRadius: radii.pill,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={favourited ? 'heart' : 'heart-outline'}
                  size={18}
                  color={favourited ? colors.brand : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <Text
              numberOfLines={2}
              style={{
                color: colors.textPrimary,
                fontWeight: '600',
                marginTop: spacing.sm,
                fontSize: 13,
              }}
            >
              {item.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: spacing.xs,
                gap: spacing.xs,
                flexWrap: 'wrap',
              }}
            >
              {item.specialPrice ? (
                <>
                  <Text style={{ color: colors.brand, fontWeight: '700' }}>
                    {item.currencyCode} {item.specialPrice}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      textDecorationLine: 'line-through',
                      fontSize: 12,
                    }}
                  >
                    {item.currencyCode} {item.price}
                  </Text>
                </>
              ) : item.price.length > 0 ? (
                <Text style={{ color: colors.brand, fontWeight: '700' }}>
                  {item.currencyCode} {item.price}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [cardWidth, onProductPress, onToggleWishlist, wishlistIdSet],
  );

  const renderSuggestion = useCallback(
    ({ item }: { item: SearchSuggestion }) => (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => onSuggestionPress(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary, fontSize: 14 }}
          >
            {item.title}
          </Text>
          {item.kind === 'product' ? (
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              SKU {item.sku}
            </Text>
          ) : null}
        </View>
        <Ionicons
          name={item.kind === 'product' ? 'chevron-forward' : 'arrow-up-outline'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    ),
    [onSuggestionPress],
  );

  const trimmedQuery = query.trim();
  const showZeroState =
    trimmedQuery.length === 0 &&
    recents.length === 0 &&
    !popularLoading &&
    popularCategories.length === 0;
  const showPopular = trimmedQuery.length === 0 && !showZeroState;
  const showSuggestions =
    trimmedQuery.length >= 1 &&
    suggestions.length > 0 &&
    trimmedQuery !== committedQuery;
  const showResultsLoading =
    trimmedQuery.length >= 2 && resultsStatus === 'loading' && results.length === 0;
  const showResultsError = resultsStatus === 'error' && results.length === 0;
  const showNoResults =
    resultsStatus === 'success' &&
    results.length === 0 &&
    committedQuery.length > 0;
  const showResultsGrid = resultsStatus === 'success' && results.length > 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          paddingHorizontal: APP_SEARCH_SIDE_MARGIN,
          paddingTop: 8,
          paddingBottom: spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: APP_SEARCH_BORDER_WIDTH,
            borderColor: APP_SEARCH_BORDER,
            borderRadius: APP_SEARCH_RADIUS,
            paddingLeft: APP_SEARCH_PAD_L,
            paddingRight: APP_SEARCH_PAD_R,
            paddingVertical: APP_SEARCH_PAD_V,
            backgroundColor: '#FFF',
          }}
        >
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmit}
            placeholder={APP_SEARCH_PLACEHOLDER}
            placeholderTextColor="rgba(0,0,0,0.45)"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search products"
            testID="search-input"
            style={{
              flex: 1,
              minHeight: APP_SEARCH_BTN_H,
              paddingVertical: 2,
              color: colors.textPrimary,
              fontSize: APP_SEARCH_FONT_SIZE,
              fontWeight: '400',
            }}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ paddingRight: 4 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 4 }} />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Run search"
            onPress={onSubmit}
            style={{
              height: APP_SEARCH_BTN_H,
              width: APP_SEARCH_BTN_W,
              borderRadius: APP_SEARCH_BTN_RADIUS,
              backgroundColor: '#000',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="search" size={APP_SEARCH_ICON_SIZE} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {showPopular ? (
        <View style={{ flex: 1 }}>
          <View
            style={{ flexShrink: 0, paddingTop: spacing.sm, paddingBottom: spacing.md }}
          >
            <RecentSearchChipRow
              country={country}
              entries={recents}
              onPressQuery={onRecentPress}
              onRemove={removeRecent}
              onClearAll={clearRecents}
            />
            <PopularCategoryChips
              country={country}
              categories={popularCategories}
              loading={popularLoading}
              onPressCategory={onPopularCategoryPress}
            />
            {browsingHistoryHasItems ? (
              <View
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingTop: spacing.md,
                  paddingBottom: spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontWeight: '600',
                    fontSize: 11,
                  }}
                >
                  Browsing history
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              flex: 1,
              minHeight: 280,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <WebViewScreen
              key={`search-browsing-history-${country}`}
              path={browsingHistoryPath}
              applyWebNavFromStore={false}
              applyTopSafeArea={false}
              hideStorefrontMobileHeader
              hideStorefrontMobileFooter
              hideStorefrontMobileFooterMode="semantic"
              forceMobileStorefrontUserAgent
              onBrowsingHistoryLayout={onBrowsingHistoryLayout}
            />
          </View>
        </View>
      ) : null}

      {showZeroState ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
            }}
          >
            Find something you love
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            Search dresses, abayas, kids and more from the DressFair catalogue.
          </Text>
        </View>
      ) : null}

      {showSuggestions ? (
        <FlatList
          data={suggestions}
          keyExtractor={(item, idx) =>
            item.kind === 'product' ? `p:${item.sku}` : `q:${item.title}:${idx}`
          }
          renderItem={renderSuggestion}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {suggestionsStatus === 'loading' ? 'Searching…' : 'Suggestions'}
              </Text>
            </View>
          }
        />
      ) : null}

      {!showSuggestions && showResultsLoading ? (
        <View style={{ paddingTop: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}

      {!showSuggestions && showResultsError ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: colors.danger }}>{resultsError}</Text>
          <TouchableOpacity
            onPress={() => {
              setCommittedQuery('');
              setQuery(q => `${q} `.trimEnd() + (q.endsWith(' ') ? '' : ' '));
            }}
            style={{
              marginTop: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              padding: spacing.md,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: colors.textPrimary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!showSuggestions && showNoResults ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            alignItems: 'center',
          }}
        >
          <Ionicons name="sad-outline" size={36} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              marginTop: spacing.sm,
              fontWeight: '600',
            }}
          >
            No products match &ldquo;{committedQuery}&rdquo;
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              marginTop: spacing.xs,
              textAlign: 'center',
            }}
          >
            Try a different keyword or browse the storefront from the Home tab.
          </Text>
        </View>
      ) : null}

      {!showSuggestions && showResultsGrid ? (
        <FlatList
          data={results}
          keyExtractor={item => item.productId}
          renderItem={renderProduct}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            void loadMoreResults();
          }}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: spacing.lg }}>
                <ActivityIndicator color={colors.brand} />
              </View>
            ) : null
          }
          contentContainerStyle={{
            paddingHorizontal: GRID_HORIZONTAL_PADDING,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}
