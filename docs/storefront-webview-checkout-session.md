# Storefront WebView session and checkout address

## Native change

[`WebViewScreen`](../src/features/webview/WebViewScreen.tsx) enables the same cookie defaults as [`MenuNewInWebView`](../src/features/menu/components/MenuNewInWebView.tsx):

- **`sharedCookiesEnabled`** (iOS): `WKWebView` uses the shared cookie store so the login modal WebView and tab WebViews (Home, Cart, etc.) see the same `Set-Cookie` session.
- **`thirdPartyCookiesEnabled`**: allows cross-site cookies where the Android WebView / storefront needs them for checkout or API hosts.

If the Cart tab still shows the **guest** checkout address form after login, the Next.js page is not receiving a customer session inside that WebView (cookies or credentialed fetches), not a missing React Native “show” flag.

## Fetch / XHR auth merge (additional fix)

[`WebViewScreen`](../src/features/webview/WebViewScreen.tsx) also injects [`storefrontFetchAuthInjection`](../src/features/webview/storefrontFetchAuthInjection.ts) **before** page scripts run. It wraps `fetch` and `XMLHttpRequest` so requests to storefront / checkout API hosts merge the same headers as native [`buildStorefrontAuthHeaders`](../src/shared/network/storefrontAuthHeaders.ts) (Bearer JWT, `x-customer-token`, `x-oc-session`, merchant + `X-Country-*`).

Native updates `window.__dressfairBridgeHeaders` on each load and whenever auth / OC session changes in Redux, so checkout client code that uses `fetch`/`XHR` gets a logged-in customer without relying on the WebView cookie jar alone.

## Manual verification (QA)

1. Open **Sign In / Register** (storefront login modal), complete login.
2. Open **Cart** tab (triggers reload on focus when configured).
3. Proceed to **checkout** (`/ae/checkout` or your locale).
4. Confirm the **saved address** summary (name, phone, address, edit) appears as on mobile Chrome.

If it fails, use **Chrome remote debugging** (Android) or Safari Web Inspector (iOS) on the Cart WebView and compare the first customer/session request with desktop: look for **401/403** or missing `Cookie` on checkout API calls.

## If cookie alignment is not enough (web coordination)

Checkout UIs often branch on **guest vs logged-in** from:

- HttpOnly/session cookies only, or
- A client token in `localStorage` set only by a specific login path.

The app already stores a JWT in **native** SecureStore via the auth bridge; that token is **not** automatically attached to `fetch()` inside the WebView. If the storefront cannot rely on shared cookies alone, the web team must either:

- Ensure login sets **first-party** cookies visible to the Cart WebView after the native changes above, or
- Agree on a **documented** way to hydrate web session from the native token (higher risk; security and same-origin review required).
