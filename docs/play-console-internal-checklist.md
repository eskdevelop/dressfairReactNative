# Google Play — Internal testing checklist

Run this before the **first** Internal testing release. Package must stay
**`com.dressfair.dressfairrnhybrid`** (native `applicationId`).

## App Content (everything in this section is required to start a rollout)

In Play Console → app → **Policy** → **App content**:

1. **App access**
   - Choose "All or some functionality is restricted".
   - Reviewer instructions: "Open app → tap Login → use the test credentials below to log into the storefront. The rest of the app browses dressfair.com without login."
   - Test account: provide reviewer email + password (and any 2FA bypass).
2. **Ads** — **No** (DressFair shows no third-party advertising network).
3. **Content rating**
   - Category: **Reference, News, or Educational** is wrong; pick **Social Networking & Communication / Shopping** depending on the questionnaire wording.
   - Answer "No" to violence, sexuality, gambling, profanity, drugs, location sharing, UGC chat.
   - Result should be PEGI 3 / Everyone / 12+ depending on region.
4. **Target audience and content**
   - Target age groups: **18+** only (DressFair is a commerce app).
   - Children appeal: **No**.
5. **News app** — **No**.
6. **COVID-19 contact tracing/status app** — **No**.
7. **Government app** — **No**.
8. **Financial features** — **No** (payments processed by gateways, not DressFair directly).
9. **Health features** — **No**.
10. **Data safety form** — see the matrix in the next section.
11. **Privacy policy URL** — set to the Privacy Policy URL on dressfair.com.
12. **Account deletion** — set the data deletion URL (the page Settings → Delete account opens).

## Data safety matrix

Match the answers below in the Data Safety form (translate "shared" = sent to a 3rd-party server outside DressFair).

| Data type | Collected | Shared | Required | Purpose | Encrypted in transit | Optional to delete |
| --------- | --------- | ------ | -------- | ------- | -------------------- | ------------------ |
| Name | Yes (web checkout/account) | No | Yes | Account management, fulfilment | Yes | Yes |
| Email address | Yes (web checkout/account) | No | Yes | Account management, customer support | Yes | Yes |
| Phone number | Yes (web checkout/account) | No | Yes | Order communication, fulfilment | Yes | Yes |
| Physical address | Yes (web checkout) | No | Yes | Fulfilment | Yes | Yes |
| User payment info | Processed by gateway | Yes (Tap / HyperPay / Tabby / Tamara — pick what is live) | Yes for purchases only | Purchase processing | Yes | N/A — gateway-side |
| Purchase history | Yes (web account) | No | No | Account management | Yes | Yes |
| App interactions / web analytics | Only if dressfair.com analytics is on | Yes (Google Analytics, if active) | No | Analytics, app functionality | Yes | Yes |
| Device or other IDs (push token) | Yes | Yes (FCM/APNs via Expo) | No | Push notifications | Yes | Yes |
| Crash logs / diagnostics | No (no Crashlytics/Sentry yet) | No | — | — | — | — |

Notes:
- Auth token: stored on-device only (Keychain/Keystore via expo-secure-store). It is **not** "collected" in Play's sense — do not declare it.
- All collected data must support user-requested deletion → point to the Account Deletion URL.

## Store listing

In Play Console → **Store presence** → **Main store listing** (designer fills the visuals; copy below is filled now):

| Field | Value |
| ----- | ----- |
| App name | DressFair |
| Short description (≤ 80 chars) | Modest fashion shopping for women across the GCC. |
| Full description | (See `docs/store-listing-template.md` body for the long form.) |
| App icon (512×512) | designer |
| Feature graphic (1024×500) | designer |
| Phone screenshots (2–8) | designer |
| App category | Shopping |
| Tags | Fashion, Shopping, Online Store |
| Contact email | support@dressfair.com |
| Contact website | https://www.dressfair.com |
| Default language | English (United States) |

## Build the AAB (EAS-managed signing)

```bash
npm run lint && npm run typecheck && npm run test
npx eas build -p android --profile production
```

Download the **`.aab`** from the EAS build page when it finishes.

## Internal testing track

1. **Testing** → **Internal testing** → **Create new release**.
2. Upload the **AAB**.
3. Release name `1.0.0 (vc<n>) — internal-1`.
4. Release notes (English):
   ```
   First internal release of the DressFair shopping app.
   Browse the full storefront, log in to your account, place orders, and
   receive notifications about your purchases.
   ```
5. **Save** → **Review release** → **Start rollout to Internal testing**.
6. **Testers** tab: add the team Google Group or email list. Copy the **opt-in URL** and share it.

## Optional: submit from CLI

Requires a Google Play **service account** JSON key linked in Play Console (**API access**), then configure EAS interactively the first time:

```bash
npx eas submit -p android --latest --profile production
```

Profile `production` in `eas.json` submits to the **internal** track by default.

If you see `Google Service Account Keys cannot be set up in --non-interactive mode`, run the same command **without** `--non-interactive` locally and follow the prompts, or upload the AAB manually in Play Console (recommended for the first release).

## Latest production build (reference)

- Build: [expo.dev build `36c18795-5d44-4a4b-bf0b-153081d2c458`](https://expo.dev/accounts/dressfair/projects/dressfair-rn-hybrid/builds/36c18795-5d44-4a4b-bf0b-153081d2c458) — version 1.0.0, versionCode 6.
- AAB direct link (rotates): https://expo.dev/artifacts/eas/7LaG2KygTv7tGPXfpXNB7h.aab

## Next uploads

- Run `npx eas build -p android --profile production` again.
- `eas.json` uses `autoIncrement` for Android version code on production builds.
- Bump `expo.version` in `app.json` when you want a new user-facing version string (e.g. `1.0.1`).

## Backup

In **Expo** → Project → **Credentials**, export/securely store the Android upload keystore backup per team policy.
