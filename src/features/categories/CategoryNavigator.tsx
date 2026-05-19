import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CategoryStackParamList } from '@navigation/types';
import { SearchScreen } from '@features/search/SearchScreen';
import { CategoryHubScreen } from './screens/CategoryHubScreen';
import { CategoryProductListingScreen } from './screens/CategoryProductListingScreen';
import { CategoryProductWebScreen } from './screens/CategoryProductWebScreen';
import { CategoryWebListingScreen } from './screens/CategoryWebListingScreen';

const Stack = createNativeStackNavigator<CategoryStackParamList>();

export function CategoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="CategoryHub" component={CategoryHubScreen} />
      <Stack.Screen name="CategoryListing" component={CategoryProductListingScreen} />
      <Stack.Screen name="CategoryWebListing" component={CategoryWebListingScreen} />
      <Stack.Screen name="CategoryProductWeb" component={CategoryProductWebScreen} />
      <Stack.Screen name="CategorySearch" component={SearchScreen} />
    </Stack.Navigator>
  );
}
