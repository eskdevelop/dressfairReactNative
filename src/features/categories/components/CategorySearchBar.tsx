import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { openSearchTab } from '@navigation/navigationRef';

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
} from './appSearchBarTokens';

type Props = {
  /** Merged after defaults; use to tighten margins when paired with a back button. */
  style?: StyleProp<ViewStyle>;
  /** When set (e.g. current category name on PLP), replaces the default Dress Fair placeholder. */
  placeholder?: string;
  /** Matches storefront PLP: small camera inside the field before the search control. */
  showCameraIcon?: boolean;
};

/** Same pill search field used on the Category hub, PLP chrome, and styled like Search tab. */
export function CategorySearchBar({ style, placeholder, showCameraIcon }: Props) {
  const label = (placeholder ?? '').trim() || APP_SEARCH_PLACEHOLDER;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => openSearchTab()}
      style={[
        {
          marginHorizontal: APP_SEARCH_SIDE_MARGIN,
          paddingLeft: APP_SEARCH_PAD_L,
          paddingRight: APP_SEARCH_PAD_R,
          paddingVertical: APP_SEARCH_PAD_V,
          borderRadius: APP_SEARCH_RADIUS,
          borderWidth: APP_SEARCH_BORDER_WIDTH,
          borderColor: APP_SEARCH_BORDER,
          backgroundColor: '#FFF',
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{ flex: 1, color: 'rgba(0,0,0,0.55)', fontSize: APP_SEARCH_FONT_SIZE }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {showCameraIcon ? (
        <>
          <View style={{ width: 6 }} pointerEvents="none" />
          <Ionicons name="camera-outline" size={18} color="rgba(0,0,0,0.45)" />
        </>
      ) : null}
      <View style={{ width: 8 }} pointerEvents="none" />
      <View
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
      </View>
    </Pressable>
  );
}
