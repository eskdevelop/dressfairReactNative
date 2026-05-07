import React, { useEffect, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors } from '@app/theme/tokens';
import { MenuScreen } from '@features/menu/MenuScreen';
import { NotificationsInboxScreen } from '@features/notifications/NotificationsInboxScreen';
import { notificationInbox } from '@features/notifications/notificationInbox';
import { SearchScreen } from '@features/search/SearchScreen';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import { WishlistScreen } from '@features/wishlist/WishlistScreen';
import { wishlist } from '@features/wishlist/wishlist';
import { crashReporter } from '@shared/observability/crash';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// The Home tab hosts the WebView. Cold-start deep links land here via the
// `path` route param (set by `openWebPath`); the WebView itself watches the
// `webNav` slice for in-session cross-tab navigation requests.
function HomeTab({ route }: { route: RouteProp<MainTabParamList, 'Home'> }) {
  const initialPath = route.params?.path ?? '/';
  return <WebViewScreen path={initialPath} />;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcon =
  (focusedName: IoniconName, name: IoniconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} color={color} size={size} />
  );

export function MainTabs() {
  // Hydrate the inbox and wishlist once at the tab shell mount so the badge
  // counts and initial render are both correct. Subsequent updates flow
  // through the notificationRuntime listeners and the wishlist facade.
  useEffect(() => {
    void notificationInbox.hydrateFromStorage().catch(error => {
      crashReporter.capture(error, { source: 'MainTabs.hydrate' });
    });
    void wishlist.hydrateFromStorage().catch(error => {
      crashReporter.capture(error, { source: 'MainTabs.hydrateWishlist' });
    });
  }, []);

  const unreadCount = useAppSelector(state =>
    state.notifications.items.reduce(
      (acc, item) => (item.read ? acc : acc + 1),
      0,
    ),
  );
  const wishlistCount = useAppSelector(state => state.wishlist.items.length);

  // Memoise the badge so that switching the same value (e.g. count stays
  // at 3) doesn't re-render the navigator unnecessarily.
  const notificationBadge = useMemo(
    () => (unreadCount > 0 ? unreadCount : undefined),
    [unreadCount],
  );
  const wishlistBadge = useMemo(
    () => (wishlistCount > 0 ? wishlistCount : undefined),
    [wishlistCount],
  );

  // Bake the bottom safe-area inset into the tab bar height ourselves so the
  // bar still clears the system gesture / 3-button nav, while we keep the
  // internal padding tight (default react-navigation adds ~30-40px of empty
  // space above the icons which the user perceives as the WebView being cut).
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 4,
          paddingBottom: insets.bottom,
          height: tabBarHeight,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
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
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: tabIcon('search', 'search-outline'),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarBadge: wishlistBadge,
          tabBarIcon: tabIcon('heart', 'heart-outline'),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsInboxScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarBadge: notificationBadge,
          tabBarIcon: tabIcon('notifications', 'notifications-outline'),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: tabIcon('menu', 'menu-outline'),
        }}
      />
    </Tab.Navigator>
  );
}
