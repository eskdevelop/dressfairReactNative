import * as Device from 'expo-device';
import type * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

import { sessionStore } from '@features/auth/sessionStore';
import { analytics } from '@shared/observability/analytics';
import { apiClient } from '@shared/network/apiClient';
import { withRetry } from '@shared/network/retry';

import { shouldUseExpoNotifications } from './expoPushAvailability';

const syncPushTokenToBackend = async (token: string) => {
  try {
    await withRetry(
      () =>
        apiClient.post('', {
          action: 'savePushToken',
          pushToken: token,
          platform: Platform.OS,
        }),
      {
        retries: 3,
        onRetry: (_error, attempt, delayMs) => {
          analytics.track('push_sync_retry', { attempt, delayMs });
        },
      },
    );
    analytics.track('push_sync_success');
  } catch (error) {
    analytics.track('push_sync_failed', {
      reason: (error as { message?: string })?.message ?? 'unknown',
    });
  }
};

export const registerForPushNotifications = async (): Promise<void> => {
  if (!shouldUseExpoNotifications()) {
    return;
  }

  if (!Device.isDevice) return;

   
  const Notifications = require('expo-notifications') as typeof ExpoNotifications;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A00',
    });
  }

  const existingStatus = await Notifications.getPermissionsAsync();
  let status = existingStatus.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (status !== 'granted') {
    analytics.track('push_permission_denied');
    return;
  }

  const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
  const prevToken = await sessionStore.getPushToken();
  if (prevToken === expoToken) return;

  await sessionStore.savePushToken(expoToken);
  await syncPushTokenToBackend(expoToken);
  analytics.track('push_token_registered');
};
