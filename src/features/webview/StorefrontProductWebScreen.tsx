import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { prefetchProductDetail } from '@features/categories/productDetailCache';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { RootStackParamList } from '@navigation/types';
import type { CountryCode } from '@shared/config/env';
import { productHrefForSku } from '@shared/config/env';

type Props = NativeStackScreenProps<RootStackParamList, 'StorefrontProductWeb'>;

/**
 * Root-stack storefront PDP (dynamic `sku`). Slides above all tabs as its own
 * screen; native back returns to the tab the user came from (Category, You, etc.).
 */
export function StorefrontProductWebScreen({ navigation, route }: Props) {
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const { sku } = route.params;

  const path = useMemo(() => productHrefForSku(sku.trim(), country), [sku, country]);

  useEffect(() => {
    void prefetchProductDetail(sku);
  }, [sku]);

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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <WebViewScreen
        key={`storefront-product-web-${sku.trim()}-${country}-${storefrontSurfaceGeneration}`}
        path={path}
        applyWebNavFromStore={false}
        applyTopSafeArea={false}
        statusBarOverContent
        hideStorefrontMobileHeader
        hardwareBackOffloadsToNavigation
        forceMobileStorefrontUserAgent
        syncWebCartToNative
        showLoaderUntilFirstPaint
        waitForStorefrontPdpReady
        loaderShowLogo={false}
      />
    </View>
  );
}
