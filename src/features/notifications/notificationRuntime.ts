import * as Linking from 'expo-linking';
import type * as ExpoNotifications from 'expo-notifications';
import type { Notification, NotificationResponse } from 'expo-notifications';

import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { openWebPath } from '@navigation/navigationRef';
import { shouldUseExpoNotifications } from './expoPushAvailability';
import { notificationInbox } from './notificationInbox';
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
  const hasTitle = (content.title ?? '').trim().length > 0;
  const hasBody = (content.body ?? '').trim().length > 0;
  const hasRoutablePath = Boolean(path && path !== HOME_PATH);
  // Drop empty / silent / synthetic notifications. Some Android OEMs and
  // FCM keep-alive pings hand the app process a content-less notification
  // (no title, no body, no routable payload) — those are not user-facing
  // messages and must never appear in the inbox. We only persist a
  // notification if it carries a title, a body, or a routable deep link.
  if (!hasTitle && !hasBody && !hasRoutablePath) {
    return;
  }
  // We persist whatever the OS gave us. The router has already validated
  // the path, so if `path` is falsy or HOME we omit it (no point routing
  // a "tap to view" CTA to the home page).
  void notificationInbox
    .record({
      id: notification.request.identifier,
      title: content.title ?? 'DressFair',
      body: content.body ?? '',
      path: hasRoutablePath ? path : undefined,
      read: options.read,
      data,
    })
    .catch(error => {
      crashReporter.capture(error, { source: 'notificationRuntime.record' });
    });
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
  // Hydrate the inbox once on launch so the badge count and the first
  // render of the tab show the correct state even before any new pushes
  // arrive in this session.
  void notificationInbox.hydrateFromStorage().catch(error => {
    crashReporter.capture(error, { source: 'notificationRuntime.hydrate' });
  });

  const responsePromise = notifications
    ? notifications
        .getLastNotificationResponseAsync()
        .then(response => {
          if (!response) return null;
          // The cold-start tap is also a "this is read" signal — record it
          // into the inbox before routing so the user sees it as read when
          // they navigate to the Notifications tab.
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
  // Reset on every mount so test environments and hot-reloads can re-run
  // cold-start logic deterministically.
  coldStartConsumed = false;
  const cleanups: Cleanup[] = [];
  let notifications: typeof ExpoNotifications | null = null;

  if (shouldUseExpoNotifications()) {
    // Lazy-load so Expo Go never evaluates expo-notifications.

    notifications = require('expo-notifications') as typeof ExpoNotifications;

    // Tell the OS to show a heads-up banner + sound + tray entry even when
    // the app is in the foreground. Without this, foreground notifications
    // arrive silently (only via the listeners below) and users perceive the
    // app as "broken" compared to other messaging apps. Background and
    // killed-state arrivals show banners automatically via the OS FCM/APNs
    // service, regardless of this handler.
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Foreground arrival: the OS shows a banner (per the handler above) and
    // we also archive a copy in the native inbox so the user can still find
    // it after the banner disappears. This is one of the load-bearing
    // 4.2 features — it makes the notifications tab a real native data
    // surface, not a passthrough.
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
        // A tap is implicitly "read" — record (or upsert) it as such so
        // background-arrival writes still get the read flag flipped.
        recordToInbox(response.notification, { read: true });
        // After cold-start the runtime is "warm"; subsequent taps always
        // navigate, but they still go through the same single openWebPath
        // entry so navigation queueing/flushing stays consistent.
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

  // Fire-and-forget: cold-start coordination logs its own errors; we don't
  // want bootstrap to block on slow native bridges.
  void handleColdStart(notifications);

  return () => {
    cleanups.forEach(fn => fn());
  };
};
