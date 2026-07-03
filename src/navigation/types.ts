import type { NavigatorScreenParams } from '@react-navigation/native';

import type { CustomerProfile, CustomerAddressRecord } from '@features/account/types';
import type { OrderHistoryShortcut } from '@features/orders/orderShortcutFilter';
import type { Order, OrderCustomer } from '@features/orders/types';

/** Instant PDP shell data from a listing tile — shown while the WebView hydrates. */
export type StorefrontProductSeed = {
  name: string;
  image?: string;
  priceText?: string;
};

export type CategoryStackParamList = {
  CategoryHub: undefined;
  CategoryListing: {
    /** Store REST path key, e.g. `w-cloth`. */
    cateSlug: string;
    titleHint?: string;
    /** Shown in the native search pill (e.g. main category title). */
    searchPlaceholder?: string;
    /** Parent hub category id — renders subcategory icon strip. */
    hubCategoryId?: number;
  };
  CategoryWebListing: {
    /** Initial `/c/{slug}` segment (category slug for View All; feature hub uses first sub). */
    slug: string;
    titleHint?: string;
    /** Shown in the native search pill (e.g. main category title). */
    searchPlaceholder?: string;
  };
  /** Storefront PDP in a stacked WebView (e.g. related products on Category hub). */
  CategoryProductWeb: { sku: string };
  /** Full-screen search from category/PLP chrome; stays on Category tab (avoids hidden Search tab focus quirks). */
  CategorySearch: undefined;
};

export type MainTabParamList = {
  Home: { path?: string } | undefined;
  Category: NavigatorScreenParams<CategoryStackParamList>;
  Search: undefined;
  Menu: undefined;
  Cart: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  /** Native login stack (Flutter-parity screens). */
  NativeLogin: undefined;
  /** Legacy WebView storefront login — kept for rollback. */
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
  OrderDetail: { order: Order; customer?: OrderCustomer };
  /** Storefront PDP opened above tabs (e.g. You → new arrivals) so back returns to the same tab. */
  StorefrontProductWeb: { sku: string; seed?: StorefrontProductSeed };
  /** Native checkout — selected cart lines from Redux. */
  Checkout: undefined;
  /** Hosted Stripe Checkout for card orders; returns to OrderSuccess on payment. */
  CardPaymentWeb: { checkoutUrl: string; orderId: string };
  OrderSuccess: { orderId: string };
  DeliveryGuarantee: undefined;
  PurchaseProtection: undefined;
  /** @deprecated Web checkout — use native Checkout. */
  StorefrontCheckoutWeb: undefined;
  MenuSettings: undefined;
  NotificationsInbox: undefined;
  /** Saved items, opened above tabs so back returns to the You tab (not app exit). */
  Wishlist: undefined;
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
