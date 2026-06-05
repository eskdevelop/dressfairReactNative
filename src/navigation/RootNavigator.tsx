import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MaintenanceScreen } from '@features/shell/screens/MaintenanceScreen';
import { OfflineScreen } from '@features/shell/screens/OfflineScreen';
import { SplashScreen } from '@features/shell/screens/SplashScreen';
import { MainTabs } from '@navigation/MainTabs';
import {
  LazyAboutScreen,
  LazyAccountSettingScreen,
  LazyAddressFormScreen,
  LazyAddressListScreen,
  LazyAppPermissionsScreen,
  LazyAuthNavigator,
  LazyCheckoutScreen,
  LazyContactScreen,
  LazyDeliveryGuaranteeScreen,
  LazyFaqScreen,
  LazyMenuSettingsScreen,
  LazyNotificationRouterScreen,
  LazyNotificationsInboxScreen,
  LazyOrderHistoryScreen,
  LazyOrderSuccessScreen,
  LazyPrivacyScreen,
  LazyProfileEditScreen,
  LazyProfileScreen,
  LazyPurchaseProtectionScreen,
  LazyReturnPolicyScreen,
  LazySafetyCenterScreen,
  LazyStorefrontCheckoutWebScreen,
  LazyStorefrontLoginScreen,
  LazyStorefrontProductWebScreen,
  LazyTermsScreen,
  LazyWishlistScreen,
} from '@navigation/lazyScreens';
import type { RootStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ contentStyle: { backgroundColor: 'transparent' } }}
      />
      <Stack.Screen
        name="NativeLogin"
        component={LazyAuthNavigator}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="StorefrontLoginWeb"
        component={LazyStorefrontLoginScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="NotificationRouter" component={LazyNotificationRouterScreen} />
      <Stack.Screen name="Terms" component={LazyTermsScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="Privacy" component={LazyPrivacyScreen} options={{ presentation: 'card' }} />
      <Stack.Screen
        name="ReturnPolicy"
        component={LazyReturnPolicyScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen name="About" component={LazyAboutScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="Faq" component={LazyFaqScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="Contact" component={LazyContactScreen} options={{ presentation: 'card' }} />
      <Stack.Screen
        name="OrderHistory"
        component={LazyOrderHistoryScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="MenuSettings"
        component={LazyMenuSettingsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AccountSetting"
        component={LazyAccountSettingScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="SafetyCenter"
        component={LazySafetyCenterScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AppPermissions"
        component={LazyAppPermissionsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="NotificationsInbox"
        component={LazyNotificationsInboxScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={LazyWishlistScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen name="Profile" component={LazyProfileScreen} options={{ presentation: 'card' }} />
      <Stack.Screen
        name="ProfileEdit"
        component={LazyProfileEditScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Addresses"
        component={LazyAddressListScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AddressForm"
        component={LazyAddressFormScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Checkout"
        component={LazyCheckoutScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={LazyOrderSuccessScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DeliveryGuarantee"
        component={LazyDeliveryGuaranteeScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="PurchaseProtection"
        component={LazyPurchaseProtectionScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="StorefrontCheckoutWeb"
        component={LazyStorefrontCheckoutWebScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="StorefrontProductWeb"
        component={LazyStorefrontProductWebScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
