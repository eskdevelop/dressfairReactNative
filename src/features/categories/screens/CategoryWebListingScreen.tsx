import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { CategoryStackParamList } from '@navigation/types';
import { categoryCollectionPath } from '@shared/config/env';

import { CategorySearchBar } from '../components/CategorySearchBar';

type Props = NativeStackScreenProps<CategoryStackParamList, 'CategoryWebListing'>;

export function CategoryWebListingScreen({ navigation, route }: Props) {
  const country = useAppSelector(s => s.app.country);
  const { slug } = route.params;

  const path = useMemo(() => categoryCollectionPath(slug, country), [slug, country]);

  if (!path) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <Text style={{ textAlign: 'center', color: '#111' }}>Invalid category link.</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      <View style={{ paddingTop: 4, paddingBottom: 6 }}>
        <CategorySearchBar />
      </View>

      <View style={{ flex: 1 }}>
        <WebViewScreen path={path} applyWebNavFromStore={false} applyTopSafeArea={false} />
      </View>
    </SafeAreaView>
  );
}
