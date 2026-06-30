import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { ProductDetailHeader } from '@features/webview/components/ProductDetailHeader';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { CategoryStackParamList } from '@navigation/types';
import { productHrefForSku } from '@shared/config/env';

type Props = NativeStackScreenProps<CategoryStackParamList, 'CategoryProductWeb'>;

export function CategoryProductWebScreen({ navigation, route }: Props) {
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const { sku } = route.params;

  const path = useMemo(() => productHrefForSku(sku.trim(), country), [sku, country]);

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!path) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <Text style={{ textAlign: 'center', color: '#111' }}>Could not open this product.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E56B2A' }}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ProductDetailHeader
        onBack={onBack}
        onOpenSearch={() => navigation.navigate('CategorySearch')}
      />
      <View style={{ flex: 1 }}>
        <WebViewScreen
          key={`category-product-web-${sku.trim()}-${country}-${storefrontSurfaceGeneration}`}
          path={path}
          applyWebNavFromStore={false}
          applyTopSafeArea={false}
          hideStorefrontMobileHeader
          hardwareBackOffloadsToNavigation
          forceMobileStorefrontUserAgent
          syncWebCartToNative
          showLoaderUntilFirstPaint
          waitForStorefrontPdpReady
          loaderShowLogo={false}
        />
      </View>
    </SafeAreaView>
  );
}
