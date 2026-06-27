import { lazyScreen } from './lazyScreen';

/** Stack screens not needed for Splash → MainTabs → Home cold start. */
export const LazyAuthNavigator = lazyScreen(() =>
  import('@features/auth/AuthNavigator').then(m => ({ default: m.AuthNavigator })),
);

export const LazyStorefrontLoginScreen = lazyScreen(() =>
  import('@features/account/StorefrontLoginScreen').then(m => ({ default: m.StorefrontLoginScreen })),
);

export const LazyNotificationRouterScreen = lazyScreen(() =>
  import('@navigation/NotificationRouterScreen').then(m => ({ default: m.NotificationRouterScreen })),
);

export const LazyTermsScreen = lazyScreen(() =>
  import('@features/menu/screens/TermsScreen').then(m => ({ default: m.TermsScreen })),
);

export const LazyPrivacyScreen = lazyScreen(() =>
  import('@features/menu/screens/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })),
);

export const LazyReturnPolicyScreen = lazyScreen(() =>
  import('@features/menu/screens/ReturnPolicyScreen').then(m => ({ default: m.ReturnPolicyScreen })),
);

export const LazyAboutScreen = lazyScreen(() =>
  import('@features/menu/screens/AboutScreen').then(m => ({ default: m.AboutScreen })),
);

export const LazyFaqScreen = lazyScreen(() =>
  import('@features/menu/screens/FaqScreen').then(m => ({ default: m.FaqScreen })),
);

export const LazyContactScreen = lazyScreen(() =>
  import('@features/menu/screens/ContactScreen').then(m => ({ default: m.ContactScreen })),
);

export const LazyOrderHistoryScreen = lazyScreen(() =>
  import('@features/orders/OrderHistoryScreen').then(m => ({ default: m.OrderHistoryScreen })),
);

export const LazyMenuSettingsScreen = lazyScreen(() =>
  import('@features/menu/screens/MenuSettingsScreen').then(m => ({ default: m.MenuSettingsScreen })),
);

export const LazyAccountSettingScreen = lazyScreen(() =>
  import('@features/settings/AccountSettingScreen').then(m => ({ default: m.AccountSettingScreen })),
);

export const LazySafetyCenterScreen = lazyScreen(() =>
  import('@features/settings/SafetyCenterScreen').then(m => ({ default: m.SafetyCenterScreen })),
);

export const LazyAppPermissionsScreen = lazyScreen(() =>
  import('@features/settings/AppPermissionsScreen').then(m => ({ default: m.AppPermissionsScreen })),
);

export const LazyNotificationsInboxScreen = lazyScreen(() =>
  import('@features/notifications/NotificationsInboxScreen').then(m => ({
    default: m.NotificationsInboxScreen,
  })),
);

export const LazyProfileScreen = lazyScreen(() =>
  import('@features/account/ProfileScreen').then(m => ({ default: m.ProfileScreen })),
);

export const LazyProfileEditScreen = lazyScreen(() =>
  import('@features/account/ProfileEditScreen').then(m => ({ default: m.ProfileEditScreen })),
);

export const LazyAddressListScreen = lazyScreen(() =>
  import('@features/account/AddressListScreen').then(m => ({ default: m.AddressListScreen })),
);

export const LazyAddressFormScreen = lazyScreen(() =>
  import('@features/account/AddressFormScreen').then(m => ({ default: m.AddressFormScreen })),
);

export const LazyCheckoutScreen = lazyScreen(() =>
  import('@features/checkout/screens/CheckoutScreen').then(m => ({ default: m.CheckoutScreen })),
);

export const LazyCardPaymentWebScreen = lazyScreen(() =>
  import('@features/checkout/screens/CardPaymentWebScreen').then(m => ({
    default: m.CardPaymentWebScreen,
  })),
);

export const LazyOrderSuccessScreen = lazyScreen(() =>
  import('@features/checkout/screens/OrderSuccessScreen').then(m => ({ default: m.OrderSuccessScreen })),
);

export const LazyDeliveryGuaranteeScreen = lazyScreen(() =>
  import('@features/checkout/screens/DeliveryGuaranteeScreen').then(m => ({
    default: m.DeliveryGuaranteeScreen,
  })),
);

export const LazyPurchaseProtectionScreen = lazyScreen(() =>
  import('@features/checkout/screens/PurchaseProtectionScreen').then(m => ({
    default: m.PurchaseProtectionScreen,
  })),
);

export const LazyStorefrontCheckoutWebScreen = lazyScreen(() =>
  import('@features/webview/StorefrontCheckoutWebScreen').then(m => ({
    default: m.StorefrontCheckoutWebScreen,
  })),
);

export const LazyStorefrontProductWebScreen = lazyScreen(() =>
  import('@features/webview/StorefrontProductWebScreen').then(m => ({
    default: m.StorefrontProductWebScreen,
  })),
);

export const LazyWishlistScreen = lazyScreen(() =>
  import('@features/wishlist/WishlistScreen').then(m => ({ default: m.WishlistScreen })),
);
