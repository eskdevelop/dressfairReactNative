import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { selectCartItems } from '@features/cart/cartSlice';
import { cartItemsToWebJson } from '@features/cart/parseWebCartItems';
import { buildWriteWebCartInjection } from '@features/cart/cartStorageBridgeInjection';
import { checkoutWebUrl } from '@features/cart/cartUtils';
import type { RootStackParamList } from '@navigation/types';
import { getEnvConfig, type CountryCode } from '@shared/config/env';

import { WebViewScreen } from './WebViewScreen';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StorefrontCheckoutWeb'>;

export function StorefrontCheckoutWebScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const items = useAppSelector(selectCartItems);
  const selectedItems = useMemo(() => items.filter(row => row.isSelected), [items]);
  const cfg = getEnvConfig(country);
  const checkoutUri = checkoutWebUrl(cfg.webCartUrl);

  const beforeCartWrite = useMemo(() => {
    const json = cartItemsToWebJson(selectedItems.length > 0 ? selectedItems : items);
    return buildWriteWebCartInjection(JSON.stringify(json));
  }, [items, selectedItems]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}
      >
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        <WebViewScreen
          path={checkoutUri}
          hideStorefrontMobileHeader
          applyTopSafeArea={false}
          extraBeforeContentScripts={beforeCartWrite}
        />
      </View>
    </SafeAreaView>
  );
}
