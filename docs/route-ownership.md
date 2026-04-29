# Route Ownership Matrix

## Native

- `Splash`
- `Offline`
- `Maintenance`
- `NotificationRouter`
- `Settings`

## WebView

- `/`
- `/category`
- `/search`
- `/p/:slug`
- `/cart`
- `/checkout`
- `/order/:id`
- `/account`

## Ownership Rule

If a flow depends on device permission, system settings, or platform lifecycle, keep it native.
If a flow is commerce page rendering and business logic is already web-owned, keep it in WebView.
