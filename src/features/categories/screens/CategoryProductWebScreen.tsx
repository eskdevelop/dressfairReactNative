import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { CategoryStackParamList } from '@navigation/types';
import { productHrefForSku } from '@shared/config/env';

type Props = NativeStackScreenProps<CategoryStackParamList, 'CategoryProductWeb'>;

export function CategoryProductWebScreen({ navigation, route }: Props) {
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const { sku } = route.params;

  const path = useMemo(() => productHrefForSku(sku.trim(), country), [sku, country]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');
      return undefined;
    }, []),
  );

  if (!path) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <Text style={{ textAlign: 'center', color: '#111' }}>Could not open this product.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E56B2A' }}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <WebViewScreen
        key={`category-product-web-${sku.trim()}-${country}-${storefrontSurfaceGeneration}`}
        path={path}
        applyWebNavFromStore={false}
        applyTopSafeArea={false}
        statusBarOverContent
        hideStorefrontMobileHeader
        forceMobileStorefrontUserAgent
        syncWebCartToNative
      />
    </View>
  );
}
