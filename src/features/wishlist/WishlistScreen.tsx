
import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { wishlist } from './wishlist';
import type { WishlistItem } from './wishlistStore';

const GRID_HORIZONTAL_PADDING = spacing.lg;
const GRID_GAP = spacing.md;

export function WishlistScreen() {
  const items = useAppSelector(state => state.wishlist.items);
/// Wishlist
  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return Math.floor((screenWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2);
  }, []);
  // Re-hydrate on every focus so a remove from another screen shows here
  // immediately. The runtime listeners already update Redux on mutation,
  // but a focus-driven hydrate keeps the list eventually consistent if
  // anyone ever bypasses the wishlist facade.
  useFocusEffect(
    useCallback(() => {
      void wishlist.hydrateFromStorage().catch(error => {
        crashReporter.capture(error, {
          source: 'WishlistScreen.hydrate',
        });
      });
    }, []),
  );

  const onPressItem = useCallback((item: WishlistItem) => {
    analytics.track('wishlist_item_opened', {
      productId: item.productId,
    });
    if (item.href && item.href.length > 0) {
      openWebPath(item.href);
    }
  }, []);

  const onRemoveItem = useCallback((item: WishlistItem) => {
    Alert.alert('Remove from wishlist', `Remove "${item.name}" from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          analytics.track('wishlist_item_removed', {
            productId: item.productId,
          });
          void wishlist.remove(item.productId).catch(error => {
            crashReporter.capture(error, {
              source: 'WishlistScreen.remove',
            });
          });
        },
      },
    ]);
  }, []);

  const onClearAll = useCallback(() => {
    if (items.length === 0) return;
    Alert.alert(
      'Clear wishlist',
      'All saved items will be removed from your wishlist.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => {
            analytics.track('wishlist_clear_all', { count: items.length });
            void wishlist.clearAll().catch(error => {
              crashReporter.capture(error, {
                source: 'WishlistScreen.clearAll',
              });
            });
          },
        },
      ],
    );
  }, [items.length]);

  const renderItem = useCallback(
    ({ item, index }: { item: WishlistItem; index: number }) => (
      <View
        style={{
          width: cardWidth,
          marginLeft: index % 2 === 0 ? 0 : GRID_GAP,
          marginBottom: spacing.lg,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() => onPressItem(item)}
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
              accessibilityLabel={`Remove ${item.name} from wishlist`}
              onPress={() => onRemoveItem(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              <Ionicons name="heart" size={18} color={colors.brand} />
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
    ),
    [cardWidth, onPressItem, onRemoveItem],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.textPrimary,
            }}
          >
            Wishlist
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
            {items.length === 0
              ? 'Save items to view them offline'
              : items.length === 1
                ? '1 saved item'
                : `${items.length} saved items`}
          </Text>
        </View>
        {items.length > 0 ? (
          <TouchableOpacity
            onPress={onClearAll}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '600' }}>
              Clear all
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
            }}
          >
            Your wishlist is empty
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            Tap the heart on any search result to save it here. Your saved
            items are stored on this device and remain available offline.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.productId}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: GRID_HORIZONTAL_PADDING,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
          }}
        />
      )}
    </SafeAreaView>
  );
}
