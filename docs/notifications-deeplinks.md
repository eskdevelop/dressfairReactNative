# Notifications and Deep Links Runtime

## Supported Entry Points

- Push payload:
  - `{ "type": "web_route", "path": "/p/<slug>" }`
- Custom scheme:
  - `dressfair://web?path=/order/123`

## Universal Links (HTTPS deep links)

Not enabled in v1.0.0. Supporting `https://www.dressfair.com/...` deep links
requires (a) an `<intent-filter android:autoVerify="true">` for `https` in
`android/app/src/main/AndroidManifest.xml`, (b) hosting
`assetlinks.json` at `https://www.dressfair.com/.well-known/assetlinks.json`
(and the regional equivalents), and (c) the iOS `Associated Domains`
entitlement plus `apple-app-site-association` files. Track this as a
post-launch enhancement.

## Runtime Flow

1. App boot registers listeners in `startNotificationRuntime`.
2. Push taps and URL events are normalized into safe web paths.
3. App navigates to `NotificationRouter` with mapped `path`.
4. `NotificationRouter` renders `WebViewScreen` at that path.

## Safety Rules

- Non-allowlisted hosts are rejected to `/`.
- Unknown notification shapes are rejected to `/`.
- Analytics events are emitted for push and deeplink opens.
