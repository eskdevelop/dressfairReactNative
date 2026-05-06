# DressFair RN Hybrid App

React Native hybrid implementation for DressFair.

## Run

```bash
npm install
npm run start
```

## Environment

- Use `.env.example` as the baseline for environment values.
- Default country/domain behavior is defined in `src/shared/config/env.ts`.
- For release preparation use:
  - `npm run smoke:checklist`
  - `npm run release:checklist`

## Architecture

The app is a native bottom-tab shell around the storefront WebView. The
WebView still drives commerce (catalogue, PDP, cart, checkout, order
placement). Tabs around it are rendered with native React Native primitives
so the experience exceeds Apple's 4.2 minimum-functionality bar.

```
RootStack
├── Splash (native)
├── MainTabs (BottomTabNavigator)
│   ├── Home          → WebViewScreen (storefront)
│   ├── Search        → native FlatList over OpenCart REST API + recent searches
│   ├── Notifications → native inbox backed by AsyncStorage (read/unread/delete)
│   └── Menu          → native Share / version / logout / delete account
├── Offline / Maintenance
├── NotificationRouter (cold-start deep-link entrypoint)
├── Terms (native ScrollView)
└── Privacy (native ScrollView)
```

- `src/app`: bootstrap, store, slices (`appSlice`, `notificationsSlice`, `webNavSlice`)
- `src/navigation`: root stack, bottom tabs, deep-link helpers
- `src/features/webview`: storefront WebView and bridge messages
- `src/features/search`: native search screen, OpenCart API client, recent-searches store
- `src/features/notifications`: push runtime + inbox (AsyncStorage CRUD + Redux mirror)
- `src/features/menu`: native menu, native legal screens, embedded Terms / Privacy text
- `src/features/shell`: splash / offline / maintenance screens
- `src/features/auth`: session token storage and logout coordination
- `src/shared`: design tokens, network, config, observability, WebView policy

### Cross-tab WebView navigation

Native tabs (Search results, Notifications inbox, deep links) drive the
Home tab's WebView through the `webNav` Redux slice. Each request bumps a
monotonic sequence number and stores the target storefront path; the Home
WebView snapshots any pre-mount path as its initial URI and swaps the
URI on subsequent requests so `canGoBack` keeps working.

### Push notifications

Push runs through `expo-notifications`. The runtime uses
`getDevicePushTokenAsync()` to obtain the raw FCM token (Android) or APNs
token (iOS) and pushes it to the backend. The backend then sends pushes
via Firebase Cloud Messaging server-side (no `@react-native-firebase`
needed in the app). Foreground arrivals, cold-start taps, and warm taps
all archive into the native inbox so the user can review history offline.

## Quality Gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Release

- Store release runbook: `docs/release-eas-store.md`
- Google Play internal testing (AAB / EAS): `docs/play-console-internal-checklist.md`
- Store metadata template: `docs/store-listing-template.md`
- Apple 4.2 resubmission notes: `docs/apple-42-resubmission.md`
