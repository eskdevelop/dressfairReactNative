import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import { productHrefForSku } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { wishlist } from '@features/wishlist/wishlist';

import { recentSearches } from './recentSearches';
import type { SearchProductHit, SearchSuggestion } from './searchApi';
import { fetchSuggestions, searchProductsLp } from './searchApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

const SUGGESTIONS_DEBOUNCE_MS = 200;
const RESULTS_DEBOUNCE_MS = 350;
// 32px outer padding on either side, plus a 12px gap between the two columns,
// so the card width drops out of the screen width minus those constants.
const GRID_HORIZONTAL_PADDING = spacing.lg;
const GRID_GAP = spacing.md;

export function SearchScreen() {
  const country = useAppSelector(state => state.app.country);
  // Select the stable `items` reference directly; the slice replaces it
  // wholesale on every mutation so referential equality is enough to drive
  // re-renders without tripping Redux's "selector returned new value" warning
  // that a `.map(...)` selector would. Then derive a productId Set inside
  // useMemo so the per-card heart lookup remains O(1).
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistIdSet = useMemo(
    () => new Set(wishlistItems.map(item => item.productId)),
    [wishlistItems],
  );
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [results, setResults] = useState<SearchProductHit[]>([]);
  const [resultsStatus, setResultsStatus] = useState<Status>('idle');
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsStatus, setSuggestionsStatus] = useState<Status>('idle');
  const [recents, setRecents] = useState<string[]>([]);

  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return Math.floor((screenWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2);
  }, []);

  // Hydrate recents on every focus so a clear-from-Menu propagates.
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

  // Suggestions: cheap and frequent. Fires from the very first character.
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

  // Results: heavier, only fire once the user has typed something meaningful
  // and we still don't have a committed query for the same text.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setResultsStatus('idle');
      setResultsError(null);
      setCommittedQuery('');
      return;
    }
    // Avoid re-firing the same query on every keystroke once committed.
    if (trimmed === committedQuery && resultsStatus === 'success') {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResultsStatus('loading');
      setResultsError(null);
      try {
        const { items } = await searchProductsLp(trimmed, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setResults(items);
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

  const persistRecent = useCallback(async (term: string) => {
    try {
      const next = await recentSearches.add(term);
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
        void persistRecent(term);
      }
      openWebPath(product.href);
    },
    [committedQuery, persistRecent, query],
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
        const href = productHrefForSku(suggestion.sku, country);
        if (href !== null) {
          openWebPath(href);
        }
        return;
      }
      analytics.track('search_suggestion_tapped', { kind: 'query' });
      setQuery(suggestion.title);
    },
    [country, persistRecent, query],
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
  }, [persistRecent, query]);

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
        <Ionicons
          name={item.kind === 'product' ? 'pricetag-outline' : 'search-outline'}
          size={16}
          color={colors.textMuted}
        />
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
  const showRecents = trimmedQuery.length === 0 && recents.length > 0;
  const showZeroState = trimmedQuery.length === 0 && recents.length === 0;
  const showSuggestions =
    trimmedQuery.length >= 1 &&
    suggestions.length > 0 &&
    // Hide suggestions once results have committed for the same query so the
    // grid takes over.
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
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          Search
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            backgroundColor: '#F9FAFB',
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={{ marginRight: spacing.sm }}
          />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmit}
            placeholder="Search dresses, abayas, kids…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search products"
            testID="search-input"
            style={{
              flex: 1,
              paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: '400',
            }}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showRecents ? (
        <View
          style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>
              Recent searches
            </Text>
            <TouchableOpacity onPress={clearRecents} accessibilityRole="button">
              <Text style={{ color: colors.brand }}>Clear all</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {recents.map(term => (
              <View
                key={term}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.pill,
                  paddingLeft: spacing.md,
                  paddingRight: spacing.sm,
                  paddingVertical: spacing.xs,
                }}
              >
                <TouchableOpacity
                  onPress={() => onRecentPress(term)}
                  accessibilityRole="button"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={{ color: colors.textPrimary }}>{term}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeRecent(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${term} from recent searches`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={{ marginLeft: spacing.xs }}
                >
                  <Ionicons name="close" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
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
                {suggestionsStatus === 'loading'
                  ? 'Searching…'
                  : 'Suggestions'}
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
          contentContainerStyle={{
            paddingHorizontal: GRID_HORIZONTAL_PADDING,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
          }}
        />
      ) : null}
      {/* TODO pagination: hook FlatList.onEndReached and call
          searchProductsLp(query, { page: nextPage }) when current_page < last_page. */}
    </SafeAreaView>
  );
}
