import * as Linking from 'expo-linking';
import type * as ExpoNotifications from 'expo-notifications';
import type { NotificationResponse } from 'expo-notifications';

import { analytics } from '@shared/observability/analytics';
import { openWebPath } from '@navigation/navigationRef';
import { shouldUseExpoNotifications } from './expoPushAvailability';
import type { PushPayload } from './notificationRouter';
import { mapIncomingUrlToWebPath, mapPayloadToWebPath } from './notificationRouter';

type Cleanup = () => void;

const getPayload = (
  response: { notification: { request: { content: { data?: Record<string, unknown> } } } },
): PushPayload | undefined => {
  const data = response.notification.request.content.data;
  return (data ?? undefined) as PushPayload | undefined;
};

export const startNotificationRuntime = (): Cleanup => {
  const cleanups: Cleanup[] = [];

  if (shouldUseExpoNotifications()) {
    // Lazy-load so Expo Go never evaluates expo-notifications.
     
    const Notifications = require('expo-notifications') as typeof ExpoNotifications;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        const payload = getPayload(response);
        const path = mapPayloadToWebPath(payload);
        analytics.track('notification_opened', { type: payload?.type, path });
        openWebPath(path);
      },
    );
    cleanups.push(() => subscription.remove());

    Notifications.getLastNotificationResponseAsync().then(
      (response: NotificationResponse | null) => {
        if (!response) return;
        const payload = getPayload(response);
        const path = mapPayloadToWebPath(payload);
        openWebPath(path);
      },
    );
  }

  const linkSub = Linking.addEventListener('url', event => {
    const path = mapIncomingUrlToWebPath(event.url);
    analytics.track('deeplink_opened', { path });
    openWebPath(path);
  });
  cleanups.push(() => linkSub.remove());

  Linking.getInitialURL().then(url => {
    if (!url) return;
    const path = mapIncomingUrlToWebPath(url);
    openWebPath(path);
  });

  return () => {
    cleanups.forEach(fn => fn());
  };
};
