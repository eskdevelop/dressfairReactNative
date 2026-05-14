import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CategoryStackParamList } from '@navigation/types';
import { CategoryHubScreen } from './screens/CategoryHubScreen';
import { CategoryProductListingScreen } from './screens/CategoryProductListingScreen';

const Stack = createNativeStackNavigator<CategoryStackParamList>();

export function CategoryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoryHub" component={CategoryHubScreen} />
      <Stack.Screen name="CategoryListing" component={CategoryProductListingScreen} />
    </Stack.Navigator>
  );
}
