import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';
import type { CategoryRow } from '@features/categories/categoryModel';
import { cdnAssetUrl, isSupportedRemoteImage } from '@features/categories/categoryImage';
import type { CountryCode } from '@shared/config/env';

import type { RecentSearchEntry } from './recentSearches';

/** Fallback mark for chips (Dress Fair app icon). */
const BRAND_MARK = require('../../../assets/icon.png');

const CHIP_BG = '#F3F4F6';
/** Recent-search row thumbnails (slightly larger than category for tap targets). */
const RECENT_THUMB = 22;
/** Category chips: compact to fit 2–3 per row. */
const POPULAR_THUMB = 22;
const CHIP_GAP = 6;

/** Min width before we use 2 columns instead of 3 for category chips. */
const POPULAR_TWO_COL_BREAKPOINT = 360;

function useCompactChipWidth(): number {
  const { width: ww } = useWindowDimensions();
  const numCols = ww < POPULAR_TWO_COL_BREAKPOINT ? 2 : 3;
  const horizontalPad = spacing.lg * 2;
  return Math.max(
    96,
    Math.floor((ww - horizontalPad - CHIP_GAP * (numCols - 1)) / numCols),
  );
}

function resolveChipImageUri(country: CountryCode, raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) {
    return isSupportedRemoteImage(t) ? t : null;
  }
  const u = cdnAssetUrl(country, t);
  return isSupportedRemoteImage(u) ? u : null;
}

function categoryVisualUri(cat: CategoryRow, country: CountryCode): string | null {
  const primary = resolveChipImageUri(country, cat.image);
  if (primary) return primary;
  for (const sub of cat.subCategories) {
    const u = resolveChipImageUri(country, sub.image);
    if (u) return u;
  }
  return null;
}

type RecentSearchChipRowProps = {
  country: CountryCode;
  entries: RecentSearchEntry[];
  onPressQuery: (query: string) => void;
  onRemove: (query: string) => void;
  onClearAll: () => void;
};

export function RecentSearchChipRow({
  country,
  entries,
  onPressQuery,
  onRemove,
  onClearAll,
}: RecentSearchChipRowProps) {
  const chipWidth = useCompactChipWidth();

  if (entries.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 11 }}>
          Recently searched
        </Text>
        <TouchableOpacity
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear all recent searches"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: spacing.lg,
          columnGap: CHIP_GAP,
          rowGap: CHIP_GAP,
        }}
      >
        {entries.map(entry => {
          const rel = entry.thumbRelativePath ?? null;
          const uri = rel ? resolveChipImageUri(country, rel) : null;
          return (
            <TouchableOpacity
              key={entry.query}
              accessibilityRole="button"
              onPress={() => onPressQuery(entry.query)}
              style={{
                width: chipWidth,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: CHIP_BG,
                borderRadius: radii.pill,
                paddingVertical: 5,
                paddingLeft: 4,
                paddingRight: 6,
              }}
            >
              <View
                style={{
                  width: RECENT_THUMB,
                  height: RECENT_THUMB,
                  borderRadius: RECENT_THUMB / 2,
                  backgroundColor: '#E5E7EB',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {uri ? (
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Ionicons name="search" size={11} color={colors.textMuted} />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: 6,
                  color: colors.textPrimary,
                  fontSize: 11,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {entry.query}
              </Text>
              <TouchableOpacity
                onPress={() => onRemove(entry.query)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${entry.query} from recent searches`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 2 }}
              >
                <Ionicons name="close-circle" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

type PopularCategoryChipsProps = {
  country: CountryCode;
  categories: CategoryRow[];
  onPressCategory: (cat: CategoryRow) => void;
  loading?: boolean;
};

export function PopularCategoryChips({
  country,
  categories,
  onPressCategory,
  loading = false,
}: PopularCategoryChipsProps) {
  const chipWidth = useCompactChipWidth();

  return (
    <View>
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 11 }}>
          Popular right now
        </Text>
      </View>
      {loading && categories.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing.md, paddingBottom: spacing.lg }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: spacing.lg,
            columnGap: CHIP_GAP,
            rowGap: CHIP_GAP,
            paddingBottom: spacing.sm,
          }}
        >
          {categories.map(cat => {
          const uri = categoryVisualUri(cat, country);
          return (
            <TouchableOpacity
              key={`pop-${cat.id}-${cat.name}`}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              onPress={() => onPressCategory(cat)}
              style={{
                width: chipWidth,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: CHIP_BG,
                borderRadius: radii.pill,
                paddingVertical: 5,
                paddingLeft: 4,
                paddingRight: 8,
              }}
            >
              <View
                style={{
                  width: POPULAR_THUMB,
                  height: POPULAR_THUMB,
                  borderRadius: POPULAR_THUMB / 2,
                  backgroundColor: '#000',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {uri ? (
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Image source={BRAND_MARK} style={{ width: 14, height: 14 }} resizeMode="contain" />
                )}
              </View>
              <Ionicons name="flame" size={10} color="#EA580C" style={{ marginLeft: 4 }} />
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: 2,
                  color: colors.textPrimary,
                  fontSize: 11,
                  fontWeight: '500',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      )}
    </View>
  );
}
