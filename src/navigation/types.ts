import type { NavigatorScreenParams } from '@react-navigation/native';

import type { CustomerProfile, CustomerAddressRecord } from '@features/account/types';
import type { OrderHistoryShortcut } from '@features/orders/orderShortcutFilter';

export type CategoryStackParamList = {
  CategoryHub: undefined;
  CategoryListing: { cateKey: string; titleHint?: string };
  CategoryWebListing: {
    /** Initial `/c/{slug}` segment (category slug for View All; feature hub uses first sub). */
    slug: string;
    titleHint?: string;
    /** Shown in the native search pill (e.g. main category title). */
    searchPlaceholder?: string;
  };
  /** Storefront PDP in a stacked WebView (e.g. related products on Category hub). */
  CategoryProductWeb: { sku: string };
};

export type MainTabParamList = {
  Home: { path?: string } | undefined;
  Category: NavigatorScreenParams<CategoryStackParamList>;
  Search: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Menu: undefined;
  Cart: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  /** Embedded storefront login (same web UI as dressfair.com). */
  StorefrontLoginWeb: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Offline: undefined;
  Maintenance: undefined;
  NotificationRouter: { path?: string } | undefined;
  Terms: undefined;
  Privacy: undefined;
  ReturnPolicy: undefined;
  About: undefined;
  Faq: undefined;
  Contact: undefined;
  OrderHistory: { shortcut?: OrderHistoryShortcut } | undefined;
  MenuSettings: undefined;
  AccountSetting: undefined;
  SafetyCenter: undefined;
  AppPermissions: undefined;
  Profile: undefined;
  ProfileEdit: { profile: CustomerProfile };
  Addresses: undefined;
  AddressForm: {
    mode: 'add' | 'edit';
    profileMobile: string;
    profileFirstname?: string;
    profileLastname?: string;
    address?: CustomerAddressRecord;
  };
};
