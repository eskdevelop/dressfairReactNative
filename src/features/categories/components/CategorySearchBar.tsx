import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { openSearchTab } from '@navigation/navigationRef';

type Props = {
  /** Merged after defaults; use to tighten margins when paired with a back button. */
  style?: StyleProp<ViewStyle>;
};

/** Flutter [`HomeSearchBar`](src/flutter-code/.../home_search_bar.dart) layout. */
export function CategorySearchBar({ style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search Dress Fair"
      onPress={() => openSearchTab()}
      style={[
        {
          marginHorizontal: 12,
          paddingLeft: 16,
          paddingRight: 6,
          paddingVertical: 6,
          borderRadius: 30,
          borderWidth: 1.5,
          borderColor: 'rgba(0,0,0,0.55)',
          backgroundColor: '#FFF',
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text style={{ flex: 1, color: 'rgba(0,0,0,0.55)', fontSize: 14 }}>
        Search Dress Fair
      </Text>
      <View style={{ width: 34 }} pointerEvents="none" />
      <View
        style={{
          height: 30,
          width: 42,
          borderRadius: 16,
          backgroundColor: '#000',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="search" size={20} color="#FFF" />
      </View>
    </Pressable>
  );
}
