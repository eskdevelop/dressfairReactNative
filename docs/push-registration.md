# Push Registration Flow

## Runtime Steps

1. App boot calls `registerForPushNotifications`.
2. Android notification channel is created (`default`).
3. Permission is requested if not already granted.
4. Expo push token is fetched and cached locally.
5. Token is synced to backend for targeted notifications.

## Reliability Behavior

- If backend sync fails, token remains cached and sync retries next launches.
- If permission denied, event is tracked and app continues safely.
