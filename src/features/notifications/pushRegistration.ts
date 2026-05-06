import * as Device from 'expo-device';
import type * as ExpoNotifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

import { sessionStore } from '@features/auth/sessionStore';
import { analytics } from '@shared/observability/analytics';
import { apiClient } from '@shared/network/apiClient';
import { withRetry } from '@shared/network/retry';

import { shouldUseExpoNotifications } from './expoPushAvailability';

const syncPushTokenToBackend = async (
  token: string,
  tokenType: 'fcm' | 'apns' | 'unknown',
) => {
  try {
    await withRetry(
      () =>
        apiClient.post('', {
          action: 'savePushToken',
          pushToken: token,
          // Backend uses tokenType to route through APNs vs FCM HTTP v1
          // when sending pushes via Firebase Cloud Messaging server SDKs.
          tokenType,
          platform: Platform.OS,
        }),
      {
        retries: 3,
        onRetry: (_error, attempt, delayMs) => {
          analytics.track('push_sync_retry', { attempt, delayMs });
        },
      },
    );
    analytics.track('push_sync_success', { tokenType });
  } catch (error) {
    analytics.track('push_sync_failed', {
      reason: (error as { message?: string })?.message ?? 'unknown',
      tokenType,
    });
  }
};

const askInAppPermission = (): Promise<boolean> =>
  new Promise(resolve => {
    Alert.alert(
      'Stay in the loop',
      'DressFair sends notifications for order updates, delivery status, and important account alerts. We may also share occasional offers (you can turn these off any time in Settings).',
      [
        {
          text: 'Not now',
          style: 'cancel',
          onPress: () => {
            analytics.track('push_pre_prompt_declined');
            resolve(false);
          },
        },
        {
          text: 'Allow',
          onPress: () => {
            analytics.track('push_pre_prompt_accepted');
            resolve(true);
          },
        },
      ],
      { cancelable: false },
    );
  });

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
    // Show our own context dialog before the OS prompt so the user knows why
    // they are being asked. Required on Android 13+ where POST_NOTIFICATIONS
    // is a runtime permission and recommended for Apple App Review.
    const userAgreed = await askInAppPermission();
    if (!userAgreed) {
      analytics.track('push_permission_skipped_pre_prompt');
      return;
    }
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (status !== 'granted') {
    analytics.track('push_permission_denied');
    return;
  }

  // Use the raw device push token (APNs hex on iOS, FCM token on Android)
  // rather than the Expo Push Service relay. The backend pushes through
  // Firebase Cloud Messaging server-side, so it needs the native token to
  // address the device directly. This keeps the runtime SDK identical
  // (still `expo-notifications`) but switches the addressing scheme — no
  // `@react-native-firebase` or extra config plugins required.
  //
  // Note: on Android `getDevicePushTokenAsync` requires Firebase Cloud
  // Messaging to be configured for the app (google-services.json + the
  // matching FCM project). If that setup is missing the call throws —
  // we swallow the error and report it via analytics so the user is not
  // shown a crash dialog while the backend team finishes wiring FCM.
  let devicePushToken;
  try {
    devicePushToken = await Notifications.getDevicePushTokenAsync();
  } catch (error) {
    analytics.track('push_device_token_unavailable', {
      reason: (error as { message?: string })?.message ?? 'unknown',
      platform: Platform.OS,
    });
    return;
  }
  const tokenString =
    typeof devicePushToken.data === 'string'
      ? devicePushToken.data
      : JSON.stringify(devicePushToken.data);
  if (tokenString.length === 0) {
    analytics.track('push_device_token_empty', { platform: Platform.OS });
    return;
  }
  const tokenType: 'fcm' | 'apns' | 'unknown' =
    Platform.OS === 'ios' ? 'apns' : Platform.OS === 'android' ? 'fcm' : 'unknown';

  const prevToken = await sessionStore.getPushToken();
  if (prevToken === tokenString) return;

  await sessionStore.savePushToken(tokenString);
  await syncPushTokenToBackend(tokenString, tokenType);
  analytics.track('push_token_registered', { tokenType });
};
