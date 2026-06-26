import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CountryCode } from '@shared/config/env';

import { cdnAssetUrl, isSupportedRemoteImage } from '../categoryImage';
import type { SubCategoryRow } from '../categoryModel';
import { subcategoryListingSlug } from '../categoryBrowseRoutes';

type Props = {
  subCategories: SubCategoryRow[];
  activeSlug: string;
  country: CountryCode;
  onSelect: (slug: string, title: string) => void;
};

export function CategorySubcategoryStrip({ subCategories, activeSlug, country, onSelect }: Props) {
  if (subCategories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2, gap: 14 }}
    >
      {subCategories.map((sub, idx) => {
        const slug = subcategoryListingSlug(sub);
        const active = slug === activeSlug;
        const rel = sub.image?.trim();
        const uri = rel ? cdnAssetUrl(country, rel) : '';
        const showImg = !!uri && isSupportedRemoteImage(uri);

        return (
          <Pressable
            key={`sub-strip-${sub.id}-${idx}-${slug}`}
            accessibilityRole="button"
            accessibilityLabel={sub.name}
            onPress={() => onSelect(slug, sub.name)}
            style={{ alignItems: 'center', width: 72 }}
          >
            <View
              style={{
                height: 58,
                width: 58,
                borderRadius: 29,
                backgroundColor: '#E5E7EB',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: active ? 2 : 0,
                borderColor: active ? '#111' : 'transparent',
              }}
            >
              {showImg ? (
                <Image source={{ uri }} style={{ height: '100%', width: '100%' }} resizeMode="cover" />
              ) : (
                <Ionicons name="image-outline" size={22} color="#9CA3AF" />
              )}
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 10,
                textAlign: 'center',
                color: active ? '#111' : '#374151',
                fontWeight: active ? '600' : '400',
              }}
              numberOfLines={2}
            >
              {sub.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
