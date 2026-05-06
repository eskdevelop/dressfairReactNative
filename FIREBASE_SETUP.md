# Firebase Setup (Cloud Messaging / Push Notifications)

This app uses Firebase Cloud Messaging (FCM) to deliver push notifications on
both Android and iOS. The runtime is `expo-notifications` — we do **not** use
`@react-native-firebase`. Firebase is wired up purely through config files and
`app.json`; there is no manual Gradle / Podfile editing.

> **Coming from Flutter?** There is no `flutterfire configure` equivalent. You
> manually download two config files from the Firebase Console, drop them into
> the repo root, and EAS Build picks them up during prebuild.

The Firebase project for this app is **`dressfair-react-native`** (project
number `83170068558`). The bundle ID / package name on both platforms is
**`com.dressfair.dressfairrnhybrid`**.

---

## Required local files (committed to this private repo)

These two files live in the repo root and are committed to git:

| File                          | Platform | Where it comes from                                       |
| ----------------------------- | -------- | --------------------------------------------------------- |
| `google-services.json`        | Android  | Firebase Console → Project settings → Your apps → Android |
| `GoogleService-Info.plist`    | iOS      | Firebase Console → Project settings → Your apps → iOS     |

Per [Firebase docs](https://firebase.google.com/docs/projects/learn-more#config-files-objects),
these files do **not** contain private secrets — they identify the Firebase
project + bundle ID, and they ship inside every APK/IPA install regardless.
Keeping them in git is the simplest path because EAS Build picks them up
automatically. If your repo ever goes public, switch to EAS file env vars
([docs](https://docs.expo.dev/eas/environment-variables/#file-environment-variables)).

`app.json` references both via `android.googleServicesFile` and `ios.googleServicesFile`.
EAS Build copies them into the regenerated native projects during prebuild —
no Gradle / Podfile edits are required.

The **real** Firebase secret is the **APNs Auth Key (`.p8`)** from Apple
Developer Portal. That stays out of the repo (gitignored via `*.p8`) and
lives only in Firebase Console + your local `~/Documents/Keys/Apple/` backup.

---

## First-time setup

### 1. Register the Android app in Firebase Console

1. Open the [Firebase Console](https://console.firebase.google.com/project/dressfair-react-native/overview) for `dressfair-react-native`.
2. Click **Add app** → Android.
3. Android package name: `com.dressfair.dressfairrnhybrid` (must match `app.json` `android.package` exactly).
4. App nickname: `DressFair Android`.
5. SHA-1: leave blank (only needed for Google Sign-In, which we don't use).
6. Download `google-services.json` and save it to the repo root.
7. **Skip Step 3 ("Add Firebase SDK") and Step 4 ("Run app to verify").** Those
   are for native Android Studio projects — Expo wires the Gradle plugin
   automatically during prebuild. Click **"Continue to console"** and you're
   done.

### 2. Register the iOS app in Firebase Console

1. Click **Add app** → iOS.
2. iOS bundle ID: `com.dressfair.dressfairrnhybrid` (must match `app.json` `ios.bundleIdentifier`).
3. App nickname: `DressFair iOS`.
4. Download `GoogleService-Info.plist` and save it to the repo root.
5. Skip the Xcode integration steps (Expo prebuild handles them).
6. Once placed, add the iOS reference to `app.json`:
   ```json
   "ios": {
     ...
     "googleServicesFile": "./GoogleService-Info.plist",
     ...
   }
   ```

### 3. Upload the APNs Auth Key (iOS only — required)

Firebase delivers iOS pushes by relaying through Apple's APNs servers. Without
this key, **iOS notifications will never arrive**, even though your iOS app is
registered.

1. Go to the [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list).
2. Certificates, Identifiers & Profiles → **Keys** → "+" button.
3. Tick **"Apple Push Notifications service (APNs)"** → Continue → Register.
4. Download the `.p8` file (you can only download it once — keep it safe).
5. Note the **Key ID** (10 chars, shown next to the key) and your **Team ID**
   (top-right of the Apple Developer page).
6. In Firebase Console → ⚙️ Project settings → **Cloud Messaging** tab → under
   "Apple app configuration" → **Upload** the `.p8` and paste the Key ID +
   Team ID.

### 4. Install dependencies and rebuild

After dropping the config files in place, you must produce a new native build —
Expo Go does not include FCM:

```bash
npm install
npx eas-cli build --profile development --platform android
# and / or
npx eas-cli build --profile preview --platform ios
```

Install the resulting build on a **real device** (not a simulator — APNs and
FCM only work on real hardware). Open the app, accept the notification
permission prompt, and watch for the `push_token_registered` analytics event.
At that point the device is fully registered with FCM.

---

## Sending your first general notification

For broadcast-style ("everyone gets it") notifications, the easiest path is the
Firebase Console composer — no backend code required.

1. Firebase Console → **Engage** → **Messaging** → **New campaign** →
   **Notifications**.
2. Title + body (e.g. "New arrivals just dropped" / "Tap to browse the latest").
3. Target: choose your app (`DressFair Android` and / or `DressFair iOS`),
   audience **All users**.
4. Schedule **Now** → **Review** → **Publish**.

Before going wide, use **"Send test message"** at the top of the composer. Paste
a single FCM token (logged on first launch via the `push_token_registered`
analytics event, or pulled from your backend's saved tokens) and verify the
notification arrives on that one device.

### Topic-based fan-out (later)

For more targeted broadcasts (e.g. "all users in UAE"), subscribe each device
to a topic on launch and send to that topic from the console. Topic
subscription is not currently wired up in the app — when we need it we will
add a `Notifications.subscribeToTopicAsync` call (via `expo-notifications`'s
new helper, or via `@react-native-firebase/messaging` if needed) inside
`pushRegistration.ts`.

---

## How push tokens flow through the app

1. `AppRoot` mounts → `registerForPushNotifications()` runs (see
   `src/features/notifications/pushRegistration.ts`).
2. We show our own "Stay in the loop" pre-prompt before the OS prompt — this is
   required for Android 13+ runtime permission and recommended by Apple App
   Review.
3. On grant, we call `Notifications.getDevicePushTokenAsync()`. This returns:
   - **Android**: an FCM token (requires `google-services.json`)
   - **iOS**: an APNs token (hex-encoded device token)
4. We POST the token to the OpenCart backend via `apiClient` with
   `action: "savePushToken"`, `pushToken`, `tokenType` (`fcm` / `apns`), and
   `platform`. The backend uses `tokenType` to route through the right Firebase
   server SDK when sending pushes.
5. Inbound notifications flow through `notificationRuntime.ts` — foreground
   arrivals are archived to the local inbox, taps record as read and deep-link
   into the WebView.

---

## Troubleshooting

| Symptom                                                           | Fix                                                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Build fails with `File ./google-services.json does not exist`     | Re-download the file from Firebase Console and place it in the repo root.           |
| `push_device_token_unavailable` event on Android                  | `google-services.json` missing or package name mismatch with `app.json`.            |
| iOS push permission granted but notifications never arrive        | APNs Auth Key not uploaded to Firebase, or wrong Team ID / Key ID.                  |
| `expo-notifications` warns "Push notifications are unsupported"   | You're on Expo Go. Run an EAS development or preview build instead.                 |
| Notifications work in dev but not in TestFlight / production      | Ensure the same APNs Auth Key is uploaded for the production team / app identifier. |
