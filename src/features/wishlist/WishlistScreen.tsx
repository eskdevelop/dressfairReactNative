import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { wishlist } from './wishlist';
import type { WishlistItem } from './wishlistStore';

const GRID_HORIZONTAL_PADDING = spacing.lg;
const GRID_GAP = spacing.md;

export function WishlistScreen() {
  const navigation = useNavigation();
  const items = useAppSelector(state => state.wishlist.items);
  const [removeTarget, setRemoveTarget] = useState<WishlistItem | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
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
    setRemoveTarget(item);
  }, []);

  const confirmRemoveItem = useCallback(() => {
    const item = removeTarget;
    if (!item) return;
    setRemoveTarget(null);
    analytics.track('wishlist_item_removed', { productId: item.productId });
    void wishlist.remove(item.productId).catch(error => {
      crashReporter.capture(error, { source: 'WishlistScreen.remove' });
    });
  }, [removeTarget]);

  const onClearAll = useCallback(() => {
    if (items.length === 0) return;
    setClearAllConfirm(true);
  }, [items.length]);

  const confirmClearAll = useCallback(() => {
    setClearAllConfirm(false);
    analytics.track('wishlist_clear_all', { count: items.length });
    void wishlist.clearAll().catch(error => {
      crashReporter.capture(error, { source: 'WishlistScreen.clearAll' });
    });
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
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '700',
            color: '#000000',
          }}
        >
          Wishlist
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            gap: spacing.md,
          }}
        >
          <Text style={{ flex: 1, color: colors.textMuted }}>
            {items.length === 1 ? '1 saved item' : `${items.length} saved items`}
          </Text>
          <TouchableOpacity
            onPress={onClearAll}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '600' }}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

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

      <AppDeleteDialog
        visible={removeTarget !== null}
        message={
          removeTarget
            ? `Remove "${removeTarget.name}" from your wishlist?`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={confirmRemoveItem}
        onCancel={() => setRemoveTarget(null)}
      />

      <AppDeleteDialog
        visible={clearAllConfirm}
        message="All saved items will be removed from your wishlist."
        confirmLabel="Clear all"
        onConfirm={confirmClearAll}
        onCancel={() => setClearAllConfirm(false)}
      />
    </SafeAreaView>
  );
}
