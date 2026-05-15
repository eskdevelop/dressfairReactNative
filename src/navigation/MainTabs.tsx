import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors } from '@app/theme/tokens';
import { CategorySearchBar } from '@features/categories/components/CategorySearchBar';
import { CategoryNavigator } from '@features/categories/CategoryNavigator';
import { MenuScreen } from '@features/menu/MenuScreen';
import { NotificationsInboxScreen } from '@features/notifications/NotificationsInboxScreen';
import { notificationInbox } from '@features/notifications/notificationInbox';
import { SearchScreen } from '@features/search/SearchScreen';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import { WishlistScreen } from '@features/wishlist/WishlistScreen';
import { wishlist } from '@features/wishlist/wishlist';
import { crashReporter } from '@shared/observability/crash';
import { getEnvConfig } from '@shared/config/env';

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
  const initialPath = route.params?.path ?? '/';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top']}>
      <View style={{ paddingTop: 6 }}>
        <CategorySearchBar />
      </View>
      <View style={{ height: 8 }} />
      <View style={{ flex: 1 }}>
        <WebViewScreen
          path={initialPath}
          applyWebNavFromStore
          tabReselectMode="home"
          reportCartCountToNative
          hideStorefrontMobileHeader
          applyTopSafeArea={false}
        />
      </View>
    </SafeAreaView>
  );
}

function CartTab() {
  const country = useAppSelector(state => state.app.country);
  const uri = getEnvConfig(country).webCartUrl;
  return (
    <WebViewScreen
      path={uri}
      tabReselectMode="cart"
      reportCartCountToNative
      hideStorefrontMobileHeader
      reloadWebWhenTabFocused
    />
  );
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

/** Static Temu-style profile promotions cue (tab bar); inbox unread stays on Menu screen list only. */
const YOU_TAB_BAR_BADGE = '99+';

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
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        right,
        backgroundColor: colors.brand,
        borderRadius: 8,
        paddingHorizontal: 3,
        paddingVertical: 1,
        minWidth: 14,
        minHeight: 14,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700', lineHeight: 10 }}>{label}</Text>
    </View>
  );
}

function YouTabBarIcon({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) {
  const name = focused ? 'person' : 'person-outline';
  return (
    <View style={[TAB_BAR_ICON_FRAME, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name={name} color={color} size={size} />
      <TabBarBadgeChip label={YOU_TAB_BAR_BADGE} />
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

export function MainTabs() {
  const cartQuantity = useAppSelector(state => state.cartBadge.quantity);

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

  const tabBarBottomInset = useTabBarBottomInset();
  const tabBarHeight = MAIN_TAB_BAR_CONTENT_HEIGHT + tabBarBottomInset;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          lazy: true,
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: TAB_BAR_INACTIVE_TINT,
          tabBarButton: props => <CenteredTabBarButton {...props} />,
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
            fontWeight: '500',
            textAlign: 'center',
            width: '100%',
          },
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
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
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate({
                name: 'Category',
                params: { screen: 'CategoryHub' },
                merge: true,
              });
            },
          })}
        />
        <Tab.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            tabBarLabel: 'You',
            tabBarIcon: props => <YouTabBarIcon {...props} />,
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartTab}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: props => <CartTabBarIcon {...props} quantity={cartQuantity} />,
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
        <Tab.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            tabBarButton: hiddenTabBarButton,
            tabBarItemStyle: hiddenTabBarItemStyle,
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsInboxScreen}
          options={{
            tabBarButton: hiddenTabBarButton,
            tabBarItemStyle: hiddenTabBarItemStyle,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
