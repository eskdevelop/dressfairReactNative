// PUSH DISABLED — entire notification runtime commented out for this release.
// To re-enable, uncomment everything below and the matching call in AppRoot.tsx.

import * as Linking from 'expo-linking';
// import type * as ExpoNotifications from 'expo-notifications';
// import type { Notification, NotificationResponse } from 'expo-notifications';

import { analytics } from '@shared/observability/analytics';
// import { crashReporter } from '@shared/observability/crash';
import { openWebPath } from '@navigation/navigationRef';
// import { shouldUseExpoNotifications } from './expoPushAvailability';
// import { notificationInbox } from './notificationInbox';
// import type { PushPayload } from './notificationRouter';
import { mapIncomingUrlToWebPath } from './notificationRouter';

type Cleanup = () => void;

let coldStartConsumed = false;

export const startNotificationRuntime = (): Cleanup => {
  coldStartConsumed = false;
  const cleanups: Cleanup[] = [];

  // Deep-link listener stays active (not push-related).
  const linkSub = Linking.addEventListener('url', event => {
    const path = mapIncomingUrlToWebPath(event.url);
    analytics.track('deeplink_opened', { path });
    coldStartConsumed = true;
    openWebPath(path);
  });
  cleanups.push(() => linkSub.remove());

  // Cold-start deep-link (non-push).
  void Linking.getInitialURL().then(url => {
    if (!url || coldStartConsumed) return;
    const path = mapIncomingUrlToWebPath(url);
    if (path && path !== '/') {
      coldStartConsumed = true;
      analytics.track('cold_start_routed', { source: 'link', path });
      openWebPath(path);
    }
  });

  return () => {
    cleanups.forEach(fn => fn());
  };
};
