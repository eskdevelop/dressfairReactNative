# DressFair React Native Hybrid Architecture

## Decisions

- Platform: React Native + TypeScript
- Commerce rendering: WebView-first for catalog and checkout journeys
- Native shell: bootstrap, offline, maintenance, notification routing, app settings
- State and data: Redux Toolkit + RTK Query
- Navigation: React Navigation with tabs + root stack
- Network: Axios client with interceptors and typed error mapping
- Storage: MMKV for non-sensitive cache, Keychain/Keystore for session secrets

## Environment and Domain Contract

```ts
type CountryCode = 'UAE' | 'OMN' | 'KSA';

type EnvConfig = {
  apiBaseUrl: string;
  webBaseUrl: string;
  allowedDomains: string[];
};
```

- UAE
  - API: `https://backend.dressfair.com/index.php?route=extension/opencart`
  - Web: `https://www.dressfair.com`
- OMN
  - API: `https://backend.dressfair.om/index.php?route=extension/opencart`
  - Web: `https://www.dressfair.om`
- KSA
  - API: `https://backendsa.dressfair.com/index.php?route=extension/opencart`
  - Web: `https://sa.dressfair.com`

## Route Ownership

- Native routes:
  - Splash
  - Offline
  - Maintenance
  - NotificationRouter
  - Settings
  - Help
- WebView routes:
  - Home
  - Categories
  - Search
  - Product
  - Cart
  - Checkout
  - Orders
  - Account

## Notification Payload Contract

```json
{
  "type": "web_route",
  "path": "/product/model-123",
  "country": "UAE",
  "campaignId": "spring_sale_2026"
}
```

Rules:
- `type=web_route` opens `webBaseUrl + path` in main WebView.
- Unknown payload opens WebView home path.
- Router validates domain and path before navigation.

## Deep Link Contract

- Custom scheme (shipping in v1.0.0):
  - `dressfair://web?path=/p/{slug}`
  - `dressfair://web?path=/order/{orderId}`
- HTTPS Universal Links (`https://www.dressfair.com/...`) are not registered
  to the app yet. Adding them requires an `autoVerify` intent-filter plus
  `assetlinks.json` / `apple-app-site-association` hosted on the regional
  domains. Tracked as a post-launch task.

## Session Ownership

- Web authentication is source of truth for commerce pages.
- Native session store keeps a light auth shadow state only for gating and UX.
- Logout clears native secure storage and requests web logout URL in WebView.
