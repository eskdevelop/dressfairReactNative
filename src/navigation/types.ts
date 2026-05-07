import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: { path?: string } | undefined;
  Search: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Menu: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Offline: undefined;
  Maintenance: undefined;
  // Legacy entry kept for cold-start deep links from notifications and
  // universal links so existing payloads keep working. New in-app
  // navigation goes through the MainTabs Home screen with a `path` param.
  NotificationRouter: { path?: string } | undefined;
  Terms: undefined;
  Privacy: undefined;
  ReturnPolicy: undefined;
  About: undefined;
  Faq: undefined;
  Contact: undefined;
  OrderHistory: undefined;
};
