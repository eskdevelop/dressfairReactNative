import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '@features/settings/SettingsScreen';
import { MaintenanceScreen } from '@features/shell/screens/MaintenanceScreen';
import { OfflineScreen } from '@features/shell/screens/OfflineScreen';
import { SplashScreen } from '@features/shell/screens/SplashScreen';
import { MainTabs } from '@navigation/MainTabs';
import { NotificationRouterScreen } from '@navigation/NotificationRouterScreen';
import type { RootStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Settings', presentation: 'modal' }}
      />
      <Stack.Screen name="NotificationRouter" component={NotificationRouterScreen} />
    </Stack.Navigator>
  );
}
