# App Store Connect — first iOS submission

Companion to `docs/play-console-internal-checklist.md`. Run this in parallel with
the EAS iOS build so the build has somewhere to land when it finishes.

## 0. Prerequisites

- Active **Apple Developer Program** membership for the team that owns
  `com.dressfair.dressfairrnhybrid`.
- Two-factor authentication on the Apple ID used for signing.
- App icon + screenshots from the designer (placeholder icon will fail
  validation, but you can fill all the metadata first and add icon/screenshots
  before submission).

## 1. EAS iOS credentials (one-time, must run interactively)

The non-interactive cloud build cannot create a Distribution Certificate on
your behalf. Run this once locally:

```bash
npx eas-cli credentials
```

In the prompts:
1. Platform → **iOS**.
2. Project → `dressfair-rn-hybrid`.
3. Build profile → **production**.
4. Action → **Set up a new Distribution Certificate**.
5. Sign in with your Apple ID + 2FA when prompted.
6. Action → **Set up a new Provisioning Profile** (App Store distribution).

After this finishes, kick off the build:

```bash
npx eas-cli build -p ios --profile production
```

The first iOS build runs `expo prebuild` on the EAS worker (no local
`ios/` folder needed) and produces an `.ipa`.

## 2. Create the App in App Store Connect

App Store Connect → **My Apps** → **+** → **New App**.

| Field | Value |
| ----- | ----- |
| Platforms | iOS |
| Name | DressFair |
| Primary language | English (U.S.) |
| Bundle ID | `com.dressfair.dressfairrnhybrid` (must match `app.json`) |
| SKU | `dressfair-rn-hybrid` |
| User Access | Full Access |

If the Bundle ID is missing in the dropdown, register it first at
[developer.apple.com → Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list).

## 3. App Information

App Store Connect → app → **App Information**:

- Subtitle: **Modest fashion, delivered.**
- Category: Primary **Shopping**, Secondary **Lifestyle** (optional).
- Content rights: **Yes**, this app contains, shows, or accesses third-party content (the dressfair.com storefront).
- Age rating: open the questionnaire, all "None" → result **4+**.
- Privacy policy URL: https://www.dressfair.com/privacy
- Support URL: https://www.dressfair.com/contact
- Marketing URL (optional): https://www.dressfair.com

## 4. App Privacy

App Store Connect → app → **App Privacy** → **Get Started**.

For every data type in the Play Data Safety matrix that is "Collected": Yes,
declare it here too. Apple's UI is stricter — it asks "Is this data linked to
the user?" → answer **Yes** for everything except crash logs / diagnostics
(we collect none for v1).

| Data type | Collected | Linked | Tracking | Purpose |
| --------- | --------- | ------ | -------- | ------- |
| Name | Yes | Yes | No | App functionality |
| Email Address | Yes | Yes | No | App functionality, Customer support |
| Phone Number | Yes | Yes | No | App functionality |
| Physical Address | Yes | Yes | No | App functionality |
| Purchase History | Yes | Yes | No | App functionality |
| Payment Information | Yes (gateway) | Yes | No | Purchases |
| Device ID (push token) | Yes | Yes | No | App functionality |
| Crash Data / Performance Data | No (no SDK yet) | — | — | — |

Privacy policy URL is the same as in App Information.

If you ever wire a tracking SDK (Meta Pixel, AppsFlyer, etc.) you must add
`NSUserTrackingUsageDescription` in `app.json` `ios.infoPlist`, mark Tracking
**Yes**, and surface the OS prompt at the right moment. Skip for v1.

## 5. Export Compliance

App Store Connect → app → **Pricing & Availability** (or asked at submission):

- Uses Encryption: **No** (we already declared `ITSAppUsesNonExemptEncryption: false` in `app.json`).

## 6. App Review Information

App Store Connect → app version → **App Review Information**:

- First name / last name / phone (with country code) / email of the
  reviewer-facing contact.
- Demo account → reviewer email + password (web account that works on
  dressfair.com).
- Notes:
  ```
  DressFair is a hybrid commerce app: a thin native shell over the
  dressfair.com storefront. Tap "Login" or open Settings to reach the login
  page; use the demo credentials above. After login, the storefront, cart,
  checkout, and order tracking are exercised as on the web. Push
  notifications surface order status updates and (optional) marketing
  messages — opt-in via the dialog after first launch.
  ```

## 7. Pricing & Availability

- Price → **Free**.
- Availability → All territories (or trim to UAE / Oman / Saudi Arabia +
  GCC neighbours if you want a phased rollout).

## 8. Submit the build to TestFlight

Once `npx eas-cli build -p ios --profile production` finishes:

```bash
npx eas-cli submit -p ios --latest --profile production
```

This uploads the `.ipa` to App Store Connect. Apple processes it for ~10–30
minutes, then it appears under **TestFlight** → **iOS Builds**.

In **TestFlight**:
1. Add Internal Testers (App Store Connect users with Developer/Marketer
   roles).
2. The build becomes available in TestFlight after Apple finishes processing.
3. For **External** testers (non-team-members), fill the **Test Information**
   page (first time only) and submit the build for **Beta App Review**
   (~24h).

## 9. Submit for App Review (when v1.0.0 is ready)

Only after smoke tests on a real device pass:

App Store Connect → version 1.0.0 → **Build** → pick the TestFlight build →
fill remaining fields → **Save** → **Add for Review** → **Submit**.

Review usually completes in 24–48h.

## Latest production build (reference)

| Build | Status | Build number | Logs |
| ----- | ------ | ------------ | ---- |
| iOS first build | needs interactive credentials run | _pending_ | _pending_ |

Update this table once the build runs successfully.
