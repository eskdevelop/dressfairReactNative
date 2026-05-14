import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors } from '@app/theme/tokens';
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

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// The Home tab hosts the WebView. Cold-start deep links land here via the
// `path` route param (set by `openWebPath`); the WebView itself watches the
// `webNav` slice for in-session cross-tab navigation requests.
function HomeTab({ route }: { route: RouteProp<MainTabParamList, 'Home'> }) {
  const initialPath = route.params?.path ?? '/';
  return (
    <WebViewScreen
      path={initialPath}
      applyWebNavFromStore
      tabReselectMode="home"
    />
  );
}

function CartTab() {
  const country = useAppSelector(state => state.app.country);
  const uri = getEnvConfig(country).webCartUrl;
  return <WebViewScreen path={uri} tabReselectMode="cart" />;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcon =
  (focusedName: IoniconName, name: IoniconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} color={color} size={size} />
  );

const hiddenTabBarButton = () => null;

/** Hidden tabs still mount `BottomTabItem` wrappers; overriding flex/layout keeps
 *  ghost routes from reserving columns (otherwise only ~4/7 of the bar is
 *  usable and labels truncate). RN `display` collapses layout on modern Yoga. */
const hiddenTabBarItemStyle: StyleProp<ViewStyle> = {
  display: 'none',
};

export function MainTabs() {
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

  // Bake the bottom safe-area inset into the tab bar height ourselves so the
  // bar still clears the system gesture / 3-button nav, while we keep the
  // internal padding tight (default react-navigation adds ~30-40px of empty
  // space above the icons which the user perceives as the WebView being cut).
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={{
        lazy: true,
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
          flex: 1,
          minWidth: 0,
          paddingVertical: 4,
          paddingHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
          textAlign: 'center',
          width: '100%',
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
        name="Category"
        component={CategoryNavigator}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name="category" color={color} size={focused ? Math.min(size + 2, 30) : size} />
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
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartTab}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: tabIcon('cart', 'cart-outline'),
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
