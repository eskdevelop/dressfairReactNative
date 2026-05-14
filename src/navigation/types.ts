import type { NavigatorScreenParams } from '@react-navigation/native';

import type { CustomerProfile, CustomerAddressRecord } from '@features/account/types';

export type CategoryStackParamList = {
  CategoryHub: undefined;
  CategoryListing: { cateKey: string; titleHint?: string };
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
  OrderHistory: undefined;
  MenuSettings: undefined;
  Profile: undefined;
  ProfileEdit: { profile: CustomerProfile };
  Addresses: undefined;
  AddressForm: {
    mode: 'add' | 'edit';
    profileMobile: string;
    address?: CustomerAddressRecord;
  };
};
