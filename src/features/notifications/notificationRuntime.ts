import * as Linking from 'expo-linking';
import type * as ExpoNotifications from 'expo-notifications';
import type { NotificationResponse } from 'expo-notifications';

import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { openWebPath } from '@navigation/navigationRef';
import { shouldUseExpoNotifications } from './expoPushAvailability';
import type { PushPayload } from './notificationRouter';
import { mapIncomingUrlToWebPath, mapPayloadToWebPath } from './notificationRouter';

type Cleanup = () => void;

const HOME_PATH = '/';

const getPayload = (
  response: { notification: { request: { content: { data?: Record<string, unknown> } } } },
): PushPayload | undefined => {
  const data = response.notification.request.content.data;
  return (data ?? undefined) as PushPayload | undefined;
};

// A single cold-start path is consumed across both notification taps and
// universal links. Without coordination, both `getLastNotificationResponseAsync`
// and `getInitialURL` can fire `openWebPath` on launch and produce racing,
// duplicate, or competing navigations. Notification taps express explicit
// user intent so they win the tie-breaker.
let coldStartConsumed = false;

const consumeColdStart = (
  source: 'notification' | 'link',
  path: string,
): void => {
  if (coldStartConsumed) return;
  if (path === HOME_PATH) return;
  coldStartConsumed = true;
  analytics.track('cold_start_routed', { source, path });
  openWebPath(path);
};

const handleColdStart = async (
  notifications: typeof ExpoNotifications | null,
): Promise<void> => {
  const responsePromise = notifications
    ? notifications
        .getLastNotificationResponseAsync()
        .then(response => (response ? mapPayloadToWebPath(getPayload(response)) : null))
        .catch((error: unknown) => {
          crashReporter.capture(error, { source: 'coldStart.notification' });
          return null;
        })
    : Promise.resolve(null);

  const linkPromise = Linking.getInitialURL()
    .then(url => (url ? mapIncomingUrlToWebPath(url) : null))
    .catch((error: unknown) => {
      crashReporter.capture(error, { source: 'coldStart.initialUrl' });
      return null;
    });

  const [responsePath, linkPath] = await Promise.all([responsePromise, linkPromise]);
  if (responsePath && responsePath !== HOME_PATH) {
    consumeColdStart('notification', responsePath);
    return;
  }
  if (linkPath && linkPath !== HOME_PATH) {
    consumeColdStart('link', linkPath);
  }
};

export const startNotificationRuntime = (): Cleanup => {
  // Reset on every mount so test environments and hot-reloads can re-run
  // cold-start logic deterministically.
  coldStartConsumed = false;
  const cleanups: Cleanup[] = [];
  let notifications: typeof ExpoNotifications | null = null;

  if (shouldUseExpoNotifications()) {
    // Lazy-load so Expo Go never evaluates expo-notifications.

    notifications = require('expo-notifications') as typeof ExpoNotifications;

    const subscription = notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        const payload = getPayload(response);
        const path = mapPayloadToWebPath(payload);
        analytics.track('notification_opened', { type: payload?.type, path });
        // After cold-start the runtime is "warm"; subsequent taps always
        // navigate, but they still go through the same single openWebPath
        // entry so navigation queueing/flushing stays consistent.
        coldStartConsumed = true;
        openWebPath(path);
      },
    );
    cleanups.push(() => subscription.remove());
  }

  const linkSub = Linking.addEventListener('url', event => {
    const path = mapIncomingUrlToWebPath(event.url);
    analytics.track('deeplink_opened', { path });
    coldStartConsumed = true;
    openWebPath(path);
  });
  cleanups.push(() => linkSub.remove());

  // Fire-and-forget: cold-start coordination logs its own errors; we don't
  // want bootstrap to block on slow native bridges.
  void handleColdStart(notifications);

  return () => {
    cleanups.forEach(fn => fn());
  };
};
