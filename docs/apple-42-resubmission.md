# Apple 4.2 — Resubmission Notes (1.0.6)

Submission ID being addressed: `3ad55757-4dc4-40c8-8d57-4e7f24b22563`
Reviewer guideline: 4.2.0 Design — Minimum Functionality
Submitted version: `1.0.6 (5)`

## What changed in 1.0.6

The app no longer presents as a single WebView. The root experience is a
native bottom-tab shell with three native tabs and one WebView tab; the
WebView is reserved for storefront commerce flows (catalogue, product
detail, cart, checkout, order placement, account management) per the
business requirement that the in-app shopping experience must remain the
storefront.

| Tab | Implementation | Native data on device |
|-----|----------------|------------------------|
| Home | WebView (commerce) | Session token (Keychain / Keystore), cookies |
| Search | **Native** `FlatList` over the storefront product API | Recent search history (`AsyncStorage`) |
| Notifications | **Native** inbox screen | Notification history with read/unread state and per-message delete (`AsyncStorage`) |
| Menu | **Native** Share / version / Terms / Privacy / Logout / Delete account | Native Terms & Privacy copy bundled in the binary |

In addition, both **Terms and Conditions** and **Privacy Policy** are now
rendered as native `ScrollView` screens with the full text; they no
longer open a web browser.

## Reply text to paste into App Store Connect

```
Hello App Review,

Thank you for the detailed feedback on submission 3ad55757-4dc4-40c8-8d57-4e7f24b22563.

We have substantially revised the app to add native functionality beyond the previous WebView-only experience. Version 1.0.6 (5) introduces a native bottom-tab shell with three new native tabs and additional native legal screens:

1. Native Search tab — a fully native search screen with a native text field, debounced live search against our product catalogue API, results rendered in a native FlatList with product images and prices, an empty state, an error state, and a native "recent searches" history persisted to device storage that survives across launches and works offline. Tapping a result deep-links the user into the storefront product page.

2. Native Notifications Center tab — a native inbox that archives every push notification we send (foreground, background and cold-start arrivals). The user can browse their entire notification history offline, mark messages as read individually or all at once, delete messages with a confirmation prompt, and tap any notification to deep-link to the related order or page. Notification state is stored on the device so the inbox is available without an internet connection.

3. Native Menu tab — a native settings screen with the system Share sheet for sharing the app (using React Native's native Share API, not a web link), the application version pulled from Expo Application APIs, native Terms and Conditions and Privacy Policy screens (full long-form text rendered in native ScrollViews — these no longer open a browser), in-app help and notification preferences, native Logout, and native Delete Account confirmation flows.

4. Cross-tab native navigation — selecting a search result or tapping an inbox notification dispatches an in-app navigation request through a Redux slice that the Home tab's WebView consumes; the user is moved to the Home tab automatically. The hardware back button continues to traverse WebView history natively.

5. Push token migration — the app now obtains the raw APNs token directly via expo-notifications.getDevicePushTokenAsync() (rather than a third-party relay) so notifications are delivered through Apple Push Notification service end-to-end.

Apart from these new native experiences, on first launch the user sees a native splash screen and a native loading state, and offline / maintenance error states are also native screens.

We have used native React Native primitives throughout (FlatList, TextInput, ScrollView, Share API, AsyncStorage, native modals, native tab bar) and designed the UI with iOS Human Interface Guidelines in mind, including system iconography (Ionicons via @expo/vector-icons), native swipe and tap interactions, and standard system alert dialogs for destructive actions.

We believe these changes meet the minimum functionality requirement of guideline 4.2 by providing meaningful native value (offline-available search history, offline-available notification archive, full native legal documents, native sharing, native account management) that complements the storefront browsing experience.

Test account credentials and a guided walkthrough of each native tab are available in the App Review Information notes for this submission. Please let us know if any further information would help with your review.

Thank you,
DressFair team
```

## Demo script for the reviewer (paste into "App Review Information")

> Launch the app. After the native splash you will land on a four-tab
> bottom navigator.
>
> 1. Tap the **Search** tab. Type any product term (for example "abaya").
>    Native results appear with images and prices. Tap any result to be
>    deep-linked into the Home tab on the matching product page.
>    Backspace the query to clear it; previously searched terms appear
>    as native chips you can tap to re-run or remove. The history
>    persists across launches and works without an internet connection.
>
> 2. Tap the **Inbox** tab. If notifications have not yet arrived, the
>    empty state explains the feature. Trigger a test push from the
>    backend (or use the demo "Send test push" button visible to test
>    accounts) and the message appears in the native list with an
>    unread indicator. Tap to mark read and deep-link, long-press to
>    delete, or use "Mark all read" / "Clear" in the header.
>
> 3. Tap the **Menu** tab. "Share app" opens the native iOS share
>    sheet. "Terms and conditions" and "Privacy policy" both open
>    native scrollable text screens — no web browser. "Delete account"
>    presents a native confirmation dialog before opening the account
>    deletion request page.
>
> 4. Return to **Home** to browse the storefront. The hardware / swipe
>    back gesture traverses WebView history natively.

## Pre-submission checklist

- [ ] Replace the placeholder copy in
      `src/features/menu/content/terms.ts` and
      `src/features/menu/content/privacy.ts` with the legally reviewed
      text shipped on dressfair.com.
- [ ] Verify the OpenCart product search endpoint URL and response shape
      in `src/features/search/searchApi.ts`. Update `buildSearchUrl` and
      `extractProducts` if the live endpoint diverges from the
      `route=product/search&output=json` convention.
- [ ] Confirm the App Store and Play Store URLs in
      `src/features/menu/MenuScreen.tsx` (`APP_STORE_LINKS`) once the
      app is approved.
- [ ] Run `npm run lint && npm run typecheck && npm test` before each
      EAS build.
- [ ] Build with `1.0.6 (5)` and re-archive for App Store Connect.
- [ ] Replace the resubmission reply placeholder with the final copy
      above and attach screenshots of:
      - the four-tab bottom bar,
      - the native Search results list,
      - the native Notifications inbox,
      - the native Menu screen,
      - the native Terms screen scrolled past the first paragraph.
