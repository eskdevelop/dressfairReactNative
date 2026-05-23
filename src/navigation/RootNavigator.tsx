import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MaintenanceScreen } from '@features/shell/screens/MaintenanceScreen';
import { OfflineScreen } from '@features/shell/screens/OfflineScreen';
import { SplashScreen } from '@features/shell/screens/SplashScreen';
import { AboutScreen } from '@features/menu/screens/AboutScreen';
import { ContactScreen } from '@features/menu/screens/ContactScreen';
import { FaqScreen } from '@features/menu/screens/FaqScreen';
import { PrivacyScreen } from '@features/menu/screens/PrivacyScreen';
import { ReturnPolicyScreen } from '@features/menu/screens/ReturnPolicyScreen';
import { TermsScreen } from '@features/menu/screens/TermsScreen';
import { ProfileScreen } from '@features/account/ProfileScreen';
import { ProfileEditScreen } from '@features/account/ProfileEditScreen';
import { AddressListScreen } from '@features/account/AddressListScreen';
import { AddressFormScreen } from '@features/account/AddressFormScreen';
import { AccountSettingScreen } from '@features/settings/AccountSettingScreen';
import { AppPermissionsScreen } from '@features/settings/AppPermissionsScreen';
import { SafetyCenterScreen } from '@features/settings/SafetyCenterScreen';
import { MenuSettingsScreen } from '@features/menu/screens/MenuSettingsScreen';
import { OrderHistoryScreen } from '@features/orders/OrderHistoryScreen';
import { AuthNavigator } from '@features/auth/AuthNavigator';
import { CheckoutScreen } from '@features/checkout/screens/CheckoutScreen';
import { DeliveryGuaranteeScreen } from '@features/checkout/screens/DeliveryGuaranteeScreen';
import { PurchaseProtectionScreen } from '@features/checkout/screens/PurchaseProtectionScreen';
import { OrderSuccessScreen } from '@features/checkout/screens/OrderSuccessScreen';
import { StorefrontLoginScreen } from '@features/account/StorefrontLoginScreen';
import { StorefrontCheckoutWebScreen } from '@features/webview/StorefrontCheckoutWebScreen';
import { StorefrontProductWebScreen } from '@features/webview/StorefrontProductWebScreen';
import { MainTabs } from '@navigation/MainTabs';
import { NotificationRouterScreen } from '@navigation/NotificationRouterScreen';
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
        component={AuthNavigator}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="StorefrontLoginWeb"
        component={StorefrontLoginScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="NotificationRouter" component={NotificationRouterScreen} />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="ReturnPolicy"
        component={ReturnPolicyScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Faq"
        component={FaqScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="MenuSettings"
        component={MenuSettingsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AccountSetting"
        component={AccountSettingScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="SafetyCenter"
        component={SafetyCenterScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AppPermissions"
        component={AppPermissionsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressListScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AddressForm"
        component={AddressFormScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DeliveryGuarantee"
        component={DeliveryGuaranteeScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="PurchaseProtection"
        component={PurchaseProtectionScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="StorefrontCheckoutWeb"
        component={StorefrontCheckoutWebScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="StorefrontProductWeb"
        component={StorefrontProductWebScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
