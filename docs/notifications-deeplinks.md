# Notifications and Deep Links Runtime

## Supported Entry Points

- Push payload:
  - `{ "type": "web_route", "path": "/p/<slug>" }`
- Custom scheme:
  - `dressfair://web?path=/order/123`
- Universal links:
  - `https://www.dressfair.com/p/<slug>`
  - `https://www.dressfair.com/order/<id>`

## Runtime Flow

1. App boot registers listeners in `startNotificationRuntime`.
2. Push taps and URL events are normalized into safe web paths.
3. App navigates to `NotificationRouter` with mapped `path`.
4. `NotificationRouter` renders `WebViewScreen` at that path.

## Safety Rules

- Non-allowlisted hosts are rejected to `/`.
- Unknown notification shapes are rejected to `/`.
- Analytics events are emitted for push and deeplink opens.
