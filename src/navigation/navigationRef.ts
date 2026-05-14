import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

import { store } from '@app/store';
import { requestWebNav } from '@app/storeSlices/webNavSlice';

import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingPath: string | null = null;

// Drives the Home tab's WebView to a given storefront path. Used by:
//   • cold-start notification / universal link routing,
//   • the in-app Notifications inbox (tap a stored push),
//   • native Search (tap a product result),
//   • the Menu tab when it deep-links into legacy account pages.
//
// We always:
//   1. push the path into the cross-tab `webNav` slice so the Home tab's
//      WebViewScreen runs an `injectJavaScript` redirect (this is what makes
//      it work even when Home is already mounted in the background tab),
//   2. switch the active tab to Home so the redirect is visible.
//
// Falling back to `NotificationRouter` on cold starts (when the navigation
// container has not finished mounting yet) preserves the old behaviour for
// the very first render.
const dispatchHomeNav = (path: string): void => {
  store.dispatch(requestWebNav(path));
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: 'Home', params: { path } },
    }),
  );
};

export const flushPendingNavigation = (): void => {
  if (!navigationRef.isReady() || !pendingPath) return;
  const path = pendingPath;
  pendingPath = null;
  dispatchHomeNav(path);
};

export const openWebPath = (path: string): void => {
  if (navigationRef.isReady()) {
    dispatchHomeNav(path);
    return;
  }
  pendingPath = path;
};

// Settings used to live in a root-stack modal. It is now the Menu tab.
// Existing call sites (the WebView postMessage `open_settings` bridge) keep
// working because they go through this single helper.
export const openSettings = (): void => {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: 'Menu' },
    }),
  );
};
