# BusinessArcade React Native App — Complete Clone Handoff

> **How to use this file**  
> After you create the separate BusinessArcade repository, open a **new Cursor chat** in that repo and paste or attach this document with a message like:  
> *“Read `BUSINESSARCADE_CLONE_HANDOFF.md` and continue / finish the BusinessArcade same-to-same clone. Follow the contract exactly.”*  
> The agent must treat this file as the source of truth.

---

## 1. Mission (non-negotiable contract)

Create a **same-to-same** copy of the DressFair React Native hybrid shopping app for the **BusinessArcade** storefront.

| Rule | Detail |
|------|--------|
| **Same app** | Same features, screens, navigation, WebView bridges, cart/auth/checkout, region picker logic, theme tokens, icons (until BA assets are supplied) |
| **Only change** | App identity (package/bundle ID, name, slug, scheme) + **links/hosts** in config |
| **Do not** | Rewrite features, invent a white-label system, rename every internal `dressfair` string/key (breaks bridges), edit the DressFair repo |
| **Primary storefront** | `https://businessarcade.com/ae` |

If unsure whether something should change: **leave it identical to DressFair** except identity + URLs.

---

## 2. Source vs target

### Source (existing, do not modify for this task)

| Item | Value |
|------|--------|
| Project path (example) | `/Users/dealsarcade/Documents/GitHub/dressfairReactNative` |
| App display name | `Dress Fair Shopping` |
| Expo slug | `dressfair-rn-hybrid` |
| npm package name | `dressfair-rn-hybrid` |
| Version (at handoff time) | `1.0.17` |
| Deep-link scheme | `dressfair` → `dressfair://…` |
| Android `applicationId` / package | `com.dressfair.dressfairrnhybrid` |
| iOS bundle ID | `com.dressfair.dressfairrnhybrid` |
| Stack | Expo SDK 54, React Native 0.81, React 19, TypeScript, Redux Toolkit, React Navigation, `react-native-webview` |
| Architecture | Native shell + bottom tabs around storefront WebView; commerce mostly in WebView; native Search / Notifications / Menu / Cart / Checkout pieces as in DressFair |

### Target (BusinessArcade — new separate project)

| Item | Value |
|------|--------|
| Recommended folder | `/Users/dealsarcade/Documents/GitHub/businessArcadeReactNative` (sibling folder, **not** inside DressFair) |
| Later | Own GitHub repository (user creates after testing) |
| App display name | `BusinessArcade Online Shopping` |
| Expo slug | `businessarcade-rn-hybrid` |
| npm package name | `businessarcade-rn-hybrid` |
| Deep-link scheme | `businessarcade` → `businessarcade://…` |
| **Android package + iOS bundle ID** | **`com.businessArcade`** (exact casing requested by owner) |
| Storefront home | `https://businessarcade.com/ae` |

### Related App Store Connect note (context only)

There is already a separate listing **BusinessArcade Online Shopping** with:

- Bundle ID: `com.businessarcade.new`
- Apple ID: `1633614073`
- SKU: `com.businessarcade.new`
- iOS status example: Ready for Distribution (v1.0.7)
- Category: Shopping
- Age: 4+

**`com.businessArcade` is a different identifier** → new app listing on App Store / Play. Do **not** assume it is the same as `com.businessarcade.new`. Do **not** change the old listing’s bundle ID (Apple does not allow changing bundle ID on an existing app).

Play Console often prefers lowercase package names; owner explicitly wants `com.businessArcade` — use that unless they later say otherwise.

---

## 3. Where the project must live

**Use a sibling folder / separate repo. Do not nest a full copy inside the DressFair git tree.**

Reasons:

- Avoid mixed git history
- Avoid accidental DressFair commits
- User will make BusinessArcade a fully separate repository after testing

**Copy excludes** (when cloning files):

- `.git/`
- `node_modules/`
- `.expo/`
- local generated `android/` and `ios/` (Expo prebuild outputs; regenerate with `npx expo prebuild` in the new project)
- any local secrets the user does not want copied

After copy: `npm install` in the new folder only.

---

## 4. App identity — exact file changes

### 4.1 `app.json` (Expo source of truth)

Change these fields from DressFair → BusinessArcade:

| Field | From (DressFair) | To (BusinessArcade) |
|-------|------------------|---------------------|
| `expo.name` | `Dress Fair Shopping` | `BusinessArcade Online Shopping` |
| `expo.slug` | `dressfair-rn-hybrid` | `businessarcade-rn-hybrid` |
| `expo.scheme` | `dressfair` | `businessarcade` |
| `expo.ios.bundleIdentifier` | `com.dressfair.dressfairrnhybrid` | `com.businessArcade` |
| `expo.android.package` | `com.dressfair.dressfairrnhybrid` | `com.businessArcade` |
| Permission / usage strings that say “DressFair” | DressFair… | BusinessArcade… (display text only) |

**Also reset / replace before production release:**

- `extra.eas.projectId` → create a **new** EAS project for BusinessArcade (do not reuse DressFair’s `308688c4-c334-413d-8924-22e21828a48c`)
- `extra.googleWebClientId` / `extra.googleIosClientId` → new OAuth clients for `com.businessArcade`
- `googleServicesFile` paths → new Firebase apps for the new package
- `owner` may stay or change per Expo account

Version numbers can start at `1.0.0` / build `1` for the new app, or keep parity with DressFair during early testing — owner preference; default to `1.0.0` for a clean new listing.

### 4.2 `package.json`

| Field | To |
|-------|-----|
| `name` | `businessarcade-rn-hybrid` |
| `version` | align with `app.json` |

Keep scripts and dependencies the same unless install requires updates.

### 4.3 Hardcoded store share links

File: `src/features/menu/screens/MenuSettingsScreen.tsx`

DressFair today:

```ts
const APP_SHARE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/dress-fair-shopping/id6764840409'
    : 'https://play.google.com/store/apps/details?id=com.dressfair.dressfairrnhybrid';
```

BusinessArcade:

- Android: `https://play.google.com/store/apps/details?id=com.businessArcade` (until listing exists, placeholder is OK)
- iOS: update when App Store ID for **`com.businessArcade`** exists (not `1633614073` unless owner confirms that listing is the same app — it currently is `com.businessarcade.new`, so treat as different)
- Share message: replace “DressFair” with “BusinessArcade”

---

## 5. Links / hosts — primary config

### 5.1 Main file

**`src/shared/config/env.ts`**

This is the central contract for:

- OpenCart API host
- Marketing / WebView `webBaseUrl`
- `allowedDomains` (WebView URL policy)
- Locale path prefixes (`/ae`, `/om`, `/sa`)
- ecomplug / storefront REST origins
- support email
- cart URL, product path, categories path, etc.

Helpers in same file / nearby:

- `countryFromStorefrontBrowsingUrl`
- `STOREFRONT_LOCALE_SYNC_HOSTS`
- `storefrontHomePath`, `privacyPolicyUrl`, `accountSecurityUrl`, `productHrefForSku`, `categoryCollectionPath`
- `src/shared/config/storefrontUrls.ts` (builds checkout/categories REST URLs from env)

### 5.2 DressFair reference values (source of truth for “what fields exist”)

#### Locale map (keep structure)

```ts
ae → UAE
om → OMN
sa → KSA
```

#### DressFair `STOREFRONT_LOCALE_SYNC_HOSTS`

- `dressfair.com`
- `dressfair.om`
- `sa.dressfair.com`

#### DressFair UAE

| Key | Value |
|-----|--------|
| `apiHost` | `https://backend.dressfair.com` |
| `apiBaseUrl` | `https://backend.dressfair.com/index.php?route=extension/opencart` |
| `apiRoutePrefix` | `/index.php?route=extension/opencart` |
| `webBaseUrl` | `https://www.dressfair.com` |
| `allowedDomains` | `dressfair.com`, `www.dressfair.com`, `backend.dressfair.com` |
| `supportEmail` | `support@dressfair.com` |
| `productPathPrefix` | `/ae/p` |
| `storefrontCheckoutApiBaseUrl` | `https://9711694.ecomplug.com` |
| `mobileCategoriesApiBaseUrl` | `https://9711694.ecomplug.com` |
| `webNewInPath` | `/ae/new-in` |
| `webCategoriesPath` | `/ae` |
| `webCartUrl` | `https://www.dressfair.com/ae/cart` |
| `storefrontCitiesCountryId` | `223` |
| `customerAvatarCdnBaseUrl` | `https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com` |
| Paths | login `/login`, logout `/logout`, privacy `/privacy`, terms `/terms`, help `/contact`, delete `/account/delete` |

#### DressFair OMN

| Key | Value |
|-----|--------|
| `apiHost` | `https://backend.dressfair.om` |
| `webBaseUrl` | `https://www.dressfair.com` (path locale `/om`; standalone `dressfair.om` is a different Angular SPA — avoid for WebView injections) |
| ecomplug | `https://9681695.ecomplug.com` |
| `productPathPrefix` | `/om/p` |
| `webCategoriesPath` | `/om` |
| `webCartUrl` | `https://www.dressfair.com/om/cart` |
| `storefrontCitiesCountryId` | `162` |
| `supportEmail` | `support@dressfair.om` |

#### DressFair KSA

| Key | Value |
|-----|--------|
| `apiHost` | `https://backendsa.dressfair.com` |
| `webBaseUrl` | `https://www.dressfair.com` (path locale `/sa`) |
| ecomplug | `https://9661696.ecomplug.com` |
| `productPathPrefix` | `/sa/p` |
| `webCategoriesPath` | `/sa` |
| `webCartUrl` | `https://www.dressfair.com/sa/cart` |
| `storefrontCitiesCountryId` | `184` |

### 5.3 BusinessArcade target values (locked for storefront; API TBD)

#### Locked storefront (UAE / AE first)

| Key | BusinessArcade value |
|-----|----------------------|
| Marketing site | `https://businessarcade.com` |
| AE home | `https://businessarcade.com/ae` |
| `webBaseUrl` | `https://businessarcade.com` (use `https://www.businessarcade.com` if that is the canonical host — **both** apex and www must be in `allowedDomains` if redirects exist) |
| `webCategoriesPath` | `/ae` |
| `webCartUrl` | `https://businessarcade.com/ae/cart` |
| `productPathPrefix` | `/ae/p` |
| `webNewInPath` | `/ae/new-in` |
| `STOREFRONT_LOCALE_SYNC_HOSTS` | include `businessarcade.com` (and www if used) |
| `allowedDomains` | at least `businessarcade.com`, `www.businessarcade.com`, plus whatever API/backend hosts are configured |

Keep path conventions identical to DressFair (`/ae/p/{sku}`, `/ae/c/{slug}`, `/ae/cart`, privacy at `{locale}/privacy-policy`, account security at `{locale}/user/account-security`) **unless** live BusinessArcade routes differ — then adjust paths to match the live site, not invent new app architecture.

#### API / OpenCart / ecomplug — MUST BE FILLED BY OWNER

These are **not** discoverable from the public AE page alone. Agent must **not invent** them.

Paste real values here when known:

```text
BusinessArcade UAE apiHost:                    _______________________________
BusinessArcade UAE apiBaseUrl / route prefix: _______________________________
BusinessArcade UAE storefrontCheckoutApiBaseUrl (ecomplug or OC JSON): ______
BusinessArcade UAE mobileCategoriesApiBaseUrl: _______________________________
BusinessArcade supportEmail:                   _______________________________
BusinessArcade customerAvatarCdnBaseUrl:       _______________________________ (or keep ecomdoor if same infra)
BusinessArcade storefrontCitiesCountryId UAE:  _______________________________ (DressFair used 223)
OMN / KSA BusinessArcade hosts (if any):       _______________________________
```

**Until API values are provided:**

- Prefer blocking native login/cart API work on wrong DressFair backends.
- Do **not** silently keep DressFair API hosts for production.
- WebView-only smoke test against `https://businessarcade.com/ae` is OK for first visual check if owner agrees.

#### OMN / KSA on BusinessArcade

- Keep code paths (`CountryCode`, locale segments).
- Only point OMN/KSA env rows at real BusinessArcade locales/backends if they exist.
- Do not invent `backend.businessarcade.om` etc. without confirmation.
- Default ship target: **AE / UAE first**.

---

## 6. Architecture the agent must preserve

### 6.1 High-level

Native bottom-tab shell around storefront WebView. WebView drives much of commerce; native layers exist for App Store 4.2-style functionality and UX.

```
RootStack
├── Splash (native)
├── MainTabs
│   ├── Home          → WebViewScreen (storefront)
│   ├── Search        → native + OpenCart REST
│   ├── Notifications → native inbox (AsyncStorage)
│   └── Menu          → settings / legal / share / logout
├── Offline / Maintenance
├── NotificationRouter
├── Cart / Checkout / Account / Categories (native + web as in DressFair)
└── Terms / Privacy (native content screens)
```

### 6.2 Important folders

| Path | Role |
|------|------|
| `src/app` | bootstrap, Redux store, slices |
| `src/navigation` | root stack, tabs, deep links |
| `src/features/webview` | WebView + JS injections / bridges |
| `src/features/search` | native search |
| `src/features/notifications` | push + inbox |
| `src/features/menu` | menu, legal, contact content |
| `src/features/cart` | native cart sync with web `localStorage` |
| `src/features/checkout` | native checkout flows |
| `src/features/auth` | session, Google/Apple/OTP |
| `src/features/categories` | native category hub / PLP |
| `src/features/account` | profile, addresses |
| `src/features/region` | country persistence / switch |
| `src/shared/config` | **env.ts**, storefront URL helpers |
| `src/shared/webview` | URL / payment gateway policy |
| `assets/` | icon, splash, adaptive icon |
| `plugins/` | Expo config plugins (keep) |
| `docs/` | release / store docs (update brand names when releasing BA) |
| `eas.json` | build profiles (keep structure; new EAS project) |

### 6.3 Cross-tab WebView navigation

Native tabs drive Home WebView via Redux `webNav` slice (monotonic sequence + path). Do not break this when changing hosts.

### 6.4 Deep links (DressFair pattern → BA scheme)

DressFair:

- `dressfair://web?path=/p/{slug}`
- `dressfair://web?path=/order/{orderId}`

BusinessArcade:

- `businessarcade://web?path=…` (same path query shape)
- Universal Links for `https://businessarcade.com/...` are **not** required for first clone (DressFair also deferred AASA / assetlinks)

### 6.5 Push notifications

- `expo-notifications`
- Device token via `getDevicePushTokenAsync()` (FCM Android / APNs iOS)
- Backend sends via FCM server-side
- Requires Firebase config for **`com.businessArcade`**

### 6.6 Session / storage keys (do not rename in first pass)

Internal keys still say `dressfair` in many places. **Leave them** for same-to-same stability (renaming clears user data and can break bridges). Examples:

- `dressfair_token`, `dressfair_push_token`
- `dressfair_native_cart_v1`, `dressfair_native_cart_deleted_v1`
- `@dressfair/mobile_categories_…`
- WebView globals: `window.__dressfair*`, `data-dressfair-*`, events `dressfair:native-auth`

Changing these is **out of scope** unless doing a deliberate migration later.

### 6.7 Brand theme

- Brand orange token: `#F97316` in `src/app/theme/tokens.ts` (keep unless BA brand color provided)
- Notification plugin color in `app.json` uses same orange

### 6.8 Assets (first pass)

Keep DressFair `assets/icon.png`, `splash.png`, `adaptive-icon.png` until BusinessArcade artwork is supplied. Then replace and rebuild.

---

## 7. Credentials that must be replaced (not same-to-same forever)

Copied DressFair credentials will **not** work correctly for a new package ID.

| Asset | DressFair (reference) | BusinessArcade action |
|-------|----------------------|------------------------|
| `google-services.json` | DressFair Firebase Android | New Firebase Android app for `com.businessArcade` |
| `GoogleService-Info.plist` | DressFair Firebase iOS | New Firebase iOS app for `com.businessArcade` |
| Google OAuth client IDs in `app.json` `extra` | DressFair clients | New clients; SHA-1 for Android signing (see `docs/google-signin-sha.md`) |
| Apple Sign In | `usesAppleSignIn: true` | Enable for new App ID `com.businessArcade` |
| EAS `projectId` | `308688c4-c334-413d-8924-22e21828a48c` | **New** EAS project |
| Push / APNs keys | DressFair | New for BA bundle ID |

First clone pass may copy files so the project builds, but mark them **BLOCKERS for store release**.

---

## 8. What NOT to change (same-to-same)

- Feature set and screen flows
- WebView injection logic (header hide, cart bridge, session hydration, etc.) — only hosts/allowlists
- Redux shape, navigation structure
- Renaming all `dressfair` identifiers in JS bridges / AsyncStorage
- Adding product flavors / multi-brand white-label framework
- Modifying the DressFair repository as part of this work
- Assuming `com.businessarcade.new` App Store app is this new package

---

## 9. Execution checklist (for the agent)

1. Confirm working directory is the **BusinessArcade** repo/folder (not DressFair), or create sibling copy from DressFair with excludes.
2. Update `app.json` + `package.json` identity (section 4).
3. Update `src/shared/config/env.ts` storefront hosts/paths/allowlists for `businessarcade.com` / `/ae` (section 5.3).
4. Apply owner-provided API/ecomplug hosts when available; otherwise ask — do not invent.
5. Update `MenuSettingsScreen` share / Play package links.
6. Update permission usage strings that show the brand name to users.
7. `npm install` → typecheck/lint as needed → smoke test WebView loads `https://businessarcade.com/ae`.
8. Document remaining blockers: Firebase, Google/Apple OAuth, EAS project, API hosts, icons.
9. Do **not** create git commits unless the user asks.

Optional: keep this file at repo root or `docs/BUSINESSARCADE_CLONE_HANDOFF.md` in the new repo.

---

## 10. Smoke test checklist

- [ ] App launches with name **BusinessArcade Online Shopping**
- [ ] Bundle/package is `com.businessArcade` after prebuild
- [ ] Home WebView opens AE storefront (`/ae`), not DressFair
- [ ] Domain allowlist does not bounce BA URLs to external browser incorrectly
- [ ] Region/locale sync still understands `/ae` (and `/om` `/sa` if configured)
- [ ] Search / categories / cart: verify only after API hosts are set (expect failures if still on DressFair APIs)
- [ ] Deep link scheme `businessarcade://` registered
- [ ] Google / Apple / push: expected fail until new credentials

Commands (same as DressFair):

```bash
npm install
npm run start
# or
npm run ios
npm run android
npm run lint
npm run typecheck
npm run test
npm run smoke:checklist
```

---

## 11. Prompt template for a new Cursor chat

Copy-paste:

```text
Read docs/BUSINESSARCADE_CLONE_HANDOFF.md (or the attached handoff file) carefully.

This is a same-to-same clone of the DressFair Expo/React Native hybrid app for BusinessArcade.
Contract: keep everything identical; change ONLY app identity + links/hosts.

Target:
- Package/bundle ID: com.businessArcade
- Display name: BusinessArcade Online Shopping
- Storefront: https://businessarcade.com/ae
- Scheme: businessarcade
- Sibling/separate repo — do not nest inside DressFair

Primary config file: src/shared/config/env.ts
Do not rename internal dressfair storage/bridge keys.
Do not invent API/ecomplug hosts — ask me if missing.

[Optional — paste API hosts here]

Continue from the current repo state and finish any remaining checklist items.
```

---

## 12. Owner fill-in (before production)

```text
New GitHub repo URL: ________________________________
Local path: ________________________________________
Canonical web host (apex vs www): __________________
UAE OpenCart / API host: ___________________________
UAE ecomplug / checkout JSON host: _________________
Support email: _____________________________________
Firebase project: __________________________________
Google OAuth web + iOS client IDs: __________________
Apple App ID / Team: _______________________________
EAS project ID: ____________________________________
Play Store listing URL: ____________________________
App Store ID for com.businessArcade: _______________
Brand icons provided? (Y/N): _______________________
OMN/KSA locales on BusinessArcade? _________________
```

---

## 13. Document history

| Date | Note |
|------|------|
| 2026-07-16 | Initial complete handoff written from DressFair RN hybrid (`dressfair-rn-hybrid` v1.0.17) + owner requirements for BusinessArcade AE / `com.businessArcade` |

**End of handoff. Follow this file over chat memory.**
