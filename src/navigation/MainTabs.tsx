import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, AppState, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors } from '@app/theme/tokens';
import { selectCartBadgeQuantity, selectWebWriteGeneration } from '@features/cart/cartSlice';
import { CategorySearchBar } from '@features/categories/components/CategorySearchBar';
import { CategoryNavigator } from '@features/categories/CategoryNavigator';
import { AccountScreen } from '@features/account/AccountScreen';
import { SearchScreen } from '@features/search/SearchScreen';
import { CartScreen } from '@features/cart/screens/CartScreen';
import { CartWebWriteBridge } from '@features/cart/CartWebWriteBridge';
import { hydrateNativeCart } from '@features/cart/cartActions';
import { WebViewScreen, type WebViewScreenController } from '@features/webview/WebViewScreen';
import { ProductDetailHeader } from '@features/webview/components/ProductDetailHeader';
import { notificationInbox } from '@features/notifications/notificationInbox';
import { selectUnreadNotificationCount } from '@features/notifications/selectors';
import { wishlist } from '@features/wishlist/wishlist';
import { crashReporter } from '@shared/observability/crash';
import { isStorefrontProductDetailUrl, storefrontHomePath } from '@shared/config/env';

import { CenteredTabBarButton } from './CenteredTabBarButton';
import { MAIN_TAB_BAR_CONTENT_HEIGHT } from './tabBarMetrics';
import type { MainTabParamList } from './types';
import { useTabBarBottomInset } from './useTabBarBottomInset';

const Tab = createBottomTabNavigator<MainTabParamList>();
/** Temu-like muted inactive tabs (tab bar only; keeps global textMuted unchanged). */
const TAB_BAR_INACTIVE_TINT = '#9CA3AF';

function formatTabBadge(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count > 99 ? '99+' : String(count);
}

// The Home tab hosts the WebView. Cold-start deep links land here via the
// `path` route param (set by `openWebPath`); the WebView itself watches the
// `webNav` slice for in-session cross-tab navigation requests.
function HomeTab({ route }: { route: RouteProp<MainTabParamList, 'Home'> }) {
  const country = useAppSelector(s => s.app.country);
  // Deep links may pass an explicit path; otherwise pin the locale root (`/ae`,
  // `/om`, `/sa`) so the storefront renders the correct store. The bare root `/`
  // relies on the site's geo detection and can load a wrong locale.
  const initialPath = route.params?.path ?? storefrontHomePath(country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  const webControllerRef = useRef<WebViewScreenController | null>(null);
  const webCanGoBackRef = useRef(false);
  const [onProductDetail, setOnProductDetail] = useState(
    () => isStorefrontProductDetailUrl(initialPath),
  );

  const onStorefrontUrlChange = useCallback((state: { url: string; canGoBack: boolean; isProductPage: boolean }) => {
    webCanGoBackRef.current = state.canGoBack;
    setOnProductDetail(state.isProductPage);
  }, []);

  const onProductBackPress = useCallback(() => {
    if (webCanGoBackRef.current) {
      webControllerRef.current?.goBack();
      return;
    }
    webControllerRef.current?.navigateToRegionalHome();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      {onProductDetail ? (
        <ProductDetailHeader onBack={onProductBackPress} />
      ) : (
        <>
          <View style={{ paddingTop: 6 }}>
            <CategorySearchBar />
          </View>
          <View style={{ height: 8 }} />
        </>
      )}
      <View style={{ flex: 1 }}>
        <WebViewScreen
          key={`home-tab-wv-${country}-${storefrontSurfaceGeneration}`}
          path={initialPath}
          applyWebNavFromStore
          tabReselectMode="home"
          reportCartCountToNative
          syncWebCartToNative
          hideStorefrontMobileHeader
          applyTopSafeArea={false}
          onStorefrontUrlChange={onStorefrontUrlChange}
          controllerRef={webControllerRef}
        />
      </View>
    </SafeAreaView>
  );
}

function CartTab() {
  return <CartScreen />;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcon =
  (focusedName: IoniconName, name: IoniconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} color={color} size={size} />
  );

/** Temu-style category cue: thin outline search + light catalog strokes (inactive reads softer). */
function CategoryTabIcon({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) {
  const s = focused ? Math.min(size + 1, 26) : Math.min(size, 23);
  const lineW = Math.round(s * 0.4);
  const lineThickness = focused ? 2 : 1;
  const searchName = focused ? 'search' : 'search-outline';
  const opacity = focused ? 1 : 0.82;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <Ionicons name={searchName} size={Math.round(s * 0.9)} color={color} />
      <View style={{ marginLeft: 2, justifyContent: 'center' }}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={{
              width: lineW,
              height: lineThickness,
              borderRadius: lineThickness > 1 ? 1 : 0,
              backgroundColor: color,
              marginVertical: focused ? 1 : 0.75,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const hiddenTabBarButton = () => null;

/** Hidden tabs still mount `BottomTabItem` wrappers; overriding flex/layout keeps
 *  ghost routes from reserving columns (otherwise only ~4/7 of the bar is
 *  usable and labels truncate). RN `display` collapses layout on modern Yoga. */
const hiddenTabBarItemStyle: StyleProp<ViewStyle> = {
  display: 'none',
};

/** Matches `@react-navigation/bottom-tabs` TabBarIcon `wrapperUikit` (31×28) so rows align with other tabs. */
const TAB_BAR_ICON_FRAME = { width: 31, height: 28 } as const;

function TabBarBadgeChip({
  label,
  right = -9,
  top = 1,
}: {
  label: string;
  right?: number;
  top?: number;
}) {
  const h = 15;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        right,
        backgroundColor: colors.brand,
        borderRadius: h / 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: h,
        minHeight: h,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700', lineHeight: 11 }}>{label}</Text>
    </View>
  );
}

/** You tab badge reflects unread notification count (hidden when zero). */
function YouTabBarIconWrapper({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) {
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const badge = formatTabBadge(unreadCount);
  return <YouTabBarIcon color={color} size={size} focused={focused} badge={badge} />;
}

function YouTabBarIcon({
  color,
  size,
  focused,
  badge,
}: {
  color: string;
  size: number;
  focused: boolean;
  badge?: string;
}) {
  const name = focused ? 'person' : 'person-outline';
  return (
    <View style={[TAB_BAR_ICON_FRAME, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name={name} color={color} size={size} />
      {badge != null ? <TabBarBadgeChip label={badge} /> : null}
    </View>
  );
}

function CartTabBarIcon({
  color,
  size,
  focused,
  quantity,
}: {
  color: string;
  size: number;
  focused: boolean;
  quantity: number;
}) {
  const name = focused ? 'cart' : 'cart-outline';
  const badge = formatTabBadge(quantity);
  return (
    <View style={[TAB_BAR_ICON_FRAME, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name={name} color={color} size={size} />
      {badge != null ? <TabBarBadgeChip label={badge} right={-5} top={-1} /> : null}
    </View>
  );
}

function CartTabBarIconWrapper({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) {
  const quantity = useAppSelector(selectCartBadgeQuantity);
  return <CartTabBarIcon color={color} size={size} focused={focused} quantity={quantity} />;
}

export function MainTabs() {
  const dispatch = useAppDispatch();
  const webWriteGeneration = useAppSelector(selectWebWriteGeneration);

  // Hydrate the inbox and wishlist once at the tab shell mount so counts on
  // the Menu screen and initial state are correct. Subsequent updates flow
  // through the notificationRuntime listeners and the wishlist facade.
  useEffect(() => {
    void notificationInbox.hydrateFromStorage().catch(error => {
      crashReporter.capture(error, { source: 'MainTabs.hydrate' });
    });
    void wishlist.hydrateFromStorage().catch(error => {
      crashReporter.capture(error, { source: 'MainTabs.hydrateWishlist' });
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') return;
      void notificationInbox.hydrateFromStorage().catch(error => {
        crashReporter.capture(error, { source: 'MainTabs.hydrateOnForeground' });
      });
    });
    return () => sub.remove();
  }, []);

  const country = useAppSelector(s => s.app.country);
  useEffect(() => {
    void hydrateNativeCart(dispatch, country);
  }, [country, dispatch]);

  const tabBarBottomInset = useTabBarBottomInset();
  const tabBarHeight = MAIN_TAB_BAR_CONTENT_HEIGHT + tabBarBottomInset;

  const renderTabBarButton = useCallback(
    (props: BottomTabBarButtonProps) => <CenteredTabBarButton {...props} />,
    [],
  );

  const screenOptions = useMemo(
    () => ({
      lazy: true,
      freezeOnBlur: true,
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: TAB_BAR_INACTIVE_TINT,
      tabBarButton: renderTabBarButton,
      tabBarStyle: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: 2,
        paddingBottom: tabBarBottomInset,
        height: tabBarHeight,
        backgroundColor: colors.background,
      },
      tabBarItemStyle: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 2,
        paddingHorizontal: 3,
      },
      tabBarLabelStyle: {
        fontSize: 9,
        marginTop: 1,
        marginBottom: 1,
        fontWeight: '500' as const,
        textAlign: 'center' as const,
        width: '100%' as const,
      },
      sceneStyle: { backgroundColor: 'transparent' },
    }),
    [renderTabBarButton, tabBarBottomInset, tabBarHeight],
  );

  const categoryTabListeners = useCallback(
    ({ navigation }: { navigation: { getState: () => { index: number; routes: Array<{ name: string; state?: { index?: number; routes?: Array<{ name: string }> } }> }; navigate: (opts: unknown) => void } }) => ({
      tabPress: () => {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        if (currentRoute?.name !== 'Category') {
          return;
        }
        const nested = currentRoute.state;
        const nestedName = nested?.routes?.[nested.index ?? 0]?.name;
        if (nestedName === 'CategoryHub' || nestedName === undefined) {
          return;
        }
        navigation.navigate({
          name: 'Category',
          params: { screen: 'CategoryHub' },
          merge: true,
        });
      },
    }),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      {webWriteGeneration > 0 ? <CartWebWriteBridge /> : null}
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Home"
          component={HomeTab}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: tabIcon('home', 'home-outline'),
          }}
        />
        <Tab.Screen
          name="Category"
          component={CategoryNavigator}
          options={{
            tabBarLabel: 'Category',
            tabBarIcon: ({ color, size, focused }) => (
              <CategoryTabIcon color={color} size={size} focused={focused} />
            ),
          }}
          listeners={categoryTabListeners}
        />
        <Tab.Screen
          name="Menu"
          component={AccountScreen}
          options={{
            tabBarLabel: 'You',
            tabBarIcon: props => <YouTabBarIconWrapper {...props} />,
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartTab}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: props => <CartTabBarIconWrapper {...props} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarButton: hiddenTabBarButton,
            tabBarItemStyle: hiddenTabBarItemStyle,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
