import * as Linking from 'expo-linking';
import type * as ExpoNotifications from 'expo-notifications';
import type { Notification, NotificationResponse } from 'expo-notifications';

import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { openWebPath } from '@navigation/navigationRef';
import { shouldUseExpoNotifications } from './expoPushAvailability';
import { notificationInbox } from './notificationInbox';
import { extractNotificationDisplayText } from './notificationPayload';
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

const getContent = (notification: Notification) => notification.request.content;

const recordToInbox = (
  notification: Notification,
  options: { read: boolean },
): void => {
  const content = getContent(notification);
  const data = (content.data ?? undefined) as Record<string, unknown> | undefined;
  const payload = data as PushPayload | undefined;
  const path = mapPayloadToWebPath(payload);
  const { title, body, hasDisplayTitle, hasBody } = extractNotificationDisplayText({
    title: content.title,
    body: content.body,
    data,
  });
  const hasRoutablePath = Boolean(path && path !== HOME_PATH);
  if (!hasDisplayTitle && !hasBody && !hasRoutablePath) {
    return;
  }
  void notificationInbox
    .record({
      id: notification.request.identifier,
      title,
      body,
      path: hasRoutablePath ? path : undefined,
      read: options.read,
      data,
    })
    .catch(error => {
      crashReporter.capture(error, { source: 'notificationRuntime.record' });
    });
};

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
  void notificationInbox.hydrateFromStorage().catch(error => {
    crashReporter.capture(error, { source: 'notificationRuntime.hydrate' });
  });

  const responsePromise = notifications
    ? notifications
        .getLastNotificationResponseAsync()
        .then(response => {
          if (!response) return null;
          recordToInbox(response.notification, { read: true });
          return mapPayloadToWebPath(getPayload(response));
        })
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
  coldStartConsumed = false;
  const cleanups: Cleanup[] = [];
  let notifications: typeof ExpoNotifications | null = null;

  if (shouldUseExpoNotifications()) {
    notifications = require('expo-notifications') as typeof ExpoNotifications;

    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const receivedSubscription = notifications.addNotificationReceivedListener(
      (notification: Notification) => {
        recordToInbox(notification, { read: false });
        analytics.track('notification_received', {
          identifier: notification.request.identifier,
        });
      },
    );
    cleanups.push(() => receivedSubscription.remove());

    const responseSubscription = notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        const payload = getPayload(response);
        const path = mapPayloadToWebPath(payload);
        analytics.track('notification_opened', { type: payload?.type, path });
        recordToInbox(response.notification, { read: true });
        coldStartConsumed = true;
        openWebPath(path);
      },
    );
    cleanups.push(() => responseSubscription.remove());
  }

  const linkSub = Linking.addEventListener('url', event => {
    const path = mapIncomingUrlToWebPath(event.url);
    analytics.track('deeplink_opened', { path });
    coldStartConsumed = true;
    openWebPath(path);
  });
  cleanups.push(() => linkSub.remove());

  void handleColdStart(notifications);

  return () => {
    cleanups.forEach(fn => fn());
  };
};
