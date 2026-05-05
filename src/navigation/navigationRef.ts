import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingPath: string | null = null;

export const flushPendingNavigation = (): void => {
  if (!navigationRef.isReady() || !pendingPath) return;
  const path = pendingPath;
  pendingPath = null;
  navigationRef.dispatch(
    CommonActions.navigate({ name: 'NotificationRouter', params: { path } }),
  );
};

export const openWebPath = (path: string): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'NotificationRouter', params: { path } }),
    );
    return;
  }
  pendingPath = path;
};

export const openSettings = (): void => {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.navigate({ name: 'Settings' }));
};
