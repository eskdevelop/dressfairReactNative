import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CategorySearchBar } from '@features/categories/components/CategorySearchBar';

type Props = {
  onBack: () => void;
  onOpenSearch?: () => void;
};

/** Native PDP chrome: back chevron + storefront search pill in one row. */
export function ProductDetailHeader({ onBack, onOpenSearch }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 2,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={{ paddingVertical: 6, paddingHorizontal: 6 }}
      >
        <Ionicons name="chevron-back" size={26} color="#111" />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <CategorySearchBar
          style={{ marginHorizontal: 0, marginRight: 10 }}
          onOpenSearch={onOpenSearch}
        />
      </View>
    </View>
  );
}
